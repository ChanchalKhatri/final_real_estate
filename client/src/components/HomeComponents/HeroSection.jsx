import React from "react";
import { Search } from "react-feather";
import { motion } from "framer-motion";

const { div: MotionDiv, section: MotionSection } = motion;

const Hero = () => {
  return (
    <MotionSection
      initial={{ opacity: 0.9 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="h-[calc(100vh-65px)] bg-[url('/bc_image.jpeg')] bg-cover bg-center flex items-center justify-center px-4 relative"
    >
      {/* Light overlay without blur */}
      <div className="absolute inset-0 bg-white/30 z-0" />
      <MotionDiv
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="max-w-screen-xl mx-auto w-full text-left pl-4 md:pl-16 space-y-10 z-10"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold text-blue-900 leading-tight">
          Your <span className="text-amber-500">Dream Home</span> Awaits
        </h1>
        <p className="text-lg md:text-xl text-blue-900 font-medium px-18">
          Browse the best properties tailored to your lifestyle and budget.
        </p>
      </MotionDiv>
    </MotionSection>
  );
};

export default Hero;
