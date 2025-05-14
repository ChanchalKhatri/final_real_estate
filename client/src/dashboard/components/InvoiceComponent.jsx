import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Download,
  FileText,
  IndianRupee,
  AlertCircle,
  Info,
  RefreshCw,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const InvoiceComponent = ({ userId }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [debug, setDebug] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      console.log(`Fetching payments for user ID: ${userId}`);
      setDebug(`Attempting to fetch payments for userId: ${userId}`);

      const response = await axios.get(
        `http://localhost:3000/api/payment/user-all/${userId}`
      );

      console.log("Payment API response:", response.data);

      if (response.data.success) {
        setPayments(response.data.payments || []);
        setError(null);
      } else {
        console.error("API returned error:", response.data);
        setError(response.data.message || "Failed to fetch payment history");
        setDebug(`API error: ${JSON.stringify(response.data)}`);
      }
    } catch (err) {
      console.error("Error fetching payment history:", err);
      setError("Failed to load payment history. Please try again later.");
      setDebug(
        `Error: ${err.message}, Response: ${
          err.response?.data
            ? JSON.stringify(err.response.data)
            : "No response data"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Skip if no userId
    if (!userId) {
      setError("User ID is not available. Please log in again.");
      setLoading(false);
      setDebug(`userId: ${userId}, type: ${typeof userId}`);
      return;
    }

    fetchPayments();
  }, [userId]);

  const fetchInvoiceDetails = async (paymentId) => {
    try {
      setLoading(true);
      console.log(`Fetching invoice for payment ID: ${paymentId}`);

      const response = await axios.get(
        `http://localhost:3000/api/payment/invoice/${paymentId}`
      );

      if (response.data.success) {
        setInvoiceDetails(response.data.invoice);
        setSelectedInvoice(paymentId);
        setError(null);
      } else {
        console.error("API returned error:", response.data);
        setError(response.data.message || "Failed to fetch invoice details");
      }
    } catch (err) {
      console.error("Error fetching invoice:", err);
      setError("Failed to load invoice. Please try again later.");
      setDebug(
        `Error: ${err.message}, Response: ${
          err.response?.data
            ? JSON.stringify(err.response.data)
            : "No response data"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return "N/A";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  const generatePDF = () => {
    if (!invoiceDetails) return;

    // Create a new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // Add logo or header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 62, 80);
    doc.text("INVOICE", pageWidth / 2, 20, { align: "center" });

    // Add invoice number
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(52, 152, 219);
    doc.text(
      `Invoice #: ${invoiceDetails.invoice_number || "N/A"}`,
      pageWidth / 2,
      28,
      { align: "center" }
    );

    // Add company details
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 62, 80);
    doc.text("HomeConnect", margin, 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Kalidas Market, Malkapur, Karad", margin, 45);
    doc.text("Email: info@homeconnect.com", margin, 50);
    doc.text("Phone: +91 9890571672", margin, 55);

    // Add client details
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("BILLED TO:", pageWidth - margin, 40, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(invoiceDetails.user_name || "Client", pageWidth - margin, 45, {
      align: "right",
    });
    doc.text(
      invoiceDetails.email || "client@example.com",
      pageWidth - margin,
      50,
      { align: "right" }
    );
    doc.text(
      `Date: ${formatDate(invoiceDetails.payment_date)}`,
      pageWidth - margin,
      55,
      { align: "right" }
    );

    // Add property details section title
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 62, 80);
    doc.text("Property Details", margin, 70);

    // Property details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Property: ${
        invoiceDetails.property_name ||
        "Property #" + invoiceDetails.property_id
      }`,
      margin,
      80
    );
    doc.text(`Location: ${invoiceDetails.location || "N/A"}`, margin, 85);

    // Add apartment-specific details if applicable
    let yPos = 90;
    if (
      invoiceDetails.payment_type === "apartment" &&
      invoiceDetails.unit_details
    ) {
      doc.text(
        `Unit: ${invoiceDetails.unit_details.unit_number || "N/A"}`,
        margin,
        yPos
      );
      yPos += 5;
      doc.text(
        `Floor: ${invoiceDetails.unit_details.floor_number || "N/A"}`,
        margin,
        yPos
      );
      yPos += 5;
      doc.text(
        `Specifications: ${
          invoiceDetails.unit_details.bedrooms || "N/A"
        } BR • ${invoiceDetails.unit_details.bathrooms || "N/A"} BA • ${
          invoiceDetails.unit_details.area || "N/A"
        } ft²`,
        margin,
        yPos
      );
      yPos += 5;
      doc.text(`Payment Type: Apartment Booking`, margin, yPos);
      yPos += 10;
    } else {
      doc.text(`Payment Type: Property Purchase`, margin, yPos);
      yPos += 10;
    }

    // Add invoice table
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Details", margin, yPos);
    yPos += 10;

    // Invoice table
    doc.autoTable({
      startY: yPos,
      head: [["Description", "Amount"]],
      body: [
        [
          "Property Price",
          formatCurrency(invoiceDetails.full_property_price || 0),
        ],
        [
          "Required Deposit",
          formatCurrency(invoiceDetails.deposit_amount || 0),
        ],
        ["Amount Paid", formatCurrency(invoiceDetails.total_paid || 0)],
        ["Pending Amount", formatCurrency(invoiceDetails.pending_amount || 0)],
      ],
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { left: margin, right: margin },
    });

    // Get final y position after table
    const tableEndY = doc.lastAutoTable.finalY;

    // Draw progress bar
    const progressBarY = tableEndY + 10;
    const progressBarWidth = pageWidth - margin * 2;
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(220, 220, 220);
    doc.roundedRect(margin, progressBarY, progressBarWidth, 5, 2, 2, "F");

    // Fill progress bar based on percentage
    const percentage = invoiceDetails.percentage_paid || 0;
    const filledWidth = (progressBarWidth * percentage) / 100;
    doc.setFillColor(66, 139, 202);
    if (filledWidth > 0) {
      doc.roundedRect(margin, progressBarY, filledWidth, 5, 2, 2, "F");
    }

    // Add percentage text
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `${percentage}% Paid`,
      margin + progressBarWidth,
      progressBarY + 4,
      { align: "right" }
    );

    // Add footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Thank you for your business. This is a computer-generated document and requires no signature.",
      pageWidth / 2,
      270,
      { align: "center" }
    );

    // Save the PDF
    doc.save(`Invoice-${invoiceDetails.invoice_number || "Receipt"}.pdf`);
  };

  if (loading && !payments.length) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p>Loading payment history...</p>
          {debug && <p className="mt-2 text-xs text-gray-500">{debug}</p>}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="block sm:inline">{error}</span>
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={fetchPayments}
            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
        {debug && (
          <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-800 font-mono overflow-auto max-h-24">
            {debug}
          </div>
        )}
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div
        className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <div className="flex">
          <Info className="h-5 w-5 mr-2" />
          <div>
            <span>No payment history found for this user.</span>
            <p className="mt-2 text-sm">
              Make a payment to see your history here.
            </p>
            {debug && <p className="mt-2 text-xs text-gray-500">{debug}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment History Section */}
        <div className="md:col-span-1 border-r border-gray-200 p-4">
          <h3 className="font-medium text-gray-700 mb-4">Payment History</h3>
          <div className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className={`py-3 cursor-pointer hover:bg-gray-50 transition ${
                  selectedInvoice === payment.id ? "bg-blue-50" : ""
                }`}
                onClick={() => fetchInvoiceDetails(payment.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.property_name ||
                        "Property #" + payment.property_id}
                      {payment.payment_type === "apartment" &&
                        payment.unit_number && (
                          <span className="ml-1 text-blue-600">
                            (Unit {payment.unit_number})
                          </span>
                        )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(payment.payment_date)}
                      {payment.invoice_number && (
                        <span className="ml-1 text-blue-500">
                          #{payment.invoice_number.split("-").pop()}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount_paid)}
                    </p>
                    <p
                      className={`text-xs ${
                        payment.status === "completed"
                          ? "text-green-500"
                          : "text-amber-500"
                      }`}
                    >
                      {payment.payment_type === "apartment"
                        ? "Apartment"
                        : "Property"}{" "}
                      • {payment.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Details Section */}
        <div className="md:col-span-2 p-4">
          {invoiceDetails ? (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">INVOICE</h2>
                    <p className="text-sm font-medium text-blue-600 mt-1">
                      Invoice #: {invoiceDetails.invoice_number || "N/A"}
                    </p>
                  </div>
                  <button
                    className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
                    onClick={generatePDF}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Property Details
                    </h3>
                    <p className="text-sm font-medium text-gray-900">
                      {invoiceDetails.property_name ||
                        "Property #" + invoiceDetails.property_id}
                    </p>
                    <p className="text-sm text-gray-600">
                      {invoiceDetails.location || "No location data"}
                    </p>
                    {invoiceDetails.payment_type === "apartment" &&
                      invoiceDetails.unit_details && (
                        <div className="mt-2 text-sm text-gray-700">
                          <p>Unit: {invoiceDetails.unit_details.unit_number}</p>
                          <p>
                            Floor: {invoiceDetails.unit_details.floor_number}
                          </p>
                          <p>
                            {invoiceDetails.unit_details.bedrooms} BR •{" "}
                            {invoiceDetails.unit_details.bathrooms} BA •{" "}
                            {invoiceDetails.unit_details.area} ft²
                          </p>
                        </div>
                      )}
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Payment Date
                    </h3>
                    <p className="text-sm text-gray-900">
                      {formatDate(invoiceDetails.payment_date)}
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-medium">Payment Type:</span>{" "}
                      {invoiceDetails.payment_type === "apartment"
                        ? "Apartment Booking"
                        : "Property Purchase"}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700">
                      Property Price
                    </h3>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(invoiceDetails.full_property_price)}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700">
                      Required Deposit (10%)
                    </h3>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(invoiceDetails.deposit_amount)}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700">
                      Amount Paid
                    </h3>
                    <p className="text-sm font-medium text-green-600">
                      {formatCurrency(invoiceDetails.total_paid)}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700">
                      Pending Amount
                    </h3>
                    <p className="text-sm font-medium text-amber-600">
                      {formatCurrency(invoiceDetails.pending_amount)}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <h3 className="text-base font-medium text-gray-900">
                      Payment Progress
                    </h3>
                    <div className="flex items-center">
                      <div className="w-48 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{
                            width: `${invoiceDetails.percentage_paid || 0}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {invoiceDetails.percentage_paid || 0}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-amber-600">
                    <IndianRupee className="h-5 w-5 mr-2" />
                    <p className="text-sm font-medium">
                      {(invoiceDetails.pending_amount || 0) > 0
                        ? `Pending Amount: ${formatCurrency(
                            invoiceDetails.pending_amount
                          )}`
                        : "Fully Paid"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FileText className="h-12 w-12 mb-4" />
              <p>Select a payment to view invoice details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceComponent;
