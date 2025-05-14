import React from "react";
import { motion } from "framer-motion";
import { Users, Target, Shield } from "react-feather";

const { div: MotionDiv, section: MotionSection } = motion;

const OurStory = () => {
  return (
    <MotionSection
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="py-20 bg-gradient-to-r from-blue-50 to-amber-50 px-4"
    >
      <MotionDiv
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="max-w-screen-xl mx-auto w-full text-center space-y-8"
      >
        <h2 className="text-5xl md:text-6xl font-extrabold text-blue-900">
          Our <span className="text-amber-500">Story</span>
        </h2>
        <p className="text-lg md:text-xl text-blue-800 max-w-3xl mx-auto">
          From a humble beginning to becoming a trusted real estate partner,
          we’ve always stood by our values and passion for people.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <MotionDiv
            whileHover={{ scale: 1.05 }}
            className="p-8 border rounded-2xl shadow-lg bg-white transition hover:border-amber-500 hover:shadow-2xl space-y-4"
          >
            <Users className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="text-2xl font-bold text-blue-900">How We Started</h3>
            <p className="text-blue-700 text-sm">
              It all began with a small, family-run agency focused on connecting
              people with spaces they can call home.
            </p>
          </MotionDiv>

          <MotionDiv
            whileHover={{ scale: 1.05 }}
            className="p-8 border rounded-2xl shadow-lg bg-white transition hover:border-amber-500 hover:shadow-2xl space-y-4"
          >
            <Target className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="text-2xl font-bold text-blue-900">
              Mission & Vision
            </h3>
            <p className="text-blue-700 text-sm">
              To lead with integrity and create a seamless experience for every
              client, while shaping thriving communities.
            </p>
          </MotionDiv>

          <MotionDiv
            whileHover={{ scale: 1.05 }}
            className="p-8 border rounded-2xl shadow-lg bg-white transition hover:border-amber-500 hover:shadow-2xl space-y-4"
          >
            <Shield className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="text-2xl font-bold text-blue-900">Our Values</h3>
            <p className="text-blue-700 text-sm">
              Built on trust, transparency, and a commitment to always put
              clients first.
            </p>
          </MotionDiv>
        </div>
      </MotionDiv>
    </MotionSection>
  );
};

export default OurStory;
