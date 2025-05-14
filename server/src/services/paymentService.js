import { pool } from "../config/db.js";

export const createMyPayment = async (payment) => {
  try {
    // Validate payment using the model
    const validation = payment.validate();
    if (!validation.valid) {
      return {
        success: false,
        message: validation.message,
      };
    }

    const query = `INSERT INTO payments 
      (user_id, property_id, total_price, amount_paid, payment_method, payment_details, status, payment_date, invoice_number, is_deposit) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

    const invoiceNumber = payment.invoice_number || generateInvoiceNumber();

    // Ensure no undefined values in payment_details
    const paymentDetails = payment.payment_details || {};

    // Sanitize the payment details to remove any circular references
    // and ensure all fields have appropriate values
    const sanitizedPaymentDetails = {
      card_holder: paymentDetails.card_holder || null,
      card_number: paymentDetails.card_number || null,
      expiry_date: paymentDetails.expiry_date || null,
      cvv: paymentDetails.cvv || null,
      upi_id: paymentDetails.upi_id || null,
      razorpay_payment_id: paymentDetails.razorpay_payment_id || null,
      razorpay_order_id: paymentDetails.razorpay_order_id || null,
      razorpay_signature: paymentDetails.razorpay_signature || null,
    };

    // Handle potential undefined values
    const total_price = payment.total_price || null;
    const is_deposit = payment.is_deposit ? 1 : 0;

    const values = [
      payment.user_id,
      payment.property_id,
      total_price,
      payment.amount_paid,
      payment.payment_method,
      JSON.stringify(sanitizedPaymentDetails),
      payment.status,
      payment.payment_date,
      invoiceNumber,
      is_deposit,
    ];

    // Check for undefined values before executing the query
    const hasUndefined = values.some((value) => value === undefined);
    if (hasUndefined) {
      console.error("Payment values contain undefined:", values);
      return {
        success: false,
        message: "Failed to add payment: Values cannot contain undefined",
      };
    }

    console.log("Executing payment query with values:", {
      user_id: payment.user_id,
      property_id: payment.property_id,
      payment_method: payment.payment_method,
      amount_paid: payment.amount_paid,
      payment_details: sanitizedPaymentDetails,
      is_deposit: is_deposit,
    });

    await pool.execute(query, values);

    // Update property status if it's a deposit payment
    if (payment.is_deposit) {
      try {
        await pool.execute(
          "UPDATE properties SET status = 'reserved' WHERE id = ?",
          [payment.property_id]
        );
        console.log(
          `Updated property ${payment.property_id} status to 'reserved'`
        );
      } catch (updateError) {
        console.error("Error updating property status:", updateError);
        // Continue anyway since the payment was successful
      }
    }

    return {
      success: true,
      message: payment.is_deposit
        ? "Deposit payment successful (10% of property price)"
        : `Payment successful via ${payment.payment_method}`,
      invoice_number: invoiceNumber,
    };
  } catch (error) {
    console.error("Error adding payment: ", error);
    return {
      success: false,
      message: "Failed to add payment: " + error.message,
    };
  }
};

export const getPaymentData = async (user_id, property_id) => {
  try {
    console.log(
      `Getting payment data for user_id: ${user_id}, property_id: ${property_id}`
    );

    // Query the 'payments' table (which is the correct table name)
    let [rows] = await pool.query(
      "SELECT p.*, pr.price as property_price, pr.status as property_status FROM payments p LEFT JOIN properties pr ON p.property_id = pr.id WHERE p.user_id = ? AND p.property_id = ?",
      [user_id, property_id]
    );

    console.log(`Found ${rows.length} payment records`);

    if (rows.length > 0) {
      // Calculate payment statistics
      const payments = rows;

      // The total_price in payment table is 10% of the actual property price
      // Get the full property price (convert string to number if needed)
      let propertyPrice = 0;
      if (payments[0].property_price) {
        // Remove any non-numeric characters (like commas or currency symbols)
        const priceString = payments[0].property_price
          .toString()
          .replace(/[^0-9.]/g, "");
        propertyPrice = parseFloat(priceString) || 0;
      }

      // Calculate deposit amount (10% of property price)
      const depositAmount = Math.round(propertyPrice * 0.1);

      // Calculate total paid amount
      const totalPaid = payments.reduce(
        (sum, payment) => sum + (payment.amount_paid || 0),
        0
      );

      // Calculate the full price and pending amount
      const fullPrice = propertyPrice;
      const pendingAmount = fullPrice - totalPaid;
      const percentagePaid =
        fullPrice > 0 ? Math.round((totalPaid / fullPrice) * 100) : 0;

      return {
        payments,
        payment_summary: {
          full_property_price: fullPrice,
          deposit_amount: depositAmount,
          total_paid: totalPaid,
          pending_amount: pendingAmount,
          percentage_paid: percentagePaid,
          property_status: payments[0].property_status || "unknown",
        },
      };
    }

    return null;
  } catch (error) {
    console.error("Error in getPaymentData:", error);
    throw error; // Re-throw to let the caller handle it
  }
};

// Keep the old function name as an alias for backward compatibility
export const getPyamentData = getPaymentData;

// Generate a unique invoice number
const generateInvoiceNumber = () => {
  // Get current date components
  const date = new Date();
  const year = date.getFullYear().toString().substr(2); // Last 2 digits of year
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month (01-12)
  const day = date.getDate().toString().padStart(2, "0"); // Day (01-31)

  // Use milliseconds to ensure uniqueness
  const milliseconds = date.getMilliseconds().toString().padStart(3, "0");

  // Random 3-digit number for additional uniqueness
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  // Format: INV-YYMMDD-MSSRANDOM
  return `INV-${year}${month}${day}-${milliseconds}${random}`;
};

// Get all payments for a user
export const getUserPayments = async (user_id) => {
  try {
    // Get property payments from the 'payments' table
    const [propertyPayments] = await pool.query(
      `SELECT p.*, pr.name as property_name, pr.location, pr.price, 
       'property' as payment_type
       FROM payments p
       LEFT JOIN properties pr ON p.property_id = pr.id
       WHERE p.user_id = ?`,
      [user_id]
    );

    // Next, get apartment booking payments
    const [apartmentPayments] = await pool.query(
      `SELECT 
        p.id, p.user_id, p.property_id, p.total_price, p.amount_paid, 
        p.payment_method, p.payment_details, p.status, p.payment_date, 
        p.invoice_number,
        apt.name as property_name, apt.location, au.price as price,
        'apartment' as payment_type,
        ab.id as booking_id, au.unit_number
       FROM payments p
       JOIN apartment_bookings ab ON p.id = ab.payment_id
       JOIN apartments apt ON ab.apartment_id = apt.id
       JOIN apartment_units au ON ab.unit_id = au.id
       WHERE p.user_id = ?`,
      [user_id]
    );

    // Combine both payment types
    const allPayments = [...propertyPayments, ...apartmentPayments];

    // Sort by payment date, most recent first
    allPayments.sort((a, b) => {
      return new Date(b.payment_date) - new Date(a.payment_date);
    });

    return {
      success: true,
      payments: allPayments,
    };
  } catch (error) {
    console.error("Error getting user payments: ", error);
    return {
      success: false,
      message: "Failed to get payments",
    };
  }
};

// Get all payments in the system
export const getAllPayments = async () => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, pr.name as property_name, pr.location, pr.price 
       FROM payments p
       LEFT JOIN properties pr ON p.property_id = pr.id
       ORDER BY p.payment_date DESC`
    );

    return {
      success: true,
      payments: rows,
    };
  } catch (error) {
    console.error("Error getting all payments: ", error);
    return {
      success: false,
      message: "Failed to get payments",
    };
  }
};
