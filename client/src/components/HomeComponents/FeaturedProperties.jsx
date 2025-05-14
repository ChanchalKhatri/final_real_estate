import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const { section: MotionSection, div: MotionDiv, img: MotionImg } = motion;

const FeaturedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/properties");
        const data = await response.json();
        console.log("API Response:", data);

        // Handle different response formats (direct array or nested in data property)
        if (data.success && Array.isArray(data.data)) {
          setProperties(data.data);
        } else if (Array.isArray(data)) {
          setProperties(data);
        } else {
          console.error("Unexpected API response format:", data);
          setError("Invalid data format received from server");
        }
      } catch (err) {
        setError("Failed to load properties");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Get image URL with server base path if needed
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Check if the image path is a full URL
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // Convert Windows backslashes to forward slashes for browser URL compatibility
    const formattedPath = imagePath.replace(/\\/g, "/");

    // Otherwise, prepend the server base URL
    return `http://localhost:3000/${formattedPath}`;
  };

  // Navigate to property details page
  const viewPropertyDetails = (property) => {
    navigate(`/property/${property.id}`, { state: { property } });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // If no properties found
  if (!properties || properties.length === 0) {
    return (
      <div className="py-20 px-4 text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-blue-900 mb-8">
          Featured <span className="text-amber-500">Properties</span>
        </h2>
        <p className="text-lg text-gray-600">
          No properties available at the moment.
        </p>
      </div>
    );
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
    }),
    hover: {
      y: -10,
      scale: 1.03,
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
  };

  // Get the 4 latest properties
  const latestProperties = [...properties]
    .sort(
      (a, b) =>
        new Date(b.created_at || b.updated_at || 0) -
        new Date(a.created_at || a.updated_at || 0)
    )
    .slice(0, 4);

  return (
    <MotionSection
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      viewport={{ once: true }}
      className="py-20 px-4 bg-white"
    >
      <div className="max-w-screen-2xl mx-auto px-4">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-blue-900 mb-16">
          Featured <span className="text-amber-500">Properties</span>
        </h2>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {latestProperties.map((property, i) => (
            <MotionDiv
              key={property.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true }}
              className="group bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
            >
              {/* Image Section */}
              <div className="relative overflow-hidden">
                <MotionImg
                  src={getImageUrl(property.image)}
                  alt={property.location}
                  className="w-full h-52 sm:h-60 object-cover transform group-hover:scale-105 transition-transform duration-300"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/600x400?text=Image+Not+Available";
                  }}
                />
                <span className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                  {property.property_type || property.type}
                </span>
              </div>

              {/* Content Section */}
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-blue-900">
                  {property.name}
                </h3>
                <p className="text-lg font-semibold text-amber-500">
                  Price: {property.price}
                </p>

                <div className="text-sm text-gray-600 flex items-center gap-1">
                  Location: 📍 {property.location}
                </div>

                <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                  Description: {property.description}
                </p>

                <motion.button
                  onClick={() => viewPropertyDetails(property)}
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 250, damping: 12 }}
                  className="w-full py-2 text-white bg-blue-900 hover:bg-blue-800 transition-colors rounded-xl font-medium"
                >
                  View Details
                </motion.button>
              </div>
            </MotionDiv>
          ))}
        </div>
      </div>
    </MotionSection>
  );
};

export default FeaturedProperties;
