import React from "react";
import { Home } from "react-feather";
import { motion } from "framer-motion";

const { section: MotionSection, div: MotionDiv } = motion;

const PropertiesHero = ({
  title = "Find Your Perfect Property",
  subtitle = "Browse through our handpicked listings to find your dream home today.",
  buttonText = "View Properties",
}) => {
  return (
    <MotionSection
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="h-[calc(100vh-65px)] bg-gradient-to-r from-blue-100 to-amber-100 flex items-center justify-center px-4"
    >
      <MotionDiv
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="max-w-screen-xl mx-auto w-full text-center space-y-10"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold text-blue-900 leading-tight">
          {title.split(" ").slice(0, -1).join(" ")}{" "}
          <span className="text-amber-500">{title.split(" ").slice(-1)}</span>
        </h1>
        <p className="text-lg md:text-xl text-blue-800 font-medium">
          {subtitle}
        </p>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex justify-center"
        >
          <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 px-8 rounded-xl font-semibold hover:scale-105 transition-transform cursor-pointer">
            <Home size={18} /> {buttonText}
          </button>
        </MotionDiv>
      </MotionDiv>
    </MotionSection>
  );
};

export default PropertiesHero;
