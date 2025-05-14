import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone } from "react-feather";

const { section: MotionSection, div: MotionDiv } = motion;

const MeetOurTeam = () => {
  const [team, setTeam] = useState([]); // State to store team data
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [error, setError] = useState(null); // State to handle error state

  // Default fallback image for team members
  const fallbackImage = "https://i.pravatar.cc/150?img=placeholder";

  // Function to validate and format image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return fallbackImage;

    // Check if it's a complete URL with protocol
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    // If it's a relative path to uploads, prepend the server URL
    if (imagePath.includes("uploads")) {
      // Remove "uploads" from the beginning if it exists
      const normalizedPath = imagePath.replace(/^uploads[\\]/, "");
      // Use the server's static file serving URL
      return `http://localhost:3000/uploads/${normalizedPath.replace(
        /\\/g,
        "/"
      )}`;
    }

    return fallbackImage;
  };

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
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.2 } },
      }}
      className="py-20 px-4 bg-gradient-to-r from-blue-100 to-amber-100"
    >
      <MotionDiv className="max-w-screen-xl mx-auto text-center space-y-14">
        <h2 className="text-5xl md:text-6xl font-extrabold text-blue-900 leading-snug">
          Meet <span className="text-amber-500">Our Team</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {team.data.map((member, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{
                y: -6,
                scale: 1.02,
                boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
              }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-white/50 backdrop-blur-lg border border-blue-200 rounded-3xl p-6 space-y-4 transition-all duration-300"
            >
              <img
                src={getImageUrl(member.image)}
                alt={member.first_name + " " + member.last_name}
                className="w-24 h-24 rounded-full object-cover mx-auto"
                onError={(e) => {
                  e.target.src = fallbackImage;
                }}
              />
              <h3 className="text-xl font-semibold text-blue-900">
                {member.first_name} {member.last_name}
              </h3>
              <p className="text-blue-700 text-sm">{member.position}</p>
              <div className="flex justify-center gap-3">
                <a
                  href={`mailto:${member.email}`}
                  className="text-amber-500 hover:text-amber-600"
                >
                  <Mail size={18} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </MotionDiv>
    </MotionSection>
  );
};

export default MeetOurTeam;
