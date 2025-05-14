import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { motion } from "framer-motion";
import axios from "axios";

const { div: MotionDiv } = motion;

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user", // Default role
  });

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!form.username) {
      errors.username = "Username is required";
    } else if (!/^[A-Za-z0-9_]{3,15}$/.test(form.username)) {
      errors.username =
        "Username should be at least 3-15 characters long and contain only letters, numbers and underscores.";
    }

    if (!form.firstName) {
      errors.firstName = "First name is required";
    } else if (!/^[A-Za-z]+$/.test(form.firstName)) {
      errors.firstName = "First name should contain only letters.";
    }

    if (!form.lastName) {
      errors.lastName = "Last name is required";
    } else if (!/^[A-Za-z]+$/.test(form.lastName)) {
      errors.lastName = "Last name should contain only letters.";
    }

    if (!form.email) {
      errors.email = "Email address is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      errors.password = "Password is required";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        form.password
      )
    ) {
      errors.password =
        "Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    } else if (form.confirmPassword !== form.password) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!form.role) {
      errors.role = "Role is required";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();

    if (Object.keys(errors).length === 0) {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/auth/register-user",
          form
        );
        console.log(response);
        window.alert("Registered Successfully");
        navigate("/login");
      } catch (error) {
        window.alert("Registration Failed", error);
      }
    } else {
      window.alert("Form Submission Failed");
      setFormErrors(errors);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
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
          Create your <span className="text-amber-500">HomeConnect</span>{" "}
          account
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 text-sm font-medium text-blue-900">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {formErrors.username && (
              <span className="text-red-500">{formErrors.username}</span>
            )}
          </div>
          <div className="flex space-x-3">
            <div className="w-1/2">
              <label className="block mb-1 text-sm font-medium text-blue-900">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {formErrors.firstName && (
                <span className="text-red-500">{formErrors.firstName}</span>
              )}
            </div>
            <div className="w-1/2">
              <label className="block mb-1 text-sm font-medium text-blue-900">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {formErrors.lastName && (
                <span className="text-red-500">{formErrors.lastName}</span>
              )}
            </div>
          </div>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {formErrors.email && (
              <span className="text-red-500">{formErrors.email}</span>
            )}
          </div>
          <div className="relative">
            <label className="block mb-1 text-sm font-medium text-blue-900">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {formErrors.password && (
              <span className="text-red-500">{formErrors.password}</span>
            )}
            <div
              className="absolute right-3 top-[37px] cursor-pointer text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </div>
          </div>
          <div className="relative">
            <label className="block mb-1 text-sm font-medium text-blue-900">
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div
              className="absolute right-3 top-[37px] cursor-pointer text-gray-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </div>
          </div>

          {/* Role selection with radio buttons */}
          <div>
            <label className="block mb-1 text-sm font-medium text-blue-900">
              Role
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={form.role === "user"}
                  onChange={handleChange}
                  className="text-amber-500"
                />
                <span>User</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="role"
                  value="seller"
                  checked={form.role === "seller"}
                  onChange={handleChange}
                  className="text-amber-500"
                />
                <span>Seller</span>
              </label>
            </div>
            {formErrors.role && (
              <span className="text-red-500">{formErrors.role}</span>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 text-white py-2 rounded-xl font-semibold hover:bg-amber-600 transition-colors"
          >
            Register
          </button>
        </form>
        <p className="mt-5 text-sm text-center text-blue-900 cursor-pointer">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-amber-500 hover:underline font-semibold"
          >
            Login
          </Link>
        </p>
      </MotionDiv>
    </div>
  );
};

export default Register;
