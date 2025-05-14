import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, DollarSign, Users, Headphones } from "react-feather";

const { section: MotionSection, div: MotionDiv } = motion;

const benefits = [
  { id: 1, label: "Verified Listings", icon: CheckCircle },
  { id: 2, label: "Best Price Guarantee", icon: DollarSign },
  { id: 3, label: "Expert Sellers", icon: Users },
  { id: 4, label: "24/7 Customer Support", icon: Headphones },
];

const WhyChooseUs = () => {
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
          Why <span className="text-amber-500">Choose Us</span>
        </h2>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item, i) => {
            const Icon = item.icon;
            return (
              <MotionDiv
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 90 }}
                whileHover={{
                  scale: 1.05,
                  rotate: 0.5,
                  boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 flex flex-col items-center text-center border border-gray-200 hover:border-amber-500 transition-all"
              >
                <MotionDiv
                  whileHover={{ rotate: 5 }}
                  className="text-amber-500 mb-5"
                >
                  <Icon size={40} />
                </MotionDiv>
                <h3 className="text-lg font-semibold text-blue-900 tracking-wide">
                  {item.label}
                </h3>
              </MotionDiv>
            );
          })}
        </div>
      </div>
    </MotionSection>
  );
};

export default WhyChooseUs;
