import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone } from "react-feather";

const { div: MotionDiv, section: MotionSection } = motion;

const TeamSection = () => {
  const [team, setTeam] = useState([]); // State to store team data
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [error, setError] = useState(null); // State to handle error state

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/team"); // Adjust URL based on your backend
        const data = await response.json();
        console.log(data);

        setTeam(data); // Set the fetched data
      } catch (err) {
        setError("Failed to load team data");
        console.log(err);
      } finally {
        setLoading(false); // Set loading to false once the data is fetched
      }
    };

    fetchTeamData();
  }, []); // Empty dependency array means this runs only once when the component mounts

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <MotionSection
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="py-16 bg-gradient-to-r from-blue-50 to-amber-50"
    >
      <MotionDiv className="max-w-screen-xl mx-auto text-center space-y-8">
        <h2 className="text-4xl font-extrabold text-blue-900">Meet Our Team</h2>
        <p className="text-blue-700 font-medium">
          Our experienced sellers are ready to help you
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {team.data.map((seller, index) => (
            <MotionDiv
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-white shadow-xl rounded-2xl overflow-hidden"
            >
              <img
                src={`http://localhost:3000/${seller.image}`}
                alt={seller.first_name + " " + seller.last_name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6 space-y-3 text-left">
                <h3 className="text-xl font-bold text-blue-900">
                  {seller.first_name} {seller.last_name}
                </h3>
                <p className="text-blue-700">{seller.position}</p>
                <a
                  href={`mailto:${seller.email}`}
                  className="flex items-center gap-2 text-blue-700 text-sm"
                >
                  <Mail size={16} /> {seller.email}
                </a>
                {/* <button className="mt-4 w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2 rounded-xl font-semibold hover:scale-105 transition-transform">
                  Contact Seller
                </button> */}
              </div>
            </MotionDiv>
          ))}
        </div>
      </MotionDiv>
    </MotionSection>
  );
};

export default TeamSection;
