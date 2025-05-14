import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const { div: MotionDiv, section: MotionSection } = motion;

const ContactForm = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:3000/api/contact",
        formData
      );

      if (response.data.success) {
        setSubmitted(true);
        setFormData({
          fullname: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        setTimeout(() => setSubmitted(false), 4000);
      } else {
        setError(
          response.data.message || "Something went wrong. Please try again."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit form. Please try again later."
      );
      console.error("Contact form error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MotionSection
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="py-24 bg-gradient-to-br from-amber-50 to-blue-50 px-4"
    >
      <MotionDiv className="max-w-xl mx-auto bg-white p-10 rounded-3xl shadow-2xl space-y-6">
        <h2 className="text-4xl font-extrabold text-blue-900 text-center mb-4">
          Get In Touch
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block mb-1 text-blue-800 font-medium">
              Full Name
            </label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-blue-900 placeholder:text-blue-400"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-blue-800 font-medium">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-blue-900 placeholder:text-blue-400"
              placeholder="johndoe@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-1 text-blue-800 font-medium">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-blue-900 placeholder:text-blue-400"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block mb-1 text-blue-800 font-medium">
              Subject
            </label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-blue-900"
            >
              <option value="">Select an option</option>
              <option>General Inquiry</option>
              <option>Book a Visit</option>
              <option>Support</option>
              <option>Partnerships</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block mb-1 text-blue-800 font-medium">
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-blue-900 placeholder:text-blue-400"
              placeholder="Type your message here..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl font-semibold hover:scale-105 transition-transform resize-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-600 font-semibold text-center mt-4"
          >
            ❌ {error}
          </motion.p>
        )}

        {/* Confirmation Message */}
        {submitted && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-600 font-semibold text-center mt-4"
          >
            ✅ We'll get back to you soon!
          </motion.p>
        )}
      </MotionDiv>
    </MotionSection>
  );
};

export default ContactForm;
