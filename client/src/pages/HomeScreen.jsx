import axios from "axios";
import React, { useEffect, useState } from "react";

const HomeScreen = () => {
  const [userData, setUserData] = useState("");
  useEffect(() => {
    fetchUserDetails();
  }, []);
  const fetchUserDetails = async () => {
    try {
      const token = sessionStorage.getItem("authToken");

      if (!token) {
        console.log("No token found in sessionStorage");
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
      } else {
        console.log(response.data.message || "Failed to fetch user details");
      }
    } catch (error) {
      console.log(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div>
      <h2>{userData.email} Hello</h2>
    </div>
  );
};

export default HomeScreen;
