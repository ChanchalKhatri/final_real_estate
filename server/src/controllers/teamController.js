import TeamModel from "../models/teamModel.js";
import {
  addTeamMember,
  getAllTeamMembers,
  updateTeamMember,
  deleteTeamMember,
} from "../services/teamService.js";
import fs from "fs";

// Add Team Member
export const createTeamMember = async (req, res) => {
  try {
    const { first_name, last_name, position, email } = req.body;
    if (!first_name || !last_name || !position || !email) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Handle image file upload
    let imagePath = null;
    if (req.file) {
      imagePath = req.file.path;
    }

    const teamMember = new TeamModel({
      first_name,
      last_name,
      position,
      email,
      image: imagePath,
    });
    const response = await addTeamMember(teamMember);
    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error("Error creating team member:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get All Team Members
export const fetchTeamMembers = async (req, res) => {
  try {
    const response = await getAllTeamMembers();
    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update Team Member
export const modifyTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, position, email } = req.body;

    if (!first_name || !last_name || !position || !email) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Get current team member to check for existing image
    const currentTeam = await getAllTeamMembers();
    const member = currentTeam.data.find((m) => m.id === parseInt(id));

    // Handle image file upload
    let imagePath = member?.image || null;
    if (req.file) {
      imagePath = req.file.path;

      // Delete old image if it exists
      if (member && member.image && fs.existsSync(member.image)) {
        try {
          fs.unlinkSync(member.image);
        } catch (error) {
          console.error("Error deleting old image:", error);
        }
      }
    }

    const response = await updateTeamMember(id, {
      first_name,
      last_name,
      position,
      email,
      image: imagePath,
    });
    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error("Error updating team member:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete Team Member
export const removeTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    // Get current team member to check for existing image
    const currentTeam = await getAllTeamMembers();
    const member = currentTeam.data.find((m) => m.id === parseInt(id));

    // Delete image file if it exists
    if (member && member.image && fs.existsSync(member.image)) {
      try {
        fs.unlinkSync(member.image);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    const response = await deleteTeamMember(id);
    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error("Error deleting team member:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
