import userPropModel from "../models/userPropModel.js";
import {
  addUserProps,
  getAllUserbyProps,
  getAllUserProps,
} from "../services/userPropService.js";

export const createuserProps = async (req, res) => {
  try {
    const { user_id, property_id } = req.body;

    if (!user_id || !property_id) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const userProp = new userPropModel({
      user_id,
      property_id,
    });

    const response = await addUserProps(userProp);
    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error("Error creating user props:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const fetchuserProps = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await getAllUserProps(id);
    return res.status(response.success ? 200 : 500).json(response);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const fetchuserbyProps = async (req, res) => {
  try {
    const { pid } = req.params;
    const response = await getAllUserbyProps(pid);
    return res.status(response.success ? 200 : 500).json(response);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
