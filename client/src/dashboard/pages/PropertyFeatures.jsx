import { useState, useEffect } from "react";
import {
  IndianRupee,
  PlusCircle,
  XCircle,
  Camera,
  X,
  Check,
} from "lucide-react";
import PropertyCard from "../components/PropertyCard";

const PropertyFeatures = () => {
  const [properties, setProperties] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [propertyImages, setPropertyImages] = useState([]);
  const [newProperty, setNewProperty] = useState({
    name: "",
    location: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    description: "",
    property_type: "",
    status: "",
    furnishing: "",
    year_built: "",
    floor_number: "",
    total_floors: "",
    parking_spaces: "",
    image: "",
  });

  const fetchProperties = async () => {
    try {
      console.log("Fetching all properties");
      const response = await fetch(
        "http://localhost:3000/api/properties?isAdmin=true"
      );

      if (!response.ok) {
        console.error(
          `Error fetching properties: ${response.status} ${response.statusText}`
        );
        setProperties([]);
        return;
      }

      const result = await response.json();
      console.log("Properties API response:", result);

      if (result.success && Array.isArray(result.data)) {
        result.data.forEach((property, index) => {
          console.log(
            `Property #${index + 1} (ID: ${property.id}) image path:`,
            property.image
          );
        });

        setProperties(result.data);
      } else {
        console.error("Unexpected API response for properties:", result);
        setProperties([]);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
    }
  };

  const fetchPropertyImages = async (propertyId) => {
    try {
      console.log(`Fetching images for property ID: ${propertyId}`);
      const response = await fetch(
        `http://localhost:3000/api/properties/${propertyId}/images`
      );

      if (!response.ok) {
        console.error(
          `Error fetching property images: ${response.status} ${response.statusText}`
        );
        setPropertyImages([]);
        return;
      }

      const result = await response.json();
      console.log("Property images API response:", result);

      if (result.success && Array.isArray(result.data)) {
        console.log(
          `Received ${result.data.length} property images:`,
          result.data
        );
        setPropertyImages(result.data);
      } else {
        console.error("Unexpected API response for images:", result);
        setPropertyImages([]);
      }
    } catch (error) {
      console.error("Error fetching property images:", error);
      setPropertyImages([]);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Prevent negative values for numeric fields
    if (
      [
        "price",
        "area",
        "year_built",
        "floor_number",
        "total_floors",
        "parking_spaces",
      ].includes(name)
    ) {
      if (value < 0) {
        alert(`${name.replace("_", " ")} cannot be negative`);
        return;
      }
    }

    setNewProperty({ ...newProperty, [name]: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Check if total number of files exceeds 5
    if (files.length + imageFiles.length > 5) {
      alert("You can upload a maximum of 5 images");
      return;
    }

    if (files.length > 0) {
      setImageFiles([...imageFiles, ...files]);

      // Create previews for new files
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    // Create new arrays without the removed image
    const newImageFiles = [...imageFiles];
    const newImagePreviews = [...imagePreviews];

    // Remove the item at index
    newImageFiles.splice(index, 1);
    newImagePreviews.splice(index, 1);

    // Update state
    setImageFiles(newImageFiles);
    setImagePreviews(newImagePreviews);
  };

  const removePropertyImage = async (imageId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/properties/images/${imageId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Refresh property images
        fetchPropertyImages(selectedProperty.id);
      } else {
        console.error("Failed to delete property image");
      }
    } catch (error) {
      console.error("Error deleting property image:", error);
    }
  };

  const setPrimaryImage = async (imageId, propertyId) => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/properties/images/primary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageId, propertyId }),
        }
      );

      if (response.ok) {
        // Refresh property images and property data
        fetchPropertyImages(propertyId);
        fetchProperties();
      } else {
        console.error("Failed to set primary image");
      }
    } catch (error) {
      console.error("Error setting primary image:", error);
    }
  };

  const handleAddOrEditProperty = async () => {
    if (!newProperty.name || !newProperty.location || !newProperty.price)
      return;

    try {
      // Create FormData object to send files and other property data
      const formData = new FormData();

      // Add all property fields to FormData
      Object.keys(newProperty).forEach((key) => {
        if (key !== "image") {
          formData.append(key, newProperty[key]);
        }
      });

      console.log(
        "Form data before image upload:",
        Object.fromEntries(
          Object.keys(newProperty)
            .filter((key) => key !== "image")
            .map((key) => [key, newProperty[key]])
        )
      );

      // Add image files
      if (imageFiles.length > 0) {
        console.log(`Adding ${imageFiles.length} images to form data`);
        imageFiles.forEach((file, index) => {
          console.log(`Image ${index + 1}:`, file.name, file.type, file.size);
          formData.append("propertyImages", file);
        });
        // Make sure this value is sent correctly
        const replaceValue = isEditing ? "false" : "true";
        formData.append("replaceAllImages", replaceValue);
        console.log(`Setting replaceAllImages to: ${replaceValue}`);
      } else {
        console.log("No new images to upload");
      }

      let url = "http://localhost:3000/api/properties";
      let method = "POST";

      if (isEditing && selectedProperty) {
        url = `${url}/${selectedProperty.id}`;
        method = "PUT";
      }

      console.log(`Submitting ${method} request to ${url}`);

      // Get authentication token
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        alert("You must be logged in to add or edit properties");
        return;
      }

      const response = await fetch(url, {
        method,
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      // Better error handling
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server returned error:", errorText);
        alert(
          `Error saving property: ${response.status} ${response.statusText}`
        );
      } else {
        console.log("Property saved successfully");
        fetchProperties();
      }
    } catch (error) {
      console.error("Error saving property:", error);
      alert(`Error saving property: ${error.message}`);
    }

    resetForm();
    setShowModal(false);
  };

  const handleEditProperty = async (property) => {
    setSelectedProperty(property);
    setNewProperty(property);
    setIsEditing(true);
    setShowModal(true);

    // Fetch property images
    await fetchPropertyImages(property.id);

    // Reset file inputs
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleDeleteProperty = async (id) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/properties/${id}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) fetchProperties();
      } catch (error) {
        console.error("Error deleting property:", error);
      }
    }
  };

  const resetForm = () => {
    setNewProperty({
      name: "",
      location: "",
      price: "",
      bedrooms: "",
      bathrooms: "",
      area: "",
      description: "",
      property_type: "",
      status: "",
      furnishing: "",
      year_built: "",
      floor_number: "",
      total_floors: "",
      parking_spaces: "",
      image: "",
    });
    setIsEditing(false);
    setSelectedProperty(null);
    setImageFiles([]);
    setImagePreviews([]);
    setPropertyImages([]);
  };

  const bedroomOptions = [1, 2, 3, 4, 5, 6];
  const bathroomOptions = [1, 2, 3, 4, 5];
  const propertyTypeOption = ["Apartment", "Villa", "Plot"];
  const statusOption = ["available", "sold", "pending"];
  const furnishingOption = ["furnished", "semi-furnished", "unfurnished"];

  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    if (userData?.userData?.data?.role) {
      setUserRole(userData.userData.data.role);
    }
  }, []);

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Debug - log original image path
    console.log("PropertyFeatures - original image path:", imagePath);

    // Check if the image path is a full URL
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // Use the direct path approach as in Dashboard.jsx
    const fullUrl = `http://localhost:3000/${imagePath}`;
    console.log("PropertyFeatures - final image URL:", fullUrl);
    return fullUrl;
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-wide text-gray-900">
          🏡 Property Management
        </h1>
        {(userRole === "admin" || userRole === "seller") && (
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md transition-all hover:shadow-xl"
          >
            <PlusCircle size={22} /> Add Property
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {properties.length > 0 ? (
          properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onEdit={() => handleEditProperty(property)}
              onDelete={() => handleDeleteProperty(property.id)}
            />
          ))
        ) : (
          <p className="text-center col-span-full text-gray-600">
            No properties found.
          </p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center overflow-auto py-10">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl w-full sm:w-5/6 md:w-3/4 lg:w-2/3 xl:w-1/2 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                {isEditing ? "Edit Property" : "Add New Property"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Property Images Upload and Management */}
            <div className="mb-6">
              <h3 className="text-base sm:text-lg font-medium mb-2">
                Property Images (Maximum 5)
              </h3>

              {/* Image upload area */}
              <div className="flex flex-wrap gap-2 sm:gap-4 mb-4">
                {/* Show existing property images (when editing) */}
                {isEditing &&
                  propertyImages.map((img, index) => (
                    <div key={img.id} className="relative w-24 sm:w-32">
                      <div
                        className={`h-20 sm:h-24 border rounded-lg overflow-hidden ${
                          img.is_primary
                            ? "border-4 border-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        <img
                          src={getImageUrl(img.image_path)}
                          alt={`Property ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error("Error loading image:", e.target.src);
                            e.target.onerror = null;
                            e.target.src = "";
                            e.target.parentNode.innerHTML = `
                              <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                                <div class="text-center">
                                  <span class="text-gray-400">Image not found</span>
                                </div>
                              </div>
                            `;
                          }}
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 flex gap-1">
                        {!img.is_primary && (
                          <button
                            onClick={() =>
                              setPrimaryImage(img.id, selectedProperty.id)
                            }
                            className="bg-green-500 rounded-full p-1 text-white"
                            title="Set as primary image"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => removePropertyImage(img.id)}
                          className="bg-red-500 rounded-full p-1 text-white"
                          title="Remove image"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      {img.is_primary && (
                        <span className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs text-center">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}

                {/* Show new image previews */}
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative w-24 sm:w-32">
                    <div className="h-20 sm:h-24 border border-gray-300 rounded-lg overflow-hidden">
                      <img
                        src={preview}
                        alt={`New upload ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Error loading preview:", e.target.src);
                          e.target.onerror = null;
                          e.target.src = "";
                          e.target.parentNode.innerHTML = `
                            <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                              <div class="text-center">
                                <span class="text-gray-400">Preview error</span>
                              </div>
                            </div>
                          `;
                        }}
                      />
                    </div>
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {/* Upload button (only show if less than 5 images) */}
                {imagePreviews.length + (propertyImages?.length || 0) < 5 && (
                  <label className="w-24 sm:w-32 h-20 sm:h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                    <Camera size={24} className="text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Add Images</span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </label>
                )}
              </div>

              <p className="text-sm text-gray-500">
                {isEditing
                  ? "Upload new images or manage existing ones. The first image will be displayed as the main property image."
                  : "Upload up to 5 images. The first image will be displayed as the main property image."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {Object.keys(newProperty).map((key) =>
                key !== "id" && key !== "image" ? (
                  <div
                    key={key}
                    className={key === "description" ? "sm:col-span-2" : ""}
                  >
                    <label className="block text-sm sm:text-base text-gray-700 font-medium capitalize">
                      {key.replace("_", " ")}
                    </label>
                    {key === "bedrooms" || key === "bathrooms" ? (
                      <select
                        name={key}
                        value={newProperty[key]}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select {key}</option>
                        {(key === "bedrooms"
                          ? bedroomOptions
                          : bathroomOptions
                        ).map((option) => (
                          <option key={option} value={option}>
                            {option}{" "}
                            {key === "bedrooms" ? "Bedroom(s)" : "Bathroom(s)"}
                          </option>
                        ))}
                      </select>
                    ) : key === "property_type" ? (
                      <select
                        name={key}
                        value={newProperty[key]}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select Property Type</option>
                        {propertyTypeOption.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : key === "status" ? (
                      <select
                        name={key}
                        value={newProperty[key]}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select Status</option>
                        {statusOption.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : key === "furnishing" ? (
                      <select
                        name={key}
                        value={newProperty[key]}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select Furnishing</option>
                        {furnishingOption.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : key === "description" ? (
                      <textarea
                        name={key}
                        value={newProperty[key]}
                        onChange={handleInputChange}
                        placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                        className="w-full p-2 border rounded-md"
                        rows="3"
                      ></textarea>
                    ) : (
                      <input
                        type={
                          key === "price" ||
                          key === "area" ||
                          key === "year_built" ||
                          key === "floor_number" ||
                          key === "total_floors" ||
                          key === "parking_spaces"
                            ? "number"
                            : "text"
                        }
                        name={key}
                        placeholder={
                          key === "price"
                            ? "Enter Price"
                            : key === "area"
                            ? "Enter Area (sq ft)"
                            : key.charAt(0).toUpperCase() +
                              key.slice(1).replace("_", " ")
                        }
                        value={newProperty[key]}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        min={
                          key === "price" ||
                          key === "area" ||
                          key === "year_built" ||
                          key === "floor_number" ||
                          key === "total_floors" ||
                          key === "parking_spaces"
                            ? 0
                            : undefined
                        }
                        step={key === "price" || key === "area" ? "0.01" : "1"}
                      />
                    )}
                  </div>
                ) : null
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 sm:px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrEditProperty}
                className="px-4 sm:px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm sm:text-base"
              >
                {isEditing ? "Update Property" : "Add Property"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyFeatures;
