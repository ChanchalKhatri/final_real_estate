import express from "express";
import {
  createTeamMember,
  fetchTeamMembers,
  modifyTeamMember,
  removeTeamMember,
} from "../controllers/teamController.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Make sure the upload directory exists
const uploadDir = "uploads/team";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
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

router.post("/", upload.single("image"), createTeamMember);
router.get("/", fetchTeamMembers);
router.put("/:id", upload.single("image"), modifyTeamMember);
router.delete("/:id", removeTeamMember);

export default router;
