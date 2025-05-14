import { useState, useEffect, useRef } from "react";

const PropertyForm = ({ initialData, onSubmit, isEditMode }) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    description: "",
    property_type: "apartment",
    status: "for_sale",
    furnishing: "unfurnished",
    year_built: "",
    floor_number: "",
    total_floors: "",
    parking_spaces: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  // Populate form with initial data if in edit mode
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        location: initialData.location || "",
        price: initialData.price || "",
        bedrooms: initialData.bedrooms || "",
        bathrooms: initialData.bathrooms || "",
        area: initialData.area || "",
        description: initialData.description || "",
        property_type: initialData.property_type || "apartment",
        status: initialData.status || "for_sale",
        furnishing: initialData.furnishing || "unfurnished",
        year_built: initialData.year_built || "",
        floor_number: initialData.floor_number || "",
        total_floors: initialData.total_floors || "",
        parking_spaces: initialData.parking_spaces || "",
      });
    }
  }, [initialData]);

  // Cleanup previews when component unmounts
  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length > 5) {
      alert("You can upload a maximum of 5 images");
      return;
    }

    setFiles(selectedFiles);

    // Create preview URLs
    const newPreviews = selectedFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    // Clear old previews to prevent memory leaks
    previews.forEach((preview) => URL.revokeObjectURL(preview.url));

    setPreviews(newPreviews);
  };

  const removeFile = (index) => {
    // Create a new FileList without the file at index
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);

    // Remove the preview
    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index].url); // Clean up to prevent memory leaks
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);

    // Reset the file input if all files are removed
    if (newFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      "name",
      "location",
      "price",
      "bedrooms",
      "bathrooms",
      "area",
      "description",
      "property_type",
      "status",
      "furnishing",
      "year_built",
      "floor_number",
      "total_floors",
      "parking_spaces",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = "This field is required";
      }
    });

    // Validate numeric fields
    const numericFields = [
      "price",
      "bedrooms",
      "bathrooms",
      "area",
      "year_built",
      "floor_number",
      "total_floors",
      "parking_spaces",
    ];
    numericFields.forEach((field) => {
      if (formData[field] && isNaN(formData[field])) {
        errors[field] = "Must be a number";
      }
    });

    // Validate at least one image for new properties
    if (!isEditMode && files.length === 0) {
      errors.images = "At least one image is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setUploading(true);

      // Convert numeric fields to numbers
      const numericFields = [
        "price",
        "bedrooms",
        "bathrooms",
        "area",
        "year_built",
        "floor_number",
        "total_floors",
        "parking_spaces",
      ];
      const formattedData = { ...formData };

      numericFields.forEach((field) => {
        if (formData[field]) {
          formattedData[field] = Number(formData[field]);
        }
      });

      // Make sure property_type, status, and furnishing are set even if unchanged
      if (!formattedData.property_type)
        formattedData.property_type = "apartment";
      if (!formattedData.status) formattedData.status = "for_sale";
      if (!formattedData.furnishing) formattedData.furnishing = "unfurnished";

      // Add files to formData for upload
      formattedData.files = files;

      // Log what's being submitted for debugging
      console.log("Submitting property data:", formattedData);

      onSubmit(formattedData)
        .catch((err) => {
          console.error("Error in form submission:", err);
          alert("Error submitting form: " + err.message);
        })
        .finally(() => setUploading(false));
    } else {
      // Scroll to the first error
      const firstErrorField = Object.keys(formErrors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element)
          element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Basic Information
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                formErrors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter property name"
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                formErrors.location ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter location"
            />
            {formErrors.location && (
              <p className="mt-1 text-sm text-red-500">{formErrors.location}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price *
            </label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                formErrors.price ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter price"
            />
            {formErrors.price && (
              <p className="mt-1 text-sm text-red-500">{formErrors.price}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms *
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  formErrors.bedrooms ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Number of bedrooms"
              />
              {formErrors.bedrooms && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.bedrooms}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms *
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  formErrors.bathrooms ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Number of bathrooms"
              />
              {formErrors.bathrooms && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.bathrooms}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area (sq.ft) *
            </label>
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                formErrors.area ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Area in square feet"
            />
            {formErrors.area && (
              <p className="mt-1 text-sm text-red-500">{formErrors.area}</p>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Additional Information
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Type
            </label>
            <select
              name="property_type"
              value={formData.property_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="villa">Villa</option>
              <option value="land">Land</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="for_sale">For Sale</option>
              <option value="for_rent">For Rent</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Furnishing
            </label>
            <select
              name="furnishing"
              value={formData.furnishing}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="unfurnished">Unfurnished</option>
              <option value="semi_furnished">Semi-Furnished</option>
              <option value="fully_furnished">Fully Furnished</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Built *
              </label>
              <input
                type="number"
                name="year_built"
                value={formData.year_built}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  formErrors.year_built ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Year built"
              />
              {formErrors.year_built && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.year_built}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parking Spaces *
              </label>
              <input
                type="number"
                name="parking_spaces"
                value={formData.parking_spaces}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  formErrors.parking_spaces
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Number of parking spaces"
              />
              {formErrors.parking_spaces && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.parking_spaces}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floor Number *
              </label>
              <input
                type="number"
                name="floor_number"
                value={formData.floor_number}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  formErrors.floor_number ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Floor number"
              />
              {formErrors.floor_number && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.floor_number}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Floors *
              </label>
              <input
                type="number"
                name="total_floors"
                value={formData.total_floors}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  formErrors.total_floors ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Total floors in building"
              />
              {formErrors.total_floors && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.total_floors}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={5}
          className={`w-full px-3 py-2 border rounded-md ${
            formErrors.description ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter property description"
        ></textarea>
        {formErrors.description && (
          <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
        )}
      </div>

      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Property Images {!isEditMode && "*"}
        </label>
        <div
          className={`border-2 border-dashed ${
            formErrors.images ? "border-red-500" : "border-gray-300"
          } p-6 rounded-md`}
        >
          <div className="text-center mb-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="property-images"
            />
            <label
              htmlFor="property-images"
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md cursor-pointer hover:bg-blue-200 transition-colors"
            >
              Select Images
            </label>
            <p className="text-sm text-gray-500 mt-2">
              {isEditMode
                ? "Upload new images to add to this property."
                : "Please upload at least one image (max 5 images)."}
            </p>
          </div>

          {/* Image previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
              {previews.map((preview, index) => (
                <div
                  key={index}
                  className="relative rounded-md overflow-hidden h-24"
                >
                  <img
                    src={preview.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {formErrors.images && (
            <p className="mt-2 text-sm text-red-500">{formErrors.images}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
          disabled={uploading}
        >
          {uploading
            ? "Saving..."
            : isEditMode
            ? "Update Property"
            : "Add Property"}
        </button>
      </div>
    </form>
  );
};

export default PropertyForm;
