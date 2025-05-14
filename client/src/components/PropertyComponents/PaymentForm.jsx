import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  IndianRupee,
  Check,
  AlertCircle,
  Wallet,
  CreditCard,
  Percent,
} from "lucide-react";

const PaymentForm = ({
  propertyId,
  userId,
  propertyPrice,
  isApartment,
  unitId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    contact: "",
  });
  const [formData, setFormData] = useState({
    amount_paid: "",
    payment_method: "razorpay",
    payment_details: {
      card_holder: "",
      card_number: "",
      expiry_date: "",
      cvv: "",
      upi_id: "",
    },
  });
  const [isDepositPayment, setIsDepositPayment] = useState(false);

  // Load Razorpay checkout script dynamically
  useEffect(() => {
    const loadRazorpayScript = async () => {
      if (formData.payment_method === "razorpay") {
        return new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          script.onload = () => {
            resolve(true);
          };
          document.body.appendChild(script);
        });
      }
    };

    loadRazorpayScript();

    // Cleanup function
    return () => {
      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [formData.payment_method]);

  // Fetch user details for prefilling
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/user/${userId}`
        );
        if (response.data.success) {
          setUserDetails({
            name: response.data.user.name || "",
            email: response.data.user.email || "",
            contact: response.data.user.contact || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        // Fallback to empty details
        setUserDetails({ name: "", email: "", contact: "" });
      }
    };
    if (userId) fetchUserDetails();
  }, [userId]);

  // Fetch existing payment summary
  useEffect(() => {
    if (propertyId && userId) {
      const fetchPaymentSummary = async () => {
        try {
          const response = await axios.get(
            `http://localhost:3000/api/payment/check?user_id=${userId}&property_id=${propertyId}`
          );
          if (response.data.success && response.data.data) {
            setPaymentSummary(response.data.data.payment_summary);
          }
        } catch (error) {
          console.error("Error fetching payment summary:", error);
          setError("Failed to load payment summary. Please try again.");
        }
      };
      fetchPaymentSummary();
    }
  }, [propertyId, userId]);

  // Calculate deposit amount based on property price
  const calculateDepositAmount = () => {
    if (!propertyPrice) return 0;

    // If property price is greater than 10 lakh (1,000,000), deposit is fixed at 1 lakh (100,000)
    if (propertyPrice > 1000000) {
      return 100000;
    }

    // Otherwise, deposit is 10% of property price
    return Math.round(propertyPrice * 0.1);
  };

  // When deposit option is toggled, update the amount
  useEffect(() => {
    if (isDepositPayment) {
      const depositAmount = calculateDepositAmount();
      setFormData((prev) => ({
        ...prev,
        amount_paid: depositAmount.toString(),
      }));
    }
  }, [isDepositPayment, propertyPrice]);

  // Force razorpay for apartment bookings
  useEffect(() => {
    if (isApartment) {
      setFormData((prev) => ({
        ...prev,
        payment_method: "razorpay",
      }));
    }
  }, [isApartment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      payment_details: {
        ...formData.payment_details,
        [name]: value,
      },
    });
  };

  // Validate form
  const validateForm = () => {
    if (!formData.amount_paid || parseFloat(formData.amount_paid) <= 0) {
      setError("Please enter a valid payment amount");
      return false;
    }

    // For apartment bookings, only allow Razorpay
    if (isApartment && formData.payment_method !== "razorpay") {
      setError("Only Razorpay payment is available for apartment bookings");
      return false;
    }

    // For non-apartment bookings, validate based on payment method
    if (!isApartment) {
      if (formData.payment_method === "credit_card") {
        if (!formData.payment_details.card_holder.trim()) {
          setError("Card holder name is required");
          return false;
        }
        if (
          !formData.payment_details.card_number.trim() ||
          formData.payment_details.card_number.length < 16
        ) {
          setError("Please enter a valid card number");
          return false;
        }
        if (
          !formData.payment_details.expiry_date.trim() ||
          !formData.payment_details.expiry_date.includes("/")
        ) {
          setError("Please enter a valid expiry date (MM/YY)");
          return false;
        }
        if (
          !formData.payment_details.cvv.trim() ||
          formData.payment_details.cvv.length < 3
        ) {
          setError("Please enter a valid CVV");
          return false;
        }
      } else if (formData.payment_method === "upi") {
        if (
          !formData.payment_details.upi_id.trim() ||
          !formData.payment_details.upi_id.includes("@")
        ) {
          setError("Please enter a valid UPI ID");
          return false;
        }
      }
    }

    return true;
  };

  // Reset form after successful payment
  const resetForm = () => {
    setFormData({
      amount_paid: "",
      payment_method: "razorpay",
      payment_details: {
        card_holder: "",
        card_number: "",
        expiry_date: "",
        cvv: "",
        upi_id: "",
      },
    });
  };

  // Refresh payment summary
  const refreshPaymentSummary = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/payment/check?user_id=${userId}&property_id=${propertyId}`
      );
      if (response.data.success && response.data.data) {
        setPaymentSummary(response.data.data.payment_summary);
      }
    } catch (error) {
      console.error("Error refreshing payment summary:", error);
      setError("Failed to refresh payment summary. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    // Force razorpay for apartment bookings
    if (isApartment && formData.payment_method !== "razorpay") {
      setFormData((prev) => ({
        ...prev,
        payment_method: "razorpay",
      }));
      setError("Only Razorpay payment is available for apartment bookings.");
      return;
    }

    try {
      setLoading(true);

      if (formData.payment_method === "razorpay") {
        // Step 1: Create Razorpay order
        const orderResponse = await axios.post(
          "http://localhost:3000/api/payment/create-order",
          {
            amount: parseFloat(formData.amount_paid),
            currency: "INR",
            user_id: userId,
            property_id: propertyId,
            is_deposit: isDepositPayment,
            is_apartment: isApartment,
            unit_id: isApartment ? unitId : undefined,
          }
        );

        if (!orderResponse.data.success) {
          throw new Error(
            orderResponse.data.message || "Failed to create order"
          );
        }

        const { order_id, amount, currency } = orderResponse.data;

        // Display a notification about the payment process
        setSuccess(false);
        setError(null);
        console.log(`Initiating Razorpay payment for order ${order_id}`);

        // Step 2: Initialize Razorpay checkout
        const options = {
          key: "rzp_test_rJXMnKu99AjJJz", // Hardcoded Razorpay test key ID
          amount: amount,
          currency: currency,
          name: "Property Payment",
          description: isDepositPayment
            ? `10% Deposit for Property ID: ${propertyId}`
            : `Full Payment for Property ID: ${propertyId}`,
          order_id: order_id,
          handler: async function (response) {
            try {
              // Verify payment on server
              const verifyResponse = await axios.post(
                "http://localhost:3000/api/payment/verify-payment",
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }
              );

              if (!verifyResponse.data.success) {
                setError("Payment verification failed. Please try again.");
                setLoading(false);
                return;
              }

              // Step 3: Save payment details
              const paymentData = {
                user_id: userId,
                property_id: propertyId,
                total_price: propertyPrice,
                amount_paid: parseFloat(formData.amount_paid),
                payment_method: "razorpay",
                payment_details: {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                },
                status: "completed",
                is_deposit: isDepositPayment,
                is_apartment: isApartment,
                unit_id: isApartment ? unitId : undefined,
              };

              const paymentResponse = await axios.post(
                "http://localhost:3000/api/payment",
                paymentData
              );

              if (paymentResponse.data.success) {
                setSuccess(true);
                resetForm();
                await refreshPaymentSummary();
                onSuccess();
              } else {
                setError("Payment recorded but verification failed.");
              }
              setLoading(false);
            } catch (err) {
              console.error("Error processing Razorpay payment:", err);
              setError(
                "Error processing payment: " + (err.message || "Unknown error")
              );
              setLoading(false);
            }
          },
          prefill: {
            name: userDetails.name || "",
            email: userDetails.email || "",
            contact: userDetails.contact || "",
          },
          notes: {
            property_id: propertyId,
            user_id: userId,
          },
          theme: {
            color: "#3B82F6",
          },
          modal: {
            ondismiss: function () {
              console.log("Payment modal dismissed");
              setError("Payment cancelled. You can try again when ready.");
              setLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          console.error("Razorpay payment failed:", response.error);
          setError(`Payment failed: ${response.error.description}`);
          setLoading(false);
        });

        rzp.open();
      } else {
        // Handle credit_card or upi payment
        const paymentData = {
          user_id: userId,
          property_id: propertyId,
          total_price: propertyPrice,
          amount_paid: parseFloat(formData.amount_paid),
          payment_method: formData.payment_method,
          payment_details: {
            card_holder: formData.payment_details.card_holder || null,
            card_number: formData.payment_details.card_number || null,
            expiry_date: formData.payment_details.expiry_date || null,
            cvv: formData.payment_details.cvv || null,
            upi_id: formData.payment_details.upi_id || null,
          },
          status: "completed",
          is_deposit: isDepositPayment,
          is_apartment: isApartment,
          unit_id: isApartment ? unitId : undefined,
        };

        const paymentResponse = await axios.post(
          "http://localhost:3000/api/payment",
          paymentData
        );

        if (paymentResponse.data.success) {
          setSuccess(true);
          resetForm();
          await refreshPaymentSummary();
          onSuccess();
        } else {
          setError(paymentResponse.data.message || "Payment failed.");
        }
      }
    } catch (err) {
      console.error("Payment submission error:", err);
      setError(
        err.response?.data?.message ||
          "Payment processing failed. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Make a Payment
      </h2>

      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
          <Check className="h-5 w-5 mr-2" />
          <span>Payment successful! Invoice has been generated.</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={isDepositPayment}
              onChange={(e) => setIsDepositPayment(e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600"
            />
            <span className="text-sm font-medium flex items-center">
              <Percent className="h-4 w-4 mr-1 text-blue-500" />
              {propertyPrice > 1000000
                ? `Pay ₹1 Lakh Deposit (${formatCurrency(
                    calculateDepositAmount()
                  )})`
                : `Pay 10% Deposit (${formatCurrency(
                    calculateDepositAmount()
                  )})`}
            </span>
          </label>

          <label
            htmlFor="amount_paid"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Payment Amount *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IndianRupee className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="amount_paid"
              name="amount_paid"
              value={formData.amount_paid}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter amount"
              step="0.01"
              min="0"
              required
              disabled={loading || isDepositPayment}
            />
          </div>
        </div>

        {isApartment ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <div className="grid grid-cols-1 gap-2 mb-3">
              <div>
                <input
                  type="radio"
                  id="razorpay"
                  name="payment_method"
                  value="razorpay"
                  checked={true}
                  className="sr-only"
                  disabled={loading}
                />
                <label
                  htmlFor="razorpay"
                  className={`block p-3 border rounded-md text-center cursor-pointer bg-blue-50 border-blue-500 text-blue-700 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Wallet className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-sm">Razorpay</span>
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <input
                  type="radio"
                  id="razorpay"
                  name="payment_method"
                  value="razorpay"
                  checked={formData.payment_method === "razorpay"}
                  onChange={handleChange}
                  className="sr-only"
                  disabled={loading}
                />
                <label
                  htmlFor="razorpay"
                  className={`block p-3 border rounded-md text-center cursor-pointer ${
                    formData.payment_method === "razorpay"
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Wallet className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-sm">Razorpay</span>
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  id="credit_card"
                  name="payment_method"
                  value="credit_card"
                  checked={formData.payment_method === "credit_card"}
                  onChange={handleChange}
                  className="sr-only"
                  disabled={loading}
                />
                <label
                  htmlFor="credit_card"
                  className={`block p-3 border rounded-md text-center cursor-pointer ${
                    formData.payment_method === "credit_card"
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <CreditCard className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-sm">Credit Card</span>
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  id="upi"
                  name="payment_method"
                  value="upi"
                  checked={formData.payment_method === "upi"}
                  onChange={handleChange}
                  className="sr-only"
                  disabled={loading}
                />
                <label
                  htmlFor="upi"
                  className={`block p-3 border rounded-md text-center cursor-pointer ${
                    formData.payment_method === "upi"
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Wallet className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-sm">UPI</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Show credit card form only for non-apartment bookings */}
        {formData.payment_method === "credit_card" && !isApartment && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="card_holder"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Card Holder Name
              </label>
              <input
                type="text"
                id="card_holder"
                name="card_holder"
                value={formData.payment_details.card_holder}
                onChange={handleDetailsChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label
                htmlFor="card_number"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Card Number
              </label>
              <input
                type="text"
                id="card_number"
                name="card_number"
                value={formData.payment_details.card_number}
                onChange={handleDetailsChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="XXXX XXXX XXXX XXXX"
                maxLength="19"
                required
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="expiry_date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Expiry Date
                </label>
                <input
                  type="text"
                  id="expiry_date"
                  name="expiry_date"
                  value={formData.payment_details.expiry_date}
                  onChange={handleDetailsChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="MM/YY"
                  maxLength="5"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label
                  htmlFor="cvv"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  CVV
                </label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={formData.payment_details.cvv}
                  onChange={handleDetailsChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123"
                  maxLength="4"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Show UPI form only for non-apartment bookings */}
        {formData.payment_method === "upi" && !isApartment && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="upi_id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                UPI ID
              </label>
              <input
                type="text"
                id="upi_id"
                name="upi_id"
                value={formData.payment_details.upi_id}
                onChange={handleDetailsChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="yourname@upi"
                required
                disabled={loading}
              />
            </div>
            <div className="p-4 bg-blue-50 rounded-md text-blue-700 text-sm">
              Please complete your UPI payment through your UPI app using the ID
              above. Your payment will be confirmed once processed.
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mt-4"
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : isDepositPayment
            ? propertyPrice > 1000000
              ? "Pay ₹1 Lakh Deposit"
              : "Pay 10% Deposit"
            : "Complete Payment"}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;
