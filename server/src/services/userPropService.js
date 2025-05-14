import { pool } from "../config/db.js";

export const addUserProps = async (property) => {
  try {
    const checkQuery = `SELECT 1 FROM user_properties WHERE user_id = ? AND property_id = ?`;
    const checkValues = [property.user_id, property.property_id];

    const [existing] = await pool.execute(checkQuery, checkValues);

    if (existing.length > 0) {
      return {
        success: false,
        message: "Property already assigned to the user",
      };
    }

    const insertQuery = `INSERT INTO user_properties(user_id, property_id) VALUES (?, ?)`;
    const insertValues = [property.user_id, property.property_id];

    await pool.execute(insertQuery, insertValues);

    return {
      success: true,
      message: "Property added to user's properties successfully",
    };
  } catch (error) {
    console.error("Error adding property to user's properties:", error);
    return {
      success: false,
      message: "Failed to add property to user's properties",
    };
  }
};

export const getAllUserProps = async (id) => {
  try {
    const [rows] = await pool.execute(
      `SELECT up.*, p.* 
       FROM user_properties up 
       JOIN properties p ON up.property_id = p.id 
       JOIN users u ON up.user_id = u.id 
       WHERE up.user_id = ?
       ORDER BY up.id DESC;`,
      [id]
    );
    return { success: true, data: rows };
  } catch (error) {
    console.error("Error fetching properties:", error);
    return { success: false, message: "Failed to fetch properties" };
  }
};

export const getAllUserbyProps = async (pid) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM properties WHERE id = ?;`,
      [pid]
    );
    return { success: true, data: rows };
  } catch (error) {
    console.error("Error fetching properties:", error);
    return { success: false, message: "Failed to fetch properties" };
  }
};
