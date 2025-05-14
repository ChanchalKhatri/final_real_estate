import React from "react";
import { Mail, Phone, User } from "react-feather";
import { motion } from "framer-motion";

const { div: MotionDiv, section: MotionSection } = motion;

const ContactCTA = () => {
  return (
    <MotionSection
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-gradient-to-r from-amber-100 to-blue-100 py-20 px-4"
    >
      <MotionDiv className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Left Content */}
        <div className="text-center md:text-left space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-blue-900">
            Ready to Find Your{" "}
            <span className="text-amber-500">Dream Home</span>?
          </h2>
          <p className="text-lg text-blue-800 font-medium">
            Contact us today or subscribe to receive the latest property
            listings!
          </p>
        </div>

        {/* Right Form */}
        <div className="bg-white p-6 rounded-2xl shadow-lg w-full md:w-[400px] space-y-4">
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-3 rounded-xl">
            <User size={18} className="text-blue-500" />
            <input
              type="text"
              placeholder="Your name"
              className="outline-none w-full text-blue-900 placeholder:text-blue-500 bg-blue-50"
            />
          </div>

          <div className="flex items-center gap-2 bg-blue-50 px-3 py-3 rounded-xl">
            <Mail size={18} className="text-blue-500" />
            <input
              type="email"
              placeholder="Your email"
              className="outline-none w-full text-blue-900 placeholder:text-blue-500 bg-blue-50"
            />
          </div>

          <div className="flex items-center gap-2 bg-blue-50 px-3 py-3 rounded-xl">
            <Phone size={18} className="text-blue-500" />
            <input
              type="tel"
              placeholder="Your contact"
              className="outline-none w-full text-blue-900 placeholder:text-blue-500 bg-blue-50"
            />
          </div>

          <button className="w-full bg-amber-500 text-white py-3 rounded-xl font-semibold hover:scale-105 transition-transform cursor-pointer">
            Book a Free Consultation
          </button>
        </div>
      </MotionDiv>
    </MotionSection>
  );
};

export default ContactCTA;
