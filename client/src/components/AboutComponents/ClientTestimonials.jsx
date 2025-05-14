import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "react-feather";

const { section: MotionSection, div: MotionDiv } = motion;

const ClientTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]); // State to store testimonial data
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [error, setError] = useState(null); // State to handle error state

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/clients"); // Adjust URL based on your backend
        const data = await response.json();
        console.log(data);

        setTestimonials(data); // Set the fetched data
      } catch (err) {
        setError("Failed to load testimonials");
        console.log(err);
      } finally {
        setLoading(false); // Set loading to false once the data is fetched
      }
    };

    fetchTestimonials();
  }, []); // Empty dependency array means this runs only once when the component mounts

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <MotionSection
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.2 } },
      }}
      className="py-20 px-4 bg-gradient-to-r from-amber-100 to-blue-100"
    >
      <MotionDiv className="max-w-screen-xl mx-auto text-center space-y-14">
        <h2 className="text-5xl md:text-6xl font-extrabold text-blue-900 leading-snug">
          What Our <span className="text-amber-500">Clients Say</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.data.map((item, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 180 }}
              className="bg-white/50 backdrop-blur-lg border border-blue-200 rounded-3xl p-8 space-y-4 shadow-md"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-amber-400"
              />
              <p className="text-blue-800 italic">"{item.feedback}"</p>
              <div className="flex justify-center gap-1 text-amber-500">
                {[...Array(Number(item.rating))].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <h4 className="text-lg font-semibold text-blue-900">
                {item.first_name} {item.last_name}
              </h4>
            </motion.div>
          ))}
        </div>
      </MotionDiv>
    </MotionSection>
  );
};

export default ClientTestimonials;
