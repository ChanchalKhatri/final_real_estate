import { pool } from "../config/db.js";

export const createContactQuery = async (
  fullname,
  email,
  phone,
  subject,
  message
) => {
  try {
    const [result] = await pool.execute(
      "INSERT INTO contact (fullname, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)",
      [fullname, email, phone, subject, message]
    );
    return result;
  } catch (error) {
    console.error("Error in createContactQuery:", error);
    throw error;
  }
};

export const getAllContactsQuery = async () => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM contact ORDER BY created_at DESC"
    );
    return rows;
  } catch (error) {
    console.error("Error in getAllContactsQuery:", error);
    throw error;
  }
};
