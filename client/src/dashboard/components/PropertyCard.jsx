import {
  MapPin,
  Bed,
  Bath,
  Ruler,
  Edit,
  Trash2,
  IndianRupee,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

const PropertyCard = ({ property, onEdit, onDelete }) => {
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [propertyImages, setPropertyImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("userData"));

    if (userData?.userData?.data) {
      setUserRole(userData.userData.data.role);
      setUserId(userData.userData.data.id);
    }

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

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${property.name}?`)) {
      try {
        const token = sessionStorage.getItem("authToken");

        const response = await fetch(
          `http://localhost:3000/api/properties/${property.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          onDelete(property.id); // Update UI after deletion
        } else {
          const data = await response.json();
          alert(data.message || "Failed to delete property");
        }
      } catch (error) {
        console.error("Error deleting property:", error);
      }
    }
  };

  // Handle image path - add server base URL if it's a server path
  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `http://localhost:3000/${path}`;
  };

  // Navigate through property images
  const goToNextImage = (e) => {
    e.stopPropagation();
    if (propertyImages.length === 0) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === propertyImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPreviousImage = (e) => {
    e.stopPropagation();
    if (propertyImages.length === 0) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? propertyImages.length - 1 : prevIndex - 1
    );
  };

  // Get the current image to display
  const getCurrentImage = () => {
    if (
      propertyImages.length > 0 &&
      propertyImages[currentImageIndex] &&
      propertyImages[currentImageIndex].image_path
    ) {
      return getImageUrl(propertyImages[currentImageIndex].image_path);
    }
    if (property.image) {
      return getImageUrl(property.image);
    }
    return "";
  };

  // Helper function to get owner badge color
  const getOwnerBadgeColor = () => {
    return property.owner_type === "seller" ? "bg-green-500" : "bg-purple-500";
  };

  // Check if current user is owner or admin
  const canEditProperty = () => {
    if (userRole === "admin") return true;
    if (userRole === "seller" && property.owner_id === userId) return true;
    return false;
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
            {propertyImages.length > 1 && (
              <>
                <button
                  onClick={goToPreviousImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full shadow-md"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} className="text-gray-700" />
                </button>
                <button
                  onClick={goToNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full shadow-md"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} className="text-gray-700" />
                </button>
              </>
            )}

            {/* Display owner type badge */}
            <div className="absolute top-2 right-2">
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${getOwnerBadgeColor()}`}
              >
                {property.owner_type === "seller" ? "Seller" : "Admin"}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <ImageIcon size={48} className="text-gray-400" />
          </div>
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

        {/* Display owner name */}
        <div className="mt-3 text-sm text-gray-600 flex items-center">
          <User size={14} className="mr-1" /> Owner:{" "}
          {property.owner_name || "Admin"}
        </div>
      </div>

      {canEditProperty() ? (
        <div className="p-4 flex justify-between">
          <button
            onClick={() => onEdit(property)}
            className="text-blue-500 hover:text-blue-700"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={20} />
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default PropertyCard;
