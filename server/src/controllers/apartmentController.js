import Apartment from "../models/Apartment.js";
import ApartmentPaymentModel from "../models/apartmentPaymentModel.js";
import { createApartmentPayment } from "../services/apartmentPaymentService.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { pool } from "../config/db.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { config } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../uploads/apartments");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage: storage });

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

// Get all apartments
export const getAllApartments = async (req, res) => {
  try {
    const apartments = await Apartment.findAll();
    res.status(200).json({ success: true, data: apartments });
  } catch (error) {
    console.error("Error fetching apartments:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch apartments" });
  }
};

// Get a single apartment by ID
export const getApartmentById = async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id);

    if (!apartment) {
      return res
        .status(404)
        .json({ success: false, message: "Apartment not found" });
    }

    res.status(200).json({ success: true, data: apartment });
  } catch (error) {
    console.error("Error fetching apartment:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch apartment" });
  }
};

// Get apartment units by apartment ID
export const getApartmentUnits = async (req, res) => {
  try {
    const { apartment_id } = req.query;

    if (!apartment_id) {
      return res.status(400).json({
        success: false,
        message: "Apartment ID is required",
      });
    }

    // Get apartment units with booking information
    const [units] = await pool.query(
      `SELECT au.*, 
        (SELECT COUNT(*) FROM apartment_bookings ab 
         WHERE ab.unit_id = au.id AND ab.status IN ('confirmed', 'deposit_paid')) AS booking_count,
        (SELECT MAX(ab.status) FROM apartment_bookings ab 
         WHERE ab.unit_id = au.id AND ab.status IN ('confirmed', 'deposit_paid')) AS last_booking_status
       FROM apartment_units au
       WHERE au.apartment_id = ?
       ORDER BY au.floor_number DESC, au.unit_number ASC`,
      [apartment_id]
    );

    // Update status field based on booking information
    const enhancedUnits = units.map((unit) => {
      // If there are bookings and the database status is still 'available', update it
      if (unit.booking_count > 0 && unit.status === "available") {
        unit.status =
          unit.last_booking_status === "confirmed" ? "booked" : "reserved";
      }

      // Remove the temporary fields we added
      delete unit.booking_count;
      delete unit.last_booking_status;

      return unit;
    });

    return res.status(200).json({
      success: true,
      message: "Apartment units retrieved successfully",
      data: enhancedUnits,
    });
  } catch (error) {
    console.error("Error fetching apartment units:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching apartment units",
      error: error.message,
    });
  }
};

// Create a new apartment
export const createApartment = async (req, res) => {
  try {
    const apartmentData = req.body;

    // Log incoming request body for debugging
    console.log("createApartment req.body:", req.body);

    // Handle multi-unit properties
    const isMultiUnit = req.body.isMultiUnit === "true";
    let floorProperties = [];
    if (isMultiUnit && req.body.floorProperties) {
      floorProperties = JSON.parse(req.body.floorProperties);
    }

    // Set owner_id and owner_type
    const ownerId =
      req.body.owner_id && req.body.owner_id !== ""
        ? parseInt(req.body.owner_id)
        : null;
    const ownerType = req.body.owner_type === "seller" ? "seller" : "admin";
    apartmentData.owner_id = ownerId;
    apartmentData.owner_type = ownerType;

    // Log processed owner data
    console.log("createApartment owner data:", {
      owner_id: ownerId,
      owner_type: ownerType,
    });

    // Create apartment in database
    const apartmentId = await Apartment.create(
      apartmentData,
      isMultiUnit,
      floorProperties
    );

    // Handle image uploads
    const imagePaths = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const relativePath = `Uploads/apartments/${path.basename(file.path)}`;
        imagePaths.push(relativePath);
      }
      await Apartment.addImages(apartmentId, imagePaths);
    }

    res.status(201).json({
      success: true,
      message: "Apartment created successfully",
      data: { id: apartmentId },
    });
  } catch (error) {
    console.error("Error creating apartment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create apartment",
      error: error.message,
    });
  }
};

