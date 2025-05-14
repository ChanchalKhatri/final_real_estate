import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User } from "react-feather"; // Add the User icon
import { motion } from "framer-motion";

const { nav: MotionNav, div: MotionDiv } = motion;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // State to toggle dropdown
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      getData();
    }, 200);
  }, [location]);

  const getData = async () => {
    const data = await JSON.parse(sessionStorage.getItem("userData"));
    if (data && data.isLoggedIn) {
      setUserData(data.userData);
    } else {
      setUserData(null);
    }
  };

  const logout = () => {
    sessionStorage.clear();
    localStorage.clear();
    setUserData(null);
    navigate("/");
  };

  return (
    <MotionNav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="backdrop-blur bg-white/80 shadow-lg sticky top-0 z-50 border-b border-gray-200 h-[65px]"
    >
      <div className="max-w-screen-2xl mx-auto px-8 h-full flex justify-between items-center">
        <Link
          to="/"
          className="text-3xl font-extrabold text-blue-900 tracking-tight"
        >
          Home<span className="text-amber-500">Connect</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-14 items-center">
          <Link
            to="/"
            className="text-lg font-medium text-blue-900 hover:text-amber-500 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/property"
            className="text-lg font-medium text-blue-900 hover:text-amber-500 transition-colors"
          >
            Properties
          </Link>
          <Link
            to="/apartment"
            className="text-lg font-medium text-blue-900 hover:text-amber-500 transition-colors"
          >
            Apartments
          </Link>
          <Link
            to="/about"
            className="text-lg font-medium text-blue-900 hover:text-amber-500 transition-colors"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-lg font-medium text-blue-900 hover:text-amber-500 transition-colors"
          >
            Contact
          </Link>
          {userData ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 text-lg font-medium text-blue-900 hover:text-amber-500"
              >
                <User size={20} /> {/* User icon */}
                <span>
                  {userData.first_name} {userData.last_name}
                </span>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white shadow-md rounded-md w-40">
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-blue-900 hover:bg-gray-200"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="text-lg font-medium text-blue-900 hover:text-amber-500 transition-colors"
            >
              Login
            </Link>
          )}
        </div>

        {/* Hamburger Icon */}
        <button
          className="md:hidden text-blue-900"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <MotionDiv
        initial={false}
        animate={
          open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }
        }
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="md:hidden bg-white/90 overflow-hidden"
      >
        <MotionDiv
          animate={open ? { y: 0, opacity: 1 } : { y: -10, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="py-4 px-6 space-y-3"
        >
          <Link
            to="/"
            className="block text-blue-900 text-base hover:text-amber-500 font-medium"
            onClick={() => setOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/property"
            className="block text-blue-900 text-base hover:text-amber-500 font-medium"
            onClick={() => setOpen(false)}
          >
            Properties
          </Link>
          <Link
            to="/apartment"
            className="block text-blue-900 text-base hover:text-amber-500 font-medium"
            onClick={() => setOpen(false)}
          >
            Apartments
          </Link>
          <Link
            to="/about"
            className="block text-blue-900 text-base hover:text-amber-500 font-medium"
            onClick={() => setOpen(false)}
          >
            About
          </Link>
          <Link
            to="/contact"
            className="block text-blue-900 text-base hover:text-amber-500 font-medium"
            onClick={() => setOpen(false)}
          >
            Contact
          </Link>
          {userData ? (
            <>
              <Link
                to="/dashboard"
                className="block text-blue-900 text-base hover:text-amber-500 font-medium"
                onClick={() => setOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="block text-red-600 text-base hover:text-red-800 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="block text-blue-900 text-base hover:text-amber-500 font-medium"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
          )}
        </MotionDiv>
      </MotionDiv>
    </MotionNav>
  );
};

export default Navbar;
