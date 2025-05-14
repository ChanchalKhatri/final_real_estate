import express from "express";
import {
  fetchuserProps,
  createuserProps,
  fetchuserbyProps,
} from "../controllers/userPropController.js";

const router = express.Router();

router.get("/:id", fetchuserProps);
router.get("/property/:pid", fetchuserbyProps);
router.post("/", createuserProps);

export default router;