// Update an existing apartment
export const updateApartment = async (req, res) => {
  try {
    const apartmentId = req.params.id;
    const apartmentData = req.body;

    // Log incoming request body for debugging
    console.log("updateApartment req.body:", req.body);

    // Check if apartment exists
    const existingApartment = await Apartment.findById(apartmentId);
    if (!existingApartment) {
      return res
        .status(404)
        .json({ success: false, message: "Apartment not found" });
    }

    // Set owner_id and owner_type
    const ownerId =
      req.body.owner_id && req.body.owner_id !== ""
        ? parseInt(req.body.owner_id)
        : existingApartment.owner_id || null;
    const ownerType =
      req.body.owner_type === "seller"
        ? "seller"
        : existingApartment.owner_type || "admin";
    apartmentData.owner_id = ownerId;
    apartmentData.owner_type = ownerType;

    // Log processed owner data
    console.log("updateApartment owner data:", {
      owner_id: ownerId,
      owner_type: ownerType,
    });

    // Handle multi-unit properties
    const isMultiUnit = req.body.isMultiUnit === "true";
    let floorProperties = [];
    if (isMultiUnit && req.body.floorProperties) {
      floorProperties = JSON.parse(req.body.floorProperties);
    }

    // Update apartment in database
    await Apartment.update(
      apartmentId,
      apartmentData,
      isMultiUnit,
      floorProperties
    );

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const imagePaths = [];
      for (const file of req.files) {
        const relativePath = `Uploads/apartments/${path.basename(file.path)}`;
        imagePaths.push(relativePath);
      }
      await Apartment.addImages(apartmentId, imagePaths);
    }

    res.status(200).json({
      success: true,
      message: "Apartment updated successfully",
    });
  } catch (error) {
    console.error("Error updating apartment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update apartment",
      error: error.message,
    });
  }
};

// Delete an apartment
export const deleteApartment = async (req, res) => {
  try {
    const apartmentId = req.params.id;

    // Check if apartment exists
    const existingApartment = await Apartment.findById(apartmentId);
    if (!existingApartment) {
      return res
        .status(404)
        .json({ success: false, message: "Apartment not found" });
    }

    // Delete images from filesystem
    if (existingApartment.images && existingApartment.images.length > 0) {
      for (const image of existingApartment.images) {
        const imagePath = path.join(__dirname, "../..", image.image_path);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }

    // Delete apartment from database
    await Apartment.delete(apartmentId);

    res
      .status(200)
      .json({ success: true, message: "Apartment deleted successfully" });
  } catch (error) {
    console.error("Error deleting apartment:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete apartment" });
  }
};

