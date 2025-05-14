import express from "express";
import {
  getUserFromTokenController,
  login,
  register,
  getAllUsers,
  updateProfile,
} from "../controllers/authController.js";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profiles/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
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

router.post("/register-user", register);
router.post("/login-user", login);
router.get("/getUserData", getUserFromTokenController);
router.get("/getAllUsers", getAllUsers);
router.put("/updateProfile", upload.single("profileImage"), updateProfile);

export default router;
