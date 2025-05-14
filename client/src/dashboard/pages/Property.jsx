import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MyPropertyCard from "../components/PropertyPropertyCard";

const Property = () => {
  const [properties, setProperties] = useState([]);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  const userDataString = sessionStorage.getItem("userData");
  const parsedUserData = userDataString ? JSON.parse(userDataString) : null;
  const userId = parsedUserData?.userData?.data?.id;
  const userRole = parsedUserData?.userData?.data?.role;

  // Get image URL with server base path if needed
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Check if the image path is a full URL
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // Convert Windows backslashes to forward slashes for browser URL compatibility
    const formattedPath = imagePath.replace(/\\/g, "/");

    // Add the server base URL
    return `http://localhost:3000/${formattedPath}`;
  };

  // Fetch properties for the user
  const fetchProperties = async () => {
    try {
      setLoading(true);

      // If viewing a specific property
      if (id) {
        const response = await fetch(
          `http://localhost:3000/api/properties?isAdmin=true`
        );
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          const foundProperty = result.data.find(
            (prop) => prop.id === parseInt(id)
          );
          if (foundProperty) {
            setProperty(foundProperty);
          } else {
            console.error("Property not found with ID:", id);
            // Redirect back to dashboard if property not found
            navigate("/dashboard");
          }
        }
      }
      // If viewing all user properties
      else {
        const response = await fetch(
          `http://localhost:3000/api/userprop/${userId}`
        );
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          // Filter properties to only include those added by the user
          const userAddedProperties = result.data.filter(
            (prop) => prop.user_id === userId
          );
          setProperties(userAddedProperties);
        } else {
          console.error("Unexpected API response:", result);
          setProperties([]);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [id, userId]);

  // If in single property view mode
  if (id) {
    return (
      <div className="p-8 min-h-screen bg-gray-100">
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            ← Back to Dashboard
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading property details...</div>
        ) : property ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-64 bg-gray-200">
              {property.image ? (
                <img
                  src={getImageUrl(property.image)}
                  alt={property.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error(
                      "Error loading property image:",
                      e.target.src
                    );
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/800x600?text=Image+Not+Available";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </div>

            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {property.name}
              </h1>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="bg-blue-50 px-3 py-1 rounded-full text-blue-800">
                  {property.property_type}
                </div>
                <div className="bg-green-50 px-3 py-1 rounded-full text-green-800">
                  {property.status}
                </div>
                <div className="bg-amber-50 px-3 py-1 rounded-full text-amber-800">
                  {property.furnishing}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Property Details
                  </h2>
                  <div className="space-y-2">
                    <p className="flex justify-between border-b border-gray-100 py-2">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{property.location}</span>
                    </p>
                    <p className="flex justify-between border-b border-gray-100 py-2">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium text-amber-600">
                        {property.price}
                      </span>
                    </p>
                    <p className="flex justify-between border-b border-gray-100 py-2">
                      <span className="text-gray-600">Bedrooms:</span>
                      <span className="font-medium">{property.bedrooms}</span>
                    </p>
                    <p className="flex justify-between border-b border-gray-100 py-2">
                      <span className="text-gray-600">Bathrooms:</span>
                      <span className="font-medium">{property.bathrooms}</span>
                    </p>
                    <p className="flex justify-between border-b border-gray-100 py-2">
                      <span className="text-gray-600">Area:</span>
                      <span className="font-medium">{property.area} sq.ft</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Additional Info
                  </h2>
                  <div className="space-y-2">
                    <p className="flex justify-between border-b border-gray-100 py-2">
                      <span className="text-gray-600">Year Built:</span>
                      <span className="font-medium">{property.year_built}</span>
                    </p>
                    <p className="flex justify-between border-b border-gray-100 py-2">
                      <span className="text-gray-600">Floor:</span>
                      <span className="font-medium">
                        {property.floor_number} / {property.total_floors}
                      </span>
                    </p>
                    <p className="flex justify-between border-b border-gray-100 py-2">
                      <span className="text-gray-600">Parking Spaces:</span>
                      <span className="font-medium">
                        {property.parking_spaces}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">
                  {property.description}
                </p>
              </div>

              {(userRole === "admin" || userRole === "seller") && (
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() =>
                      navigate(`/dashboard/property/edit/${property.id}`)
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg"
                  >
                    Edit Property
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">
              Property not found or has been removed.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Default view - show all user properties
  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-wide text-gray-900">
          🏡 Property Management
        </h1>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading properties...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {properties.length > 0 ? (
            properties.map((property) => (
              <MyPropertyCard key={property.id} property={property} />
            ))
          ) : (
            <p className="text-center col-span-full text-gray-600">
              No properties found.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Property;
