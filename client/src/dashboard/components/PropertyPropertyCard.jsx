import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MapPin,
  IndianRupee,
  Bed,
  Bath,
  Ruler,
  X,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
} from "lucide-react";
import { FaWallet } from "react-icons/fa";
import { SiPhonepe, SiMobx } from "react-icons/si";

const TextInput = ({ type = "text", placeholder, value, onChange }) => (
  <input
    type={type}
    placeholder={placeholder}
    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={value}
    onChange={onChange}
    required
  />
);

const MyPropertyCard = ({ property }) => {
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [propertyImages, setPropertyImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [paymentSummary, setPaymentSummary] = useState(null);

  const userDataString = sessionStorage.getItem("userData");
  const parsedUserData = userDataString ? JSON.parse(userDataString) : null;
  const user_id = parsedUserData?.userData?.data?.id;
  const property_id = property.id;

  // Calculate payment amount based on property price
  const calculatePaymentAmount = () => {
    if (!property.price) return 0;

    // If property price is greater than 10 lakh (1,000,000), deposit is fixed at 1 lakh (100,000)
    if (property.price > 1000000) {
      return 100000;
    }

    // Otherwise, deposit is 10% of property price
    return Math.round(property.price * 0.1);
  };

  const paymentAmount = calculatePaymentAmount();

  // Load Razorpay checkout script dynamically
  useEffect(() => {
    const loadRazorpayScript = async () => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => {
          resolve(true);
        };
        document.body.appendChild(script);
      });
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
  }, []);

  useEffect(() => {
    const fetchPaymentProp = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/payment/check?user_id=${user_id}&property_id=${property_id}`
        );
        const result = await response.json();
        setIsPaid(result.success);
        if (result.success && result.data) {
          setPaymentSummary(result.data.payment_summary);
        }
      } catch (error) {
        console.error("Error fetching payment info:", error);
      }
    };

    if (user_id && property_id) {
      fetchPaymentProp();
    }

    // Fetch property images
    if (property.id) {
      fetchPropertyImages(property.id);
    }
  }, [user_id, property_id, property.id]);

  const fetchPropertyImages = async (propertyId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/properties/${propertyId}/images`
      );
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setPropertyImages(result.data);
      }
    } catch (error) {
      console.error("Error fetching property images:", error);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) {
      return "0";
    }
    return amount.toLocaleString("en-IN");
  };

  const handlePayment = () => {
    setShowPayment(true);
    setError("");
    setSuccess("");
    initiateRazorpayPayment();
  };

  // Handle image path - add server base URL if it's a server path
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Check if the image path is a full URL
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // Otherwise, prepend the server base URL
    return `http://localhost:3000/${imagePath}`;
  };

  // Create array of all available property images
  const getAllImages = () => {
    let images = [];

    // First add the primary image if it exists
    const primaryImage = property.image
      ? { image_path: property.image, is_primary: true }
      : null;

    // Then add all property images
    if (propertyImages.length > 0) {
      images = [...propertyImages];
    } else if (primaryImage) {
      images = [primaryImage];
    }

    // Limit to 5 images
    return images.slice(0, 5);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    if (getAllImages().length > 0) {
      setCurrentImageIndex((prev) =>
        prev === getAllImages().length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (getAllImages().length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? getAllImages().length - 1 : prev - 1
      );
    }
  };

  // Determine which image to display
  const getCurrentImage = () => {
    const images = getAllImages();
    // If property images are loaded and there are some
    if (images.length > 0) {
      return getImageUrl(images[currentImageIndex].image_path);
    }
    return null;
  };

  // Initiate Razorpay payment
  const initiateRazorpayPayment = async () => {
    try {
      setLoading(true);
      setError("");

      // Step 1: Create Razorpay order
      console.log("Creating Razorpay order with data:", {
        amount: paymentAmount,
        currency: "INR",
        user_id: user_id,
        property_id: property_id,
        is_deposit: true,
      });

      const orderResponse = await axios.post(
        "http://localhost:3000/api/payment/create-order",
        {
          amount: paymentAmount,
          currency: "INR",
          user_id: user_id,
          property_id: property_id,
          is_deposit: true,
        }
      );

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || "Failed to create order");
      }

      const { order_id, amount, currency } = orderResponse.data;

      console.log(`Initiating Razorpay payment for order ${order_id}`);

      // Step 2: Initialize Razorpay checkout
      const options = {
        key: "rzp_test_rJXMnKu99AjJJz", // Hardcoded Razorpay test key ID
        amount: amount,
        currency: currency,
        name: "Property Payment",
        description:
          property.price > 1000000
            ? `₹1 Lakh Deposit for Property: ${property.name}`
            : `10% Deposit for Property: ${property.name}`,
        order_id: order_id,
        handler: async function (response) {
          try {
            console.log("Payment successful, verifying with server:", response);

            // Validate that we have all the required fields from Razorpay
            if (
              !response.razorpay_order_id ||
              !response.razorpay_payment_id ||
              !response.razorpay_signature
            ) {
              setError(
                "Missing payment details from Razorpay. Please try again."
              );
              setLoading(false);
              return;
            }

            // Verify payment on server
            const verifyResponse = await axios.post(
              "http://localhost:3000/api/payment/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            console.log("Verification response:", verifyResponse.data);

            if (!verifyResponse.data.success) {
              setError("Payment verification failed. Please try again.");
              setLoading(false);
              return;
            }

            // Step 3: Save payment details
            const paymentData = {
              user_id: user_id,
              property_id: property_id,
              total_price: property.price,
              amount_paid: paymentAmount,
              payment_method: "razorpay",
              payment_details: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
              status: "completed",
              is_deposit: true,
            };

            console.log("Saving payment data:", paymentData);

            const paymentResponse = await axios.post(
              "http://localhost:3000/api/payment",
              paymentData
            );

            console.log("Payment save response:", paymentResponse.data);

            if (paymentResponse.data.success) {
              setSuccess("Payment successful! 🎉");
              setIsPaid(true);
              setShowPayment(false);

              // Refresh payment data
              const refreshResponse = await fetch(
                `http://localhost:3000/api/payment/check?user_id=${user_id}&property_id=${property_id}`
              );
              const refreshResult = await refreshResponse.json();
              if (refreshResult.success && refreshResult.data) {
                setPaymentSummary(refreshResult.data.payment_summary);
              }
            } else {
              setError("Payment recorded but verification failed.");
            }
            setLoading(false);
          } catch (err) {
            console.error("Error processing Razorpay payment:", err);
            setError(
              "Error processing payment: " +
                (err?.response?.data?.message || err.message || "Unknown error")
            );
            setLoading(false);
          }
        },
        prefill: {
          name: parsedUserData?.userData?.data?.name || "",
          email: parsedUserData?.userData?.data?.email || "",
          contact: parsedUserData?.userData?.data?.contact || "",
        },
        notes: {
          property_id: property_id,
          user_id: user_id,
        },
        theme: {
          color: "#3B82F6",
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal dismissed");
            setError("Payment cancelled. You can try again when ready.");
            setLoading(false);
            setShowPayment(false);
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
    } catch (err) {
      console.error("Payment submission error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Payment processing failed. Please try again later."
      );
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl flex flex-col">
        <div className="relative">
          {property.image || propertyImages.length > 0 ? (
            <div className="relative">
              <img
                src={getCurrentImage()}
                alt={property.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  console.error("Error loading property image");
                  e.target.onerror = null;
                  e.target.src = "";
                  e.target.parentNode.innerHTML = `
                    <div class="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <ImageIcon size={48} className="text-gray-400" />
                    </div>
                  `;
                }}
              />

              {/* Navigation arrows - only show if multiple images */}
              {getAllImages().length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Image counter */}
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
                    {currentImageIndex + 1} / {getAllImages().length}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <ImageIcon size={48} className="text-gray-400" />
            </div>
          )}
          {property.tag && (
            <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              {property.tag}
            </span>
          )}
        </div>

        <div className="p-4 flex-grow">
          <h2 className="text-lg font-semibold text-gray-900">
            {property.name}
          </h2>
          <p className="text-gray-500 flex items-center gap-1 text-sm">
            <MapPin size={14} /> {property.location}
          </p>
          <p className="text-blue-500 flex items-center gap-1 font-semibold mt-2">
            <IndianRupee size={16} /> ₹{formatCurrency(property.price)}
          </p>
          <div className="flex justify-between mt-3 text-gray-600 text-sm border-t pt-4">
            <span className="flex items-center gap-1">
              <Bed size={14} /> {property.bedrooms} Beds
            </span>
            <span className="flex items-center gap-1">
              <Bath size={14} /> {property.bathrooms} Baths
            </span>
            <span className="flex items-center gap-1">
              <Ruler size={14} /> {property.area} sq.ft
            </span>
          </div>

          {/* Payment Summary (if paid) */}
          {isPaid && paymentSummary && (
            <div className="mt-3 p-2 bg-gray-50 rounded-md text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Paid:</span>
                <span className="font-medium text-green-600">
                  ₹{formatCurrency(paymentSummary.total_paid)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending:</span>
                <span className="font-medium text-amber-600">
                  ₹{formatCurrency(paymentSummary.pending_amount)}
                </span>
              </div>
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${paymentSummary.percentage_paid}%` }}
                  ></div>
                </div>
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-500">
                    {paymentSummary.percentage_paid}% paid
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 pt-0 flex justify-end">
          {!isPaid && (
            <button
              onClick={handlePayment}
              disabled={loading}
              className={`${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } text-white px-4 py-2 text-sm rounded-lg shadow-md transition-all flex items-center`}
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  {property.price > 1000000
                    ? `Pay ₹1 Lakh Now (₹${formatCurrency(paymentAmount)})`
                    : `Pay 10% Now (₹${formatCurrency(paymentAmount)})`}
                </>
              )}
            </button>
          )}
          {isPaid && (
            <p className="text-green-600 font-semibold text-sm flex items-center">
              <Check size={16} className="mr-1" /> Payment Completed
            </p>
          )}
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-50 text-red-700 p-3 rounded-md shadow-lg flex items-center animate-fadeIn z-50">
          <AlertCircle className="mr-2 h-5 w-5" />
          {error}
          <button
            className="ml-3 text-red-500 hover:text-red-700"
            onClick={() => setError("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Success notification */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-50 text-green-700 p-3 rounded-md shadow-lg flex items-center animate-fadeIn z-50">
          <Check className="mr-2 h-5 w-5" />
          {success}
          <button
            className="ml-3 text-green-500 hover:text-green-700"
            onClick={() => setSuccess("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
};

export default MyPropertyCard;
