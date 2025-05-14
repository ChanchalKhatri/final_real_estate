import {
  MapPin,
  Bed,
  Bath,
  Ruler,
  IndianRupee,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";

const NewPropertyCard = ({ property }) => {
  const [propertyImages, setPropertyImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const property_id = localStorage.getItem("propertyId");
  const user_id = localStorage.getItem("userId");

  useEffect(() => {
    // Fetch property images
    if (property.id) {
      fetchPropertyImages(property.id);
    }
  }, [property.id]);

  const fetchPropertyImages = async (propertyId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/properties/${propertyId}/images`
      );
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setPropertyImages(result.data);
      }
    } catch (error) {
      console.error("Error fetching property images:", error);
    }
  };

  const handleAddProperty = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/userprop/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          property_id: property_id,
          user_id: user_id,
        }),
      });

      const result = await response.json();
      if (result.success) {
        window.alert("Property Added Successfully");
        localStorage.removeItem("propertyId");
      } else {
        window.alert("Failed to add property");
        console.log("API Error", result);
      }
    } catch (error) {
      console.error("Error adding property:", error);
    }
  };

  // Handle image path - add server base URL if it's a server path
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Check if the image path is a full URL
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // Otherwise, prepend the server base URL
    return `http://localhost:3000/${imagePath}`;
  };

  // Create array of all available property images
  const getAllImages = () => {
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

  const nextImage = (e) => {
    e.stopPropagation();
    if (getAllImages().length > 0) {
      setCurrentImageIndex((prev) =>
        prev === getAllImages().length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (getAllImages().length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? getAllImages().length - 1 : prev - 1
      );
    }
  };

  // Determine which image to display
  const getCurrentImage = () => {
    const images = getAllImages();
    // If property images are loaded and there are some
    if (images.length > 0) {
      return getImageUrl(images[currentImageIndex].image_path);
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl">
      <div className="relative">
        {property.image || propertyImages.length > 0 ? (
          <div className="relative">
            <img
              src={getCurrentImage()}
              alt={property.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                console.error("Error loading property image");
                e.target.onerror = null;
                e.target.src = "";
                e.target.parentNode.innerHTML = `
                  <div class="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <ImageIcon size={48} className="text-gray-400" />
                  </div>
                `;
              }}
            />

            {/* Navigation arrows - only show if multiple images */}
            {getAllImages().length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Image counter */}
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
                  {currentImageIndex + 1} / {getAllImages().length}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <ImageIcon size={48} className="text-gray-400" />
          </div>
        )}
        {property.tag && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            {property.tag}
          </span>
        )}
      </div>

      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900">{property.name}</h2>
        <p className="text-gray-500 flex items-center gap-1 text-sm">
          <MapPin size={14} /> {property.location}
        </p>
        <p className="text-blue-500 flex items-center gap-1 font-semibold mt-2">
          <IndianRupee size={16} /> {property.price}
        </p>
        <div className="flex justify-between mt-3 text-gray-600 text-sm border-t pt-4">
          <span className="flex items-center gap-1">
            <Bed size={14} /> {property.bedrooms} Beds
          </span>
          <span className="flex items-center gap-1">
            <Bath size={14} /> {property.bathrooms} Baths
          </span>
          <span className="flex items-center gap-1">
            <Ruler size={14} /> {property.area} sq.ft
          </span>
        </div>
      </div>

      <div className="p-4 border-t">
        <button
          onClick={handleAddProperty}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-all"
        >
          Add Property
        </button>
      </div>
    </div>
  );
};

export default NewPropertyCard;
