import { pool } from "../config/db.js";

// Add Client Feedback
export const addClientFeedback = async (client) => {
  try {
    const query = `INSERT INTO clients (first_name, last_name, feedback, rating, image) VALUES (?, ?, ?, ?, ?)`;
    const values = [
      client.first_name,
      client.last_name,
      client.feedback,
      client.rating,
      client.image,
    ];

    await pool.execute(query, values);
    return { success: true, message: "Client feedback added successfully" };
  } catch (error) {
    console.error("Error adding client feedback:", error);
    return { success: false, message: "Failed to add client feedback" };
  }
};

// Get All Client Feedbacks
export const getAllClientFeedbacks = async () => {
  try {
    const [rows] = await pool.execute(`SELECT * FROM clients`);
    return { success: true, data: rows };
  } catch (error) {
    console.error("Error fetching client feedbacks:", error);
    return { success: false, message: "Failed to fetch client feedbacks" };
  }
};

// Update Client Feedback
export const updateClientFeedback = async (id, updatedClient) => {
  try {
    const query = `UPDATE clients SET first_name=?, last_name=?, feedback=?, rating=?, image=? WHERE id=?`;
    const values = [
      updatedClient.first_name,
      updatedClient.last_name,
      updatedClient.feedback,
      updatedClient.rating,
      updatedClient.image,
      id,
    ];

    await pool.execute(query, values);
    return { success: true, message: "Client feedback updated successfully" };
  } catch (error) {
    console.error("Error updating client feedback:", error);
    return { success: false, message: "Failed to update client feedback" };
  }
};

// Delete Client Feedback
export const deleteClientFeedback = async (id) => {
  try {
    await pool.execute(`DELETE FROM clients WHERE id=?`, [id]);
    return { success: true, message: "Client feedback deleted successfully" };
  } catch (error) {
    console.error("Error deleting client feedback:", error);
    return { success: false, message: "Failed to delete client feedback" };
  }
};