// Book an apartment unit
export const bookApartment = async (req, res) => {
  try {
    console.log("Apartment booking request received:", req.body);

    const {
      user_id,
      property_id,
      unit_id,
      total_price,
      amount_paid,
      payment_method,
      payment_details,
      status,
      property_name,
      is_deposit,
    } = req.body;

    // Check all required fields
    if (
      !user_id ||
      !property_id ||
      !unit_id ||
      !amount_paid ||
      !payment_method ||
      !payment_details
    ) {
      console.log("Missing required fields", {
        user_id,
        property_id,
        unit_id,
        amount_paid,
        payment_method,
        payment_details,
      });
      return res.status(400).json({
        success: false,
        message: "All booking fields are required",
      });
    }

    // Validate payment method
    const validMethods = ["credit_card", "card", "upi", "razorpay"];
    if (!validMethods.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: "Only credit card, UPI, and Razorpay payments are accepted",
      });
    }

    // Validate payment details based on method
    if (payment_method === "credit_card" || payment_method === "card") {
      if (
        !payment_details.card_holder ||
        !payment_details.card_number ||
        !payment_details.expiry_date ||
        !payment_details.cvv
      ) {
        return res.status(400).json({
          success: false,
          message: "All credit card details are required",
        });
      }
    } else if (payment_method === "upi") {
      if (!payment_details.upi_id) {
        return res.status(400).json({
          success: false,
          message: "UPI ID is required for UPI payments",
        });
      }
    } else if (payment_method === "razorpay") {
      if (
        !payment_details.razorpay_payment_id ||
        !payment_details.razorpay_order_id ||
        !payment_details.razorpay_signature
      ) {
        return res.status(400).json({
          success: false,
          message: "All Razorpay payment details are required",
        });
      }

      // Verify Razorpay signature
      const generatedSignature = crypto
        .createHmac("sha256", config.razorpay.keySecret)
        .update(
          `${payment_details.razorpay_order_id}|${payment_details.razorpay_payment_id}`
        )
        .digest("hex");

      if (generatedSignature !== payment_details.razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: "Invalid Razorpay signature",
        });
      }
    }

    // Use ApartmentPaymentModel for validation and processing
    const paymentData = new ApartmentPaymentModel({
      user_id,
      property_id,
      unit_id,
      total_price: total_price || (is_deposit ? amount_paid * 10 : amount_paid),
      amount_paid,
      payment_method:
        payment_method === "card" ? "credit_card" : payment_method,
      payment_details,
      status: "completed",
      is_deposit: !!is_deposit,
    });

    // Process payment using the new apartment payment service
    const result = await createApartmentPayment(paymentData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: is_deposit
        ? "Apartment deposit paid successfully"
        : "Apartment booked successfully",
      data: {
        payment_id: result.payment_id,
        invoice_number: result.invoice_number,
      },
    });
  } catch (error) {
    console.error("Apartment booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while processing apartment booking",
      error: error.message,
    });
  }
};

// Create a Razorpay order for apartment booking
export const createApartmentRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency, user_id, property_id, unit_id, is_deposit } =
      req.body;

    if (!amount || !currency || !user_id || !property_id || !unit_id) {
      return res.status(400).json({
        success: false,
        message:
          "Amount, currency, user_id, property_id, and unit_id are required",
      });
    }

    // If it's a deposit payment, include that in the receipt and notes
    const paymentType = is_deposit ? "deposit" : "full";

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency || "INR",
      receipt: `apt_${paymentType}_${user_id}_${property_id}_${unit_id}_${Date.now()}`,
      notes: {
        user_id: user_id.toString(),
        property_id: property_id.toString(),
        unit_id: unit_id.toString(),
        payment_type: paymentType,
      },
    };

    console.log("Creating Razorpay order for apartment with options:", options);

    const order = await razorpay.orders.create(options);
    console.log("Razorpay order created for apartment:", order);

    return res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Error creating Razorpay order for apartment:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating Razorpay order",
      error: error.message,
    });
  }
};

// Verify a Razorpay payment for apartment booking
export const verifyApartmentRazorpayPayment = async (req, res) => {
  try {
    console.log("Apartment payment verification request received:", req.body);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("Missing required payment verification parameters");
      return res.status(400).json({
        success: false,
        message: "All payment verification parameters are required",
      });
    }

    // Verify the payment signature
    const generatedSignature = crypto
      .createHmac("sha256", config.razorpay.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    console.log("Signature verification for apartment payment:", {
      provided: razorpay_signature,
      generated: generatedSignature,
      matches: generatedSignature === razorpay_signature,
    });

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature. Payment verification failed.",
      });
    }

    // If signature is valid, fetch payment details from Razorpay for double verification
    try {
      const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
      console.log("Razorpay payment details for apartment:", paymentDetails);

      // Verify that the payment is authorized or captured
      if (
        paymentDetails.status !== "authorized" &&
        paymentDetails.status !== "captured"
      ) {
        return res.status(400).json({
          success: false,
          message: `Payment verification failed. Payment status is ${paymentDetails.status}`,
        });
      }
    } catch (paymentFetchError) {
      console.error(
        "Error fetching payment details from Razorpay:",
        paymentFetchError
      );
      // Continue with verification since signature is valid
    }

    // If signature is valid, return success
    return res.status(200).json({
      success: true,
      message: "Apartment payment verification successful",
    });
  } catch (error) {
    console.error("Error verifying apartment payment:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while verifying apartment payment",
      error: error.message,
    });
  }
};

