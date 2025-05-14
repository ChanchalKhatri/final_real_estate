import express from "express";
import {
  fetchProperties,
  createProperty,
  modifyProperty,
  removeProperty,
  fetchPropertyImages,
  removePropertyImage,
  updatePrimaryImage,
  fetchPropertyColumns,
} from "../controllers/propertyController.js";
import {
  verifyToken,
  requireAuth,
  requireSellerOrAdmin,
} from "../utils/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Make sure the upload directory exists
const uploadDir = "uploads/properties";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() +
        "_" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  },
});

const router = express.Router();

// Public routes - these can be accessed without authentication but will show ownership info if user is authenticated
router.get("/", fetchProperties);
router.get("/columns", fetchPropertyColumns);
router.get("/:id/images", fetchPropertyImages);

// Protected routes - require authentication and appropriate role
router.post(
  "/",
  requireAuth,
  upload.array("propertyImages", 5),
  createProperty
);
router.put(
  "/:id",
  requireAuth,
  upload.array("propertyImages", 5),
  modifyProperty
);
router.delete("/:id", requireAuth, removeProperty);
router.delete("/images/:id", requireAuth, removePropertyImage);
router.post("/images/primary", requireAuth, updatePrimaryImage);

export default router;
