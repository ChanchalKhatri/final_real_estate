import express from "express";
import {
  getAllApartments,
  getApartmentById,
  getApartmentUnits,
  createApartment,
  updateApartment,
  deleteApartment,
  bookApartment,
  getUserBookedApartments,
  upload,
  createApartmentRazorpayOrder,
  verifyApartmentRazorpayPayment,
  getApartmentPaymentStatus,
} from "../controllers/apartmentController.js";

const router = express.Router();

// General apartment routes
router.get("/", getAllApartments);
router.get("/:id", getApartmentById);
router.post("/", upload.array("images", 10), createApartment);
router.put("/:id", upload.array("images", 10), updateApartment);
router.delete("/:id", deleteApartment);

// Booking and payment routes
router.post("/book", bookApartment);
router.get("/bookings/:userId", getUserBookedApartments);
router.get("/units", getApartmentUnits);

// Razorpay payment routes
router.post("/payment/create-order", createApartmentRazorpayOrder);
router.post("/payment/verify-payment", verifyApartmentRazorpayPayment);
router.get("/payment/status", getApartmentPaymentStatus);

export default router;
