import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

const { div: MotionDiv } = motion;

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (sessionStorage.getItem("authToken")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    setErrorMessage(""); // Clear any previous error message

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login-user",
        { email: form.email, password: form.password }
      );

      if (response.data.success) {
        window.alert("Login Successfully!");
        const token = response.data.token;
        const id = response.data.id;
        sessionStorage.setItem("authToken", token);
        localStorage.setItem("keepLoggedIn", JSON.stringify(true));
        localStorage.setItem("userId", id);
        console.log("Token Stored:", sessionStorage.getItem("authToken"));
        navigate("/dashboard");
      } else {
        setErrorMessage(
          "Login Failed: " + (response.data.message || "Invalid credentials")
        );
      }
    } catch (error) {
      setErrorMessage(
        "Login Error: " + (error.response?.data?.message || "An error occurred")
      );
    } finally {
      setIsLoading(false); // End loading
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-gradient-to-r from-blue-50 to-amber-50 px-4">
      <MotionDiv
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <h2 className="text-3xl font-extrabold text-blue-900 mb-6 text-center">
          Login to <span className="text-amber-500">HomeConnect</span>
        </h2>

        {errorMessage && (
          <div className="text-red-500 text-sm mb-4">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-medium text-blue-900">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-blue-900">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 text-white py-2 rounded-xl font-semibold hover:bg-amber-600 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Logging In..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-sm text-center text-blue-900">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-amber-500 hover:underline font-semibold"
          >
            Register
          </Link>
        </p>
      </MotionDiv>
    </div>
  );
};

export default Login;
