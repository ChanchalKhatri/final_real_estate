import express from "express";
import cors from "cors";
import { config } from "./config/env.js"; // Import the config
import { checkConnection } from "./config/db.js";
import createAllTable from "./utils/dbUtils.js";
import authRoutes from "./routes/authRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js"; // Import properties routes
import userPropRoutes from "./routes/userPropRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import apartmentRoutes from "./routes/apartmentRoutes.js"; // Import apartment routes
import * as apartmentController from "./controllers/apartmentController.js"; // Import apartment controller
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/properties", propertyRoutes); // Added property routes
app.use("/api/apartments", apartmentRoutes); // Added apartment routes
// Register apartment-bookings endpoint explicitly to make it more visible
app.use("/api/apartment-bookings", (req, res) => {
  if (req.method === "POST") {
    return apartmentController.bookApartment(req, res);
  }
  res.status(405).json({ success: false, message: "Method not allowed" });
});
// Add apartment-units endpoint to fetch units from apartment_units table
app.use("/api/apartment-units", (req, res, next) => {
  // Redirect to the apartment controller's getApartmentUnits method
  if (req.method === "GET") {
    return apartmentController.getApartmentUnits(req, res);
  }
  next();
});
app.use("/api/userprop", userPropRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/contact", contactRoutes);

app.listen(3000, async () => {
  console.log("Server is running on port 3000");

  try {
    await checkConnection();
    await createAllTable();
  } catch (error) {
    console.log("Failed to initialize the database", error);
  }
});

export default app;
