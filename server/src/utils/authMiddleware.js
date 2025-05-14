import { getUserFromToken } from "../services/authService.js";

export const verifyToken = async (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("No token found in request");
    // Allow the request to proceed without authentication
    // Controllers will handle permission checks for protected routes
    return next();
  }

  try {
    console.log("Verifying token:", token.substring(0, 10) + "...");
    // Verify the token and get user data
    const response = await getUserFromToken(token);

    if (response.success) {
      // Set the user data on the request object
      req.user = response.data;
      console.log(
        "Authentication successful. User ID:",
        req.user.id,
        "Role:",
        req.user.role
      );
      return next();
    } else {
      console.log("Invalid token:", response.message);
      // Token is invalid, but still proceed (unauthenticated)
      return next();
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    // Allow the request to proceed without authentication
    return next();
  }
};

// Middleware that strictly requires authentication
export const requireAuth = async (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please login.",
    });
  }

  try {
    // Verify the token and get user data
    const response = await getUserFromToken(token);

    if (response.success) {
      // Set the user data on the request object
      req.user = response.data;
      return next();
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please login again.",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication error. Please try again later.",
    });
  }
};

// Middleware to check if user is an admin
export const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please login.",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin privileges required for this action.",
    });
  }

  next();
};

// Middleware to check if user is a seller or admin
export const requireSellerOrAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please login.",
    });
  }

  if (req.user.role !== "admin" && req.user.role !== "seller") {
    return res.status(403).json({
      success: false,
      message: "Seller or admin privileges required for this action.",
    });
  }

  next();
};
