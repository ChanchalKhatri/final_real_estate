import React from "react";
import { motion } from "framer-motion";
import { Users, Shield, Tag, ThumbsUp } from "react-feather";

const { div: MotionDiv, section: MotionSection } = motion;

const WhyChooseUs = () => {
  const reasons = [
    {
      icon: <Users size={28} />,
      title: "Expert Sellers",
      desc: "Our team has years of industry experience to guide you.",
    },
    {
      icon: <Shield size={28} />,
      title: "Verified Properties",
      desc: "We ensure every listing is thoroughly vetted.",
    },
    {
      icon: <Tag size={28} />,
      title: "Best Price Guarantee",
      desc: "Get the best market prices with full transparency.",
    },
    {
      icon: <ThumbsUp size={28} />,
      title: "Customer-first Approach",
      desc: "Your satisfaction is our top priority, always.",
    },
  ];

  return (
    <MotionSection
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.2 } },
      }}
      className="py-20 bg-gradient-to-r from-blue-100 to-amber-100 px-4"
    >
      <MotionDiv className="max-w-screen-xl mx-auto text-center space-y-14">
        <h2 className="text-5xl md:text-6xl font-extrabold text-blue-900 leading-snug">
          Why <span className="text-amber-500">Choose Us</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {reasons.map((item, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{
                y: -6,
                scale: 1.05,
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white/60 backdrop-blur-lg border border-blue-200 rounded-3xl p-6 space-y-4 transition-all duration-300"
            >
              <div className="flex justify-center items-center mx-auto bg-gradient-to-br from-amber-100 to-blue-100 p-4 rounded-full w-fit">
                <span className="text-blue-900">{item.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-blue-900">
                {item.title}
              </h3>
              <p className="text-blue-700 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </MotionDiv>
    </MotionSection>
  );
};

export default WhyChooseUs;
