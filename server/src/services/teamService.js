import { pool } from "../config/db.js";

// Add Team Member
export const addTeamMember = async (member) => {
  try {
    const query = `INSERT INTO team (first_name, last_name, position, email, image) VALUES (?, ?, ?, ?, ?)`;
    const values = [
      member.first_name,
      member.last_name,
      member.position,
      member.email,
      member.image,
    ];

    await pool.query(query, values);
    return { success: true, message: "Team member added successfully" };
  } catch (error) {
    console.error("Error adding team member:", error);
    return { success: false, message: "Failed to add team member" };
  }
};

// Get All Team Members
export const getAllTeamMembers = async () => {
  try {
    const [rows] = await pool.query(`SELECT * FROM team`);
    return { success: true, data: rows };
  } catch (error) {
    console.error("Error fetching team members:", error);
    return { success: false, message: "Failed to fetch team members" };
  }
};

// Update Team Member
export const updateTeamMember = async (id, updatedMember) => {
  try {
    const query = `UPDATE team SET first_name=?, last_name=?, position=?, email=?, image=? WHERE id=?`;
    const values = [
      updatedMember.first_name,
      updatedMember.last_name,
      updatedMember.position,
      updatedMember.email,
      updatedMember.image,
      id,
    ];

    await pool.query(query, values);
    return { success: true, message: "Team member updated successfully" };
  } catch (error) {
    console.error("Error updating team member:", error);
    return { success: false, message: "Failed to update team member" };
  }
};

// Delete Team Member
export const deleteTeamMember = async (id) => {
  try {
    await pool.query(`DELETE FROM team WHERE id=?`, [id]);
    return { success: true, message: "Team member deleted successfully" };
  } catch (error) {
    console.error("Error deleting team member:", error);
    return { success: false, message: "Failed to delete team member" };
  }
};