// Get apartment payment status and summary
export const getApartmentPaymentStatus = async (req, res) => {
  const { user_id, property_id, unit_id } = req.query;

  if (!user_id || !property_id || !unit_id) {
    return res.status(400).json({
      success: false,
      message: "Missing user_id, property_id, or unit_id",
    });
  }

  try {
    // Import dynamically to avoid circular dependencies
    const { getApartmentPaymentData } = await import(
      "../services/apartmentPaymentService.js"
    );

    const paymentData = await getApartmentPaymentData(
      user_id,
      property_id,
      unit_id
    );

    if (paymentData) {
      return res.status(200).json({ success: true, data: paymentData });
    } else {
      return res.status(404).json({
        success: false,
        message: "No payment found",
        data: {
          payment_summary: {
            full_unit_price: 0,
            deposit_amount: 0,
            total_paid: 0,
            pending_amount: 0,
            percentage_paid: 0,
          },
        },
      });
    }
  } catch (error) {
    console.error("Error checking apartment payment:", error);
    res.status(500).json({
      success: false,
      message: "Server error while checking apartment payment",
      error: error.message,
    });
  }
};

// Get all booked apartments for a user
export const getUserBookedApartments = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Fetching bookings for user ID: ${userId}`);

    if (!userId) {
      console.log("Missing user ID in request params");
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Get all bookings for the user with apartment and unit details
    const connection = await pool.getConnection();

    try {
      console.log(`Executing SQL query for user ID: ${userId}`);
      // Query to join apartment_bookings with apartments and apartment_units tables
      const [bookings] = await connection.query(
        `
        SELECT 
          ab.id as booking_id,
          ab.apartment_id,
          ab.unit_id,
          ab.payment_id,
          ab.booking_date,
          ab.amount,
          ab.status as booking_status,
          ab.notes,
          
          IFNULL(a.name, 'Unknown') as name,
          IFNULL(a.location, 'Unknown') as location,
          a.description,
          a.amenities,
          
          IFNULL(au.unit_number, '') as unit_number,
          IFNULL(au.floor_number, 0) as floor_number,
          IFNULL(au.price, 0) as price,
          IFNULL(au.bedrooms, 0) as bedrooms,
          IFNULL(au.bathrooms, 0) as bathrooms,
          IFNULL(au.area, 0) as area,
          
          IFNULL(p.invoice_number, '') as invoice_number,
          IFNULL(p.payment_method, '') as payment_method,
          IFNULL(p.status, '') as payment_status,
          
          (SELECT image_path FROM apartment_images 
           WHERE apartment_id = a.id 
           ORDER BY is_primary DESC, id ASC 
           LIMIT 1) as image
           
        FROM apartment_bookings ab
        LEFT JOIN apartments a ON ab.apartment_id = a.id
        LEFT JOIN apartment_units au ON ab.unit_id = au.id
        LEFT JOIN payments p ON ab.payment_id = p.id
        WHERE ab.user_id = ?
        ORDER BY ab.booking_date DESC
      `,
        [userId]
      );

      console.log(`Found ${bookings.length} bookings for user ID: ${userId}`);

      // If no bookings found, return empty array
      if (bookings.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No booked apartments found for this user",
          data: [],
        });
      }

      // Log the first booking for debugging
      if (bookings.length > 0) {
        const sampleBooking = { ...bookings[0] };
        // Omit large fields for clean logging
        delete sampleBooking.description;
        delete sampleBooking.amenities;
        console.log("Sample booking data:", sampleBooking);
      }

      return res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (queryError) {
      console.error("Database query error:", queryError);
      return res.status(500).json({
        success: false,
        message: "Database error while fetching bookings",
        error: queryError.message,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching user's booked apartments:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching booked apartments",
      error: error.message,
    });
  }
};
