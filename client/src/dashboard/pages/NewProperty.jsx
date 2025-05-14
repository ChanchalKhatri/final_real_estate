import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NewPropertyCard from "../components/NewPropertyCard";
import PropertyForm from "../components/PropertyForm";

const NewProperty = () => {
  const [properties, setProperties] = useState([]);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const propertyId = isEditMode ? id : localStorage.getItem("propertyId");

  // Fetch property data
  const fetchPropertyData = async () => {
    setLoading(true);
    try {
      if (isEditMode) {
        // Fetch the specific property to edit
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
            navigate("/dashboard");
          }
        }
      } else {
        // For new properties or default view
        const response = await fetch(
          `http://localhost:3000/api/userprop/property/${propertyId}`
        );
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setProperties(result.data);
        } else {
          console.error("Unexpected API response:", result);
          setProperties([]);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching property data:", error);
      setLoading(false);
      if (isEditMode) {
        navigate("/dashboard");
      }
    }
  };

  useEffect(() => {
    fetchPropertyData();
  }, [id]);

  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);

      // Create FormData object to handle file uploads
      const form = new FormData();

      // Add all form fields to FormData
      Object.keys(formData).forEach((key) => {
        if (key !== "files") {
          // Don't add the files array directly
          form.append(key, formData[key]);
        }
      });

      // Upload files with the correct field name expected by the server
      if (formData.files && formData.files.length > 0) {
        formData.files.forEach((file) => {
          form.append("propertyImages", file); // This key must match the one expected by multer on the server
        });
      }

      // Log the form data being sent (for debugging)
      console.log(
        "Form data keys being sent:",
        [...form.entries()].map((entry) => entry[0])
      );

      // Get authentication token
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        alert("You must be logged in to add or edit properties");
        navigate("/login");
        return;
      }

      let url = "http://localhost:3000/api/properties";
      let method = "POST";

      if (isEditMode) {
        url = `${url}/${id}`;
        method = "PUT";
        form.append("replaceAllImages", "false");
      }

      const response = await fetch(url, {
        method,
        body: form,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Log response status for debugging
      console.log("Response status:", response.status);

      // Handle text response or JSON response
      let result;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.error("Received non-JSON response:", text);
        result = { success: false, message: "Invalid server response" };
      }

      if (result.success) {
        // Redirect to dashboard on success
        navigate("/dashboard");
      } else {
        console.error("Failed to save property:", result);
        alert(
          "Failed to save property: " + (result.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error saving property:", error);
      alert("An error occurred while saving the property: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // If in edit mode, show the property form
  if (isEditMode) {
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

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-wide text-gray-900">
            {isEditMode ? "✏️ Edit Property" : "➕ Add New Property"}
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">Loading property data...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <PropertyForm
              initialData={property}
              onSubmit={handleFormSubmit}
              isEditMode={isEditMode}
            />
          </div>
        )}
      </div>
    );
  }

  // Default view - show property cards
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
              <NewPropertyCard key={property.id} property={property} />
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

export default NewProperty;
