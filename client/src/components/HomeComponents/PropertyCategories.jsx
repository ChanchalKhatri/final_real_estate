import React from "react";
import { motion } from "framer-motion";

const { section: MotionSection, div: MotionDiv } = motion;

const categories = [
  { id: 1, label: "Apartments", icon: "🏢" },
  { id: 2, label: "Villas", icon: "🏡" },
  { id: 3, label: "Offices", icon: "🏢" },
  { id: 4, label: "Lands / Plots", icon: "🌳" },
];

const PropertyCategories = () => {
  return (
    <MotionSection
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      viewport={{ once: true }}
      className="py-20 bg-gradient-to-r from-blue-50 to-amber-50 px-4"
    >
      <div className="max-w-screen-xl mx-auto">
        <h2 className="text-4xl font-extrabold text-blue-900 mb-14 text-center">
          Property <span className="text-amber-500">Categories</span>
        </h2>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, i) => (
            <MotionDiv
              key={category.id}
              initial={{ opacity: 0, y: 40, rotateX: -10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: i * 0.15, type: "spring", stiffness: 90 }}
              whileHover={{
                scale: 1.05,
                rotate: 0.5,
                boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
              }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 flex flex-col items-center text-center transition-all border border-gray-200 hover:border-amber-500"
            >
              <MotionDiv
                whileHover={{ scale: 1.2, rotate: 3 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-5xl mb-6"
              >
                {category.icon}
              </MotionDiv>
              <h3 className="text-xl font-semibold text-blue-900 tracking-wide">
                {category.label}
              </h3>
              <div className="w-8 h-1 bg-amber-500 mt-4 rounded-full"></div>
            </MotionDiv>
          ))}
        </div>
      </div>
    </MotionSection>
  );
};

export default PropertyCategories;
