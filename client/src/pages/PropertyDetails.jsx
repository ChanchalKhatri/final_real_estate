import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PropertyDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // State for property data
  const [property, setProperty] = useState(location.state?.property || null);
  const [loading, setLoading] = useState(!property);
  const [error, setError] = useState(null);
  const [propertyImages, setPropertyImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch property if not passed via navigation state
  useEffect(() => {
    if (!property) {
      const fetchProperty = async () => {
        try {
          setLoading(true);
          const response = await fetch(
            `http://localhost:3000/api/properties/${id}`
          );
          const result = await response.json();

          if (result.success && result.data) {
            setProperty(result.data);
          } else {
            setError("Property not found");
          }
        } catch (err) {
          console.error("Error fetching property:", err);
          setError("Failed to load property details");
        } finally {
          setLoading(false);
        }
      };

      fetchProperty();
    }
  }, [id, property]);

  // Fetch property images
  useEffect(() => {
    if (property) {
      const fetchPropertyImages = async () => {
        try {
          const response = await fetch(
            `http://localhost:3000/api/properties/${property.id}/images`
          );
          const result = await response.json();

          if (result.success && Array.isArray(result.data)) {
            setPropertyImages(result.data);
          }
        } catch (error) {
          console.error("Error fetching property images:", error);
          setPropertyImages([]);
        }
      };

      fetchPropertyImages();
    }
  }, [property]);

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

  // Create array of all available property images
  const getAllImages = () => {
    if (!property) return [];

    let images = [];

    // First add the primary image if it exists
    const primaryImage = property.image
      ? { image_path: property.image, is_primary: true }
      : null;

    // Then add all property images
    if (propertyImages.length > 0) {
      images = [...propertyImages];
    } else if (primaryImage) {
      images = [primaryImage];
    }

    // Limit to 5 images
    return images.slice(0, 5);
  };

  const nextImage = () => {
    const images = getAllImages();
    if (images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    const images = getAllImages();
    if (images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
  };

  const handleAddProperty = () => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/dashboard");
    } else {
      if (property.id) {
        localStorage.setItem("propertyId", property.id);
      }

      alert("You are not logged in. Property ID has been saved for later.");
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-blue-900">
          Loading property details...
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-2xl text-red-600">
          {error || "Property not found"}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-xl">
        {/* Image section */}
        <div className="relative h-96 bg-gray-200">
          {getAllImages().length > 0 ? (
            <>
              <img
                src={getImageUrl(getAllImages()[currentImageIndex].image_path)}
                alt={property.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/800x600?text=Image+Not+Available";
                }}
              />

              {/* Navigation arrows - only show if multiple images */}
              {getAllImages().length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
                  >
                    <ChevronRight size={24} />
                  </button>

                  {/* Image counter */}
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded-md">
                    {currentImageIndex + 1} / {getAllImages().length}
                  </div>
                </>
              )}

              <span className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-sm font-bold px-4 py-2 rounded-full shadow-md">
                {property.property_type || property.type}
              </span>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400">No images available</span>
            </div>
          )}
        </div>

        {/* Property details */}
        <div className="px-8 py-10 space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-blue-900">
                {property.name}
              </h1>
              <p className="text-xl text-amber-500 font-semibold mt-2">
                Price: ₹{property.price}
              </p>
              <p className="text-gray-600 mt-1">📍 {property.location}</p>
            </div>
            <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium">
              Status: {property.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-6 bg-gray-50 p-6 rounded-2xl">
            <div className="text-center">
              <p className="text-gray-500 text-sm">Bedrooms</p>
              <p className="text-xl font-bold text-blue-900">
                🛏️ {property.bedrooms}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm">Bathrooms</p>
              <p className="text-xl font-bold text-blue-900">
                🛁 {property.bathrooms}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm">Area</p>
              <p className="text-xl font-bold text-blue-900">
                📐 {property.area} sqft
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-gray-500 text-sm">Furnishing</p>
              <p className="font-semibold">{property.furnishing}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-gray-500 text-sm">Built Year</p>
              <p className="font-semibold">{property.year_built}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-gray-500 text-sm">Floor</p>
              <p className="font-semibold">{property.floor_number}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-gray-500 text-sm">Total Floors</p>
              <p className="font-semibold">{property.total_floors}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl col-span-2">
              <p className="text-gray-500 text-sm">Parking Spaces</p>
              <p className="font-semibold">{property.parking_spaces}</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              Description
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {property.description}
            </p>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <motion.button
              onClick={handleAddProperty}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="w-full py-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xl font-medium rounded-xl hover:from-yellow-500 hover:to-amber-400 transition duration-300 shadow-lg"
            >
              Add Property
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
