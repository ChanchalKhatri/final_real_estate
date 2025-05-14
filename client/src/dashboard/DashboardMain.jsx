import { Route, Routes, Navigate } from "react-router-dom";
import AdminRoutes from "./routes";
import "./styles/dashboard.css";
import { useEffect, useState } from "react";
import axios from "axios";

const DashboardMain = () => {
  const [userData, setUserData] = useState("");
  const [loading, setLoading] = useState(true); // To handle loading state
  const [isAuthenticated, setIsAuthenticated] = useState(false); // To check if the user is authenticated

  console.log(userData);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      console.log("Stored Token:", token);

      if (!token) {
        console.log("No token found in sessionStorage");
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const response = await axios.get(
        "http://localhost:3000/api/auth/getUserData",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("User Data Response:", response.data); // Debugging

      if (response.data.success) {
        setUserData(response.data.data);
        let userInfo = {
          isLoggedIn: true,
          userData: response.data,
        };

        sessionStorage.setItem("userData", JSON.stringify(userInfo));
        setIsAuthenticated(true);
      } else {
        console.log(response.data.message || "Failed to fetch user details");
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.log(error.response?.data?.message || "An error occurred");
      setIsAuthenticated(false);
    } finally {
      setLoading(false); // Set loading to false after the operation completes
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading state until the request is complete
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // Redirect to login if not authenticated
  }

  return (
    <Routes>
      <Route path="/*" element={<AdminRoutes />} />
    </Routes>
  );
};

export default DashboardMain;
