import {
  createContactQuery,
  getAllContactsQuery,
} from "../models/contactModel.js";

export const createContact = async (req, res) => {
  try {
    const { fullname, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!fullname || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Save to database
    const result = await createContactQuery(
      fullname,
      email,
      phone,
      subject,
      message
    );

    return res.status(201).json({
      success: true,
      message: "Contact form submitted successfully",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("Contact Error: ", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await getAllContactsQuery();

    return res.status(200).json({
      success: true,
      message: "Contacts retrieved successfully",
      data: contacts,
    });
  } catch (error) {
    console.error("Error getting contacts: ", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
