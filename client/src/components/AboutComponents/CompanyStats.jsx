import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Home, Smile, Award } from "react-feather";

const { div: MotionDiv, section: MotionSection } = motion;

const CompanyStats = () => {
  const stats = [
    { icon: <Briefcase size={32} />, value: "15+", label: "Years in Business" },
    { icon: <Home size={32} />, value: "500+", label: "Properties Sold" },
    { icon: <Smile size={32} />, value: "300+", label: "Happy Clients" },
    { icon: <Award size={32} />, value: "10+", label: "Awards Won" },
  ];

  return (
    <MotionSection
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="py-20 bg-white px-4"
    >
      <MotionDiv className="max-w-screen-xl mx-auto text-center space-y-16">
        <h2 className="text-5xl md:text-6xl font-extrabold text-blue-900 leading-snug">
          Our <span className="text-amber-500">Achievements</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <MotionDiv
              key={index}
              whileHover={{
                y: -5,
                boxShadow: "0px 8px 25px rgba(0, 0, 0, 0.1)",
              }}
              className="backdrop-blur-lg bg-white/50 border border-blue-100 rounded-3xl p-8 space-y-4 transition-all duration-300"
            >
              <div className="bg-gradient-to-br from-blue-100 to-amber-100 p-3 rounded-full w-fit mx-auto">
                <span className="text-amber-500">{stat.icon}</span>
              </div>
              <h3 className="text-4xl font-bold text-blue-900">{stat.value}</h3>
              <p className="text-blue-700 font-medium">{stat.label}</p>
            </MotionDiv>
          ))}
        </div>
      </MotionDiv>
    </MotionSection>
  );
};

export default CompanyStats;
