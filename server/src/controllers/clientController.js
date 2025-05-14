import ClientModel from "../models/clientModel.js";
import {
  addClientFeedback,
  getAllClientFeedbacks,
  updateClientFeedback,
  deleteClientFeedback,
} from "../services/clientService.js";
import fs from "fs";

// Add Client Feedback
export const createClientFeedback = async (req, res) => {
  try {
    const { first_name, last_name, feedback, rating } = req.body;
    if (!first_name || !last_name || !feedback || !rating) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Handle image file upload
    let imagePath = null;
    if (req.file) {
      imagePath = req.file.path;
    }

    const clientFeedback = new ClientModel({
      first_name,
      last_name,
      feedback,
      rating,
      image: imagePath,
    });
    const response = await addClientFeedback(clientFeedback);
    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error("Error creating client feedback:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get All Client Feedbacks
export const fetchClientFeedbacks = async (req, res) => {
  try {
    const response = await getAllClientFeedbacks();
    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error("Error fetching client feedbacks:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update Client Feedback
export const modifyClientFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, feedback, rating } = req.body;

    if (!first_name || !last_name || !feedback || !rating) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Get current client to check for existing image
    const currentClient = await getAllClientFeedbacks();
    const client = currentClient.data.find((c) => c.id === parseInt(id));

    // Handle image file upload
    let imagePath = client?.image || null;
    if (req.file) {
      imagePath = req.file.path;

      // Delete old image if it exists
      if (client && client.image && fs.existsSync(client.image)) {
        try {
          fs.unlinkSync(client.image);
        } catch (error) {
          console.error("Error deleting old image:", error);
        }
      }
    }

    const response = await updateClientFeedback(id, {
      first_name,
      last_name,
      feedback,
      rating,
      image: imagePath,
    });
    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error("Error updating client feedback:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete Client Feedback
export const removeClientFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    // Get current client to check for existing image
    const currentClient = await getAllClientFeedbacks();
    const client = currentClient.data.find((c) => c.id === parseInt(id));

    // Delete image file if it exists
    if (client && client.image && fs.existsSync(client.image)) {
      try {
        fs.unlinkSync(client.image);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    const response = await deleteClientFeedback(id);
    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error("Error deleting client feedback:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
