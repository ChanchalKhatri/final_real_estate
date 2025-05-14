import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
import morgan from "morgan";

// Import models for DB initialization
import Property from "./models/Property.js";
import Apartment from "./models/Apartment.js";
import User from "./models/User.js";
import Booking from "./models/Booking.js";

// Import routes
import propertyRoutes from "./routes/propertyRoutes.js";
import enquireRoutes from "./routes/enquireRoutes.js";
import apartmentRoutes from "./routes/apartmentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

// Import controllers
import * as apartmentController from "./controllers/apartmentController.js";

// Environment setup
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Initialize database tables
const initDatabase = async () => {
  try {
    await Property.createTable();
    await Apartment.createTable();
    await User.createTable();
    await Booking.createTable();
    console.log("Database tables created successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

initDatabase();

// API Routes
app.use("/api/properties", propertyRoutes);
app.use("/api/properties/enquire", enquireRoutes);
app.use("/api/apartments", apartmentRoutes);
app.use("/api/apartment-units", (req, res, next) => {
  // Redirect to the apartment controller's getApartmentUnits method
  if (req.method === "GET") {
    return apartmentController.getApartmentUnits(req, res);
  }
  next();
});
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
