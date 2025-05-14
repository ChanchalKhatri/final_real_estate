import express from "express";
import {
  getAllApartments,
  getApartmentById,
  createApartment,
  updateApartment,
  deleteApartment,
  upload,
  getApartmentUnits,
  bookApartment,
  getUserBookedApartments,
} from "../controllers/apartmentController.js";

const router = express.Router();

// GET all apartments
router.get("/", getAllApartments);
// GET a single apartment by ID
router.get("/:id", getApartmentById);

// POST create a new apartment
router.post("/", upload.array("images", 5), createApartment);

// PUT update an apartment
router.put("/:id", upload.array("images", 5), updateApartment);

// DELETE an apartment
router.delete("/:id", deleteApartment);

// POST create apartment booking
router.post("/bookings", bookApartment);

// GET user's booked apartments
router.get("/bookings/user/:userId", getUserBookedApartments);

export default router;
