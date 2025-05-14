import express from "express";
import {
  createPayment,
  checkPayment,
  getUserPaymentHistory,
  generateInvoice,
  getAllPaymentsController,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getAllUserPaymentsController,
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/check", checkPayment);
router.post("/", createPayment);
router.get("/user/:user_id", getUserPaymentHistory);
router.get("/user-all/:user_id", getAllUserPaymentsController);
router.get("/invoice/:payment_id", generateInvoice);
router.get("/all", getAllPaymentsController);
router.post("/create-order", createRazorpayOrder);
router.post("/verify-payment", verifyRazorpayPayment);

export default router;
