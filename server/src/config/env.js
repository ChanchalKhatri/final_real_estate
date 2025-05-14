// Environment variables configuration
import dotenv from "dotenv";

// Load .env file if exists
dotenv.config();

export const config = {
  // Razorpay configuration
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_rJXMnKu99AjJJz",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "r4pg2RQo8DnSzGJlUVkRI9ci",
  },

  // Server configuration
  server: {
    port: process.env.PORT || 3000,
  },

  // Add other configuration categories as needed
};

export default config;
