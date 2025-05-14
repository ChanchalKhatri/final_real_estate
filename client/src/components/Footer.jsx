import React from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "react-feather";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const { footer: MotionFooter, div: MotionDiv } = motion;

const Footer = () => {
  return (
    <MotionFooter
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-white text-blue-900 border-t border-blue-100 pt-16 pb-8 px-4"
    >
      <MotionDiv className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-amber-500">
            Quick Links
          </h3>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="hover:text-amber-500">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-amber-500">
                About
              </Link>
            </li>
            <li>
              <Link to="/property" className="hover:text-amber-500">
                Properties
              </Link>
            </li>
            <li>
              <Link to="/apartment" className="hover:text-amber-500">
                Apartments
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-amber-500">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-amber-500">
            Follow Us
          </h3>
          <div className="flex gap-4">
            <a href="#" className="hover:text-amber-500">
              <Facebook />
            </a>
            <a href="#" className="hover:text-amber-500">
              <Twitter />
            </a>
            <a href="#" className="hover:text-amber-500">
              <Instagram />
            </a>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4 text-amber-500">
            Contact Us
          </h3>
          <p className="flex items-center gap-2">
            <Phone size={16} /> +91 8983342468
          </p>
          <p className="flex items-center gap-2">
            <Mail size={16} /> info@homeconnect.com
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={16} /> Kalidas Market, Malkapur, Karad
          </p>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-amber-500">
            Newsletter
          </h3>
          <p className="mb-4 text-sm text-blue-700">
            Stay updated with our latest offers.
          </p>
          <div className="flex items-center bg-blue-50 rounded-xl p-2">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-3 py-2 rounded-xl text-blue-900 outline-none placeholder:text-blue-500 bg-blue-50"
            />
            <button className="bg-amber-500 text-white px-4 py-2 rounded-xl text-sm hover:scale-105 transition-transform cursor-pointer">
              Subscribe
            </button>
          </div>
        </div>
      </MotionDiv>

      {/* Bottom Footer */}
      <div className="mt-12 text-center text-sm text-blue-600">
        © {new Date().getFullYear()} HomeConnect Inc. All rights reserved.
      </div>
    </MotionFooter>
  );
};

export default Footer;
