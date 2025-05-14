import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "react-feather";

const { section: MotionSection, div: MotionDiv, img: MotionImg } = motion;

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]); // State to store testimonial data
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [error, setError] = useState(null); // State to handle error state

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/clients"); // Adjust the URL based on your backend
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
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      className="py-20 bg-gradient-to-r from-amber-50 to-blue-50 px-4"
    >
      <div className="max-w-screen-xl mx-auto">
        <h2 className="text-4xl font-extrabold text-blue-900 mb-14 text-center">
          What Our <span className="text-amber-500">Clients Say</span>
        </h2>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.data.map((client, i) => (
            <MotionDiv
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 80 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-amber-500 transition-all flex flex-col items-center text-center"
            >
              <MotionImg
                src={`http://localhost:3000/${client.image}`}
                alt={client.first_name + " " + client.last_name}
                className="w-20 h-20 rounded-full mb-4 object-cover"
                whileHover={{ scale: 1.1 }}
              />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                {client.first_name} {client.last_name}
              </h3>
              <p className="text-gray-600 text-sm mb-3">{client.feedback}</p>
              <div className="flex justify-center gap-1">
                {[...Array(Number(client.rating))].map((_, idx) => (
                  <Star
                    key={idx}
                    size={18}
                    className="text-amber-500"
                    fill="currentColor"
                  />
                ))}
              </div>
            </MotionDiv>
          ))}
        </div>
      </div>
    </MotionSection>
  );
};

export default Testimonials;
