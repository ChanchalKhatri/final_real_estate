import { useState, useEffect } from "react";
import { PlusCircle, XCircle, Camera } from "lucide-react";
import ClientCard from "../components/ClientCard";

const ClientSays = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [newTestimonial, setNewTestimonial] = useState({
    first_name: "",
    last_name: "",
    feedback: "",
    rating: 5,
    image: "",
  });

  // Fetch testimonials from backend
  const fetchTestimonials = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/clients");
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setTestimonials(result.data);
      } else {
        console.error("Unexpected API response:", result);
        setTestimonials([]);
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      setTestimonials([]);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleInputChange = (e) => {
    setNewTestimonial({ ...newTestimonial, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Add or Edit a Testimonial
  const handleAddOrEditTestimonial = async () => {
    if (
      !newTestimonial.first_name ||
      !newTestimonial.last_name ||
      !newTestimonial.feedback
    ) {
      return;
    }

    try {
      // Create a FormData object to send file and other data
      const formData = new FormData();
      formData.append("first_name", newTestimonial.first_name);
      formData.append("last_name", newTestimonial.last_name);
      formData.append("feedback", newTestimonial.feedback);
      formData.append("rating", newTestimonial.rating);

      // Append image file if available
      if (imageFile) {
        formData.append("image", imageFile);
      }

      let response;
      if (isEditing) {
        response = await fetch(
          `http://localhost:3000/api/clients/${selectedTestimonial.id}`,
          {
            method: "PUT",
            body: formData,
          }
        );
      } else {
        response = await fetch("http://localhost:3000/api/clients", {
          method: "POST",
          body: formData,
        });
      }

      if (response.ok) {
        fetchTestimonials(); // Fetch updated data after add/edit
      }
    } catch (error) {
      console.error("Error saving testimonial:", error);
    }

    // Reset form
    setShowModal(false);
    setIsEditing(false);
    resetForm();
  };

  // Edit a testimonial
  const handleEditTestimonial = (testimonial) => {
    setNewTestimonial(testimonial);
    setSelectedTestimonial(testimonial);
    setIsEditing(true);
    setShowModal(true);

    // Set image preview if there's an existing image
    if (testimonial.image) {
      // For server-stored images, we need to include the base URL
      setImagePreview(`http://localhost:3000/${testimonial.image}`);
    } else {
      setImagePreview(null);
    }
    setImageFile(null);
  };

  // Delete a testimonial
  const handleDeleteTestimonial = async (id) => {
    if (window.confirm("Are you sure you want to delete this testimonial?")) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/clients/${id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          fetchTestimonials(); // Fetch updated data after delete
        }
      } catch (error) {
        console.error("Error deleting testimonial:", error);
      }
    }
  };

  const resetForm = () => {
    setNewTestimonial({
      first_name: "",
      last_name: "",
      feedback: "",
      rating: 5,
      image: "",
    });
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-wide text-gray-900">
          💬 Client Testimonials
        </h1>
        <button
          onClick={() => {
            resetForm();
            setIsEditing(false);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md transition-all hover:shadow-xl"
        >
          <PlusCircle size={22} /> Add Testimonial
        </button>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {testimonials.length > 0 ? (
          testimonials.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={handleEditTestimonial}
              onDelete={() => handleDeleteTestimonial(client.id)}
            />
          ))
        ) : (
          <p className="text-center col-span-full text-gray-600">
            No testimonials found.
          </p>
        )}
      </div>

      {/* Add/Edit Testimonial Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-10 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl shadow-xl w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                {isEditing ? "Edit Testimonial" : "Add Client Testimonial"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Image Preview and Upload */}
            <div className="flex flex-col items-center mb-4">
              {imagePreview ? (
                <div className="relative mb-3">
                  <img
                    src={imagePreview}
                    alt="Client Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                  />
                  <label
                    htmlFor="client-image"
                    className="absolute bottom-0 right-0 bg-blue-500 p-1 rounded-full cursor-pointer"
                  >
                    <Camera size={16} className="text-white" />
                  </label>
                </div>
              ) : (
                <label
                  htmlFor="client-image"
                  className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer mb-3 hover:bg-gray-50"
                >
                  <Camera size={24} className="text-gray-400" />
                </label>
              )}
              <input
                type="file"
                id="client-image"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              <span className="text-sm text-gray-500">
                {imageFile ? imageFile.name : "Click to upload client image"}
              </span>
            </div>

            {/* Input Fields */}
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={newTestimonial.first_name}
              onChange={handleInputChange}
              className="w-full p-2 mb-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={newTestimonial.last_name}
              onChange={handleInputChange}
              className="w-full p-2 mb-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              name="feedback"
              placeholder="Client Feedback"
              value={newTestimonial.feedback}
              onChange={handleInputChange}
              className="w-full p-2 mb-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Rating Selection */}
            <label className="block mb-2 text-gray-700">Rating:</label>
            <select
              name="rating"
              value={newTestimonial.rating}
              onChange={handleInputChange}
              className="w-full p-2 mb-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[5, 4, 3, 2, 1].map((star) => (
                <option key={star} value={star}>
                  {`${"⭐".repeat(star)} (${star} rating)`}
                </option>
              ))}
            </select>

            {/* Modal Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrEditTestimonial}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {isEditing ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientSays;
