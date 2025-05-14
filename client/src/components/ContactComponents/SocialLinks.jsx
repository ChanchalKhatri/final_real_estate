import React from "react";
import { motion } from "framer-motion";
import { Facebook, Instagram, Linkedin, Twitter } from "react-feather";
import { FaWhatsapp } from "react-icons/fa";

const { div: MotionDiv, section: MotionSection } = motion;

const SocialLinks = () => {
  return (
    <MotionSection
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="py-12 bg-gradient-to-r from-amber-50 to-blue-50"
    >
      <MotionDiv className="max-w-screen-xl mx-auto text-center space-y-6">
        <h2 className="text-4xl font-extrabold text-blue-900">
          Connect With Us
        </h2>
        <p className="text-blue-700 font-medium">
          Follow us on social media for updates & news
        </p>

        <div className="flex items-center justify-center gap-6 mt-4">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white shadow-lg rounded-full p-4 hover:bg-amber-500 group transition"
          >
            <Facebook className="text-blue-800 group-hover:text-white" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white shadow-lg rounded-full p-4 hover:bg-amber-500 group transition"
          >
            <Instagram className="text-pink-600 group-hover:text-white" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white shadow-lg rounded-full p-4 hover:bg-amber-500 group transition"
          >
            <Linkedin className="text-blue-700 group-hover:text-white" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white shadow-lg rounded-full p-4 hover:bg-amber-500 group transition"
          >
            <Twitter className="text-blue-500 group-hover:text-white" />
          </a>
          <a
            href="https://wa.me/1234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white shadow-lg rounded-full p-4 hover:bg-amber-500 group transition"
          >
            <FaWhatsapp
              className="text-green-600 group-hover:text-white"
              size={22}
            />
          </a>
        </div>
      </MotionDiv>
    </MotionSection>
  );
};

export default SocialLinks;
