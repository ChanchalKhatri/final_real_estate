import { pool } from "../config/db.js";

export const createApartmentPayment = async (payment) => {
  try {
    // Validate payment using the model
    const validation = payment.validate();
    if (!validation.valid) {
      return {
        success: false,
        message: validation.message,
      };
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Insert payment record
      const [paymentResult] = await connection.query(
        `INSERT INTO payments (
          user_id, 
          property_id, 
          total_price, 
          amount_paid, 
          payment_method, 
          payment_details, 
          status, 
          payment_date,
          invoice_number,
          is_deposit
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
        [
          payment.user_id,
          payment.property_id,
          payment.total_price || null,
          payment.amount_paid,
          payment.payment_method,
          JSON.stringify(payment.payment_details),
          payment.status,
          payment.invoice_number || generateInvoiceNumber("APT"),
          payment.is_deposit ? 1 : 0,
        ]
      );

      const paymentId = paymentResult.insertId;

      // Check if unit_id starts with "fallback-" which indicates it's a demo unit
      const isFallbackUnit = payment.unit_id.toString().startsWith("fallback-");

      if (isFallbackUnit) {
        // For fallback units (demo data), just create the booking record with a note
        await connection.query(
          `INSERT INTO apartment_bookings (
            user_id,
            apartment_id,
            unit_id,
            payment_id,
            booking_date,
            amount,
            status,
            notes
          ) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?)`,
          [
            payment.user_id,
            payment.property_id,
            payment.unit_id.replace("fallback-", ""), // Store without the fallback prefix
            paymentId,
            payment.amount_paid,
            payment.is_deposit ? "deposit_paid" : "confirmed",
            payment.is_deposit ? "10% deposit paid" : "Full payment made",
          ]
        );
      } else {
        // For real units, first check if the unit exists and is available
        const [unitResult] = await connection.query(
          `SELECT * FROM apartment_units WHERE id = ? AND status = 'available'`,
          [payment.unit_id]
        );

        if (unitResult.length === 0) {
          await connection.rollback();
          return {
            success: false,
            message: "Unit is not available for booking",
          };
        }

        // Create the apartment booking
        await connection.query(
          `INSERT INTO apartment_bookings (
            user_id,
            apartment_id,
            unit_id,
            payment_id,
            booking_date,
            amount,
            status,
            notes
          ) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?)`,
          [
            payment.user_id,
            payment.property_id,
            payment.unit_id,
            paymentId,
            payment.amount_paid,
            payment.is_deposit ? "deposit_paid" : "confirmed",
            payment.is_deposit 
              ? `${payment.amount_paid > 100000 ? '₹1 Lakh' : '10%'} deposit paid for apartment unit` 
              : "Full payment made for apartment unit",
          ]
        );

        // Update the unit status to booked or reserved based on payment type
        await connection.query(
          `UPDATE apartment_units SET status = ? WHERE id = ?`,
          [payment.is_deposit ? "reserved" : "booked", payment.unit_id]
        );
        
        // Record apartment booking details such as unit information
        try {
          // Get unit details to include in booking record
          const [unitDetails] = await connection.query(
            `SELECT unit_number, floor_number, bedrooms, bathrooms, area, price 
             FROM apartment_units WHERE id = ?`,
            [payment.unit_id]
          );
          
          if (unitDetails.length > 0) {
            // Update the payment record with specific unit details
            await connection.query(
              `UPDATE payments SET 
                unit_details = ? 
               WHERE id = ?`,
              [
                JSON.stringify(unitDetails[0]),
                paymentId
              ]
            );
          }
        } catch (detailsError) {
          console.error("Error storing unit details:", detailsError);
          // Continue anyway as this is additional info
        }
      }

      await connection.commit();

      return {
        success: true,
        message: payment.is_deposit
          ? "Deposit payment successful"
          : "Full payment successful",
        payment_id: paymentId,
        invoice_number: payment.invoice_number || generateInvoiceNumber("APT"),
      };
    } catch (error) {
      await connection.rollback();
      console.error("Error in apartment payment transaction:", error);
      return {
        success: false,
        message: "Failed to process apartment payment: " + error.message,
      };
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error processing apartment payment:", error);
    return {
      success: false,
      message: "Failed to process apartment payment: " + error.message,
    };
  }
};

export const getApartmentPaymentData = async (
  user_id,
  apartment_id,
  unit_id
) => {
  try {
    console.log(
      `Getting apartment payment data for user_id: ${user_id}, apartment_id: ${apartment_id}, unit_id: ${unit_id}`
    );

    // Get the apartment unit price
    const [unitRows] = await pool.query(
      "SELECT price FROM apartment_units WHERE id = ? AND apartment_id = ?",
      [unit_id, apartment_id]
    );

    if (unitRows.length === 0) {
      return null;
    }

    const unitPrice = parseFloat(unitRows[0].price) || 0;

    // Get all payments made for this unit
    const [paymentRows] = await pool.query(
      `SELECT p.*, ab.status as booking_status 
       FROM payments p
       JOIN apartment_bookings ab ON p.id = ab.payment_id
       WHERE p.user_id = ? AND p.property_id = ? AND ab.unit_id = ?
       ORDER BY p.payment_date`,
      [user_id, apartment_id, unit_id]
    );

    if (paymentRows.length === 0) {
      return {
        payments: [],
        payment_summary: {
          full_unit_price: unitPrice,
          deposit_amount: Math.round(unitPrice * 0.1),
          total_paid: 0,
          pending_amount: unitPrice,
          percentage_paid: 0,
        },
      };
    }

    // Calculate payment statistics
    const payments = paymentRows;

    // Calculate deposit amount (10% of unit price)
    const depositAmount = Math.round(unitPrice * 0.1);

    // Calculate total paid amount
    const totalPaid = payments.reduce(
      (sum, payment) => sum + (parseFloat(payment.amount_paid) || 0),
      0
    );

    // Calculate pending amount
    const pendingAmount = Math.max(0, unitPrice - totalPaid);

    // Calculate percentage paid
    const percentagePaid =
      unitPrice > 0
        ? Math.min(100, Math.round((totalPaid / unitPrice) * 100))
        : 0;

    return {
      payments,
      payment_summary: {
        full_unit_price: unitPrice,
        deposit_amount: depositAmount,
        total_paid: totalPaid,
        pending_amount: pendingAmount,
        percentage_paid: percentagePaid,
      },
    };
  } catch (error) {
    console.error("Error in getApartmentPaymentData:", error);
    throw error;
  }
};

// Generate a unique invoice number for apartments
const generateInvoiceNumber = (prefix = "APT") => {
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

  // Format: PREFIX-YYMMDD-MSSRANDOM
  return `${prefix}-${year}${month}${day}-${milliseconds}${random}`;
};
