import { useState, useEffect } from "react";
import {
  Building,
  PlusCircle,
  XCircle,
  Camera,
  X,
  Check,
  Plus,
  Minus,
} from "lucide-react";

const Apartments = () => {
  const [apartments, setApartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isMultiUnit, setIsMultiUnit] = useState(false);
  const [totalFloors, setTotalFloors] = useState(1);
  const [unitsPerFloor, setUnitsPerFloor] = useState(1);
  const [floorProperties, setFloorProperties] = useState([]);
  const [newApartment, setNewApartment] = useState({
    name: "",
    location: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    description: "",
    floor_number: "",
    amenities: "",
    status: "available",
    owner_id: null,
    owner_type: "admin",
  });

  // Parse sessionStorage
  let userId = null;
  let userRole = "admin";
  try {
    const sessionData = sessionStorage.getItem("userData");
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      if (
        parsed.isLoggedIn &&
        parsed.userData?.data?.id &&
        parsed.userData?.data?.role
      ) {
        userId = parsed.userData.data.id;
        userRole = parsed.userData.data.role;
        console.log(
          `[Apartments.jsx] Parsed sessionStorage: userId=${userId}, userRole=${userRole}`
        );
      } else {
        console.warn(
          "[Apartments.jsx] Invalid sessionStorage structure:",
          parsed
        );
      }
    } else {
      console.warn("[Apartments.jsx] No sessionStorage data found for 'user'");
    }
  } catch (error) {
    console.error("[Apartments.jsx] Error parsing sessionStorage:", error);
  }

  const fetchApartments = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/apartments");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setApartments(result.data);
      } else {
        console.error("[Apartments.jsx] Invalid apartments response:", result);
        setApartments([]);
      }
    } catch (error) {
      console.error("[Apartments.jsx] Fetch apartments error:", error);
      setApartments([]);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (
      ["price", "area", "bedrooms", "bathrooms", "floor_number"].includes(name)
    ) {
      if (value < 0) {
        alert(`${name.replace("_", " ")} cannot be negative`);
        return;
      }
    }
    setNewApartment({ ...newApartment, [name]: value });
  };

  const handleMultiUnitToggle = (e) => {
    setIsMultiUnit(e.target.checked);
    if (e.target.checked) {
      generateFloorProperties(totalFloors, unitsPerFloor);
    } else {
      setFloorProperties([]);
    }
  };

  const handleTotalFloorsChange = (e) => {
    const floors = parseInt(e.target.value) || 1;
    setTotalFloors(floors);
    generateFloorProperties(floors, unitsPerFloor);
  };

  const handleUnitsPerFloorChange = (e) => {
    const units = parseInt(e.target.value) || 1;
    setUnitsPerFloor(units);
    generateFloorProperties(totalFloors, units);
  };

  const generateFloorProperties = (floors, unitsPerFloor) => {
    const newFloorProperties = [];
    for (let floor = 1; floor <= floors; floor++) {
      const floorUnits = [];
      for (let unit = 1; unit <= unitsPerFloor; unit++) {
        floorUnits.push({
          unitNumber: `${floor}${String.fromCharCode(64 + unit)}`,
          area: "",
          bedrooms: "",
          bathrooms: "",
          price: "",
          status: "available",
        });
      }
      newFloorProperties.push({
        floorNumber: floor,
        units: floorUnits,
      });
    }
    setFloorProperties(newFloorProperties);
  };

  const handlePropertyInputChange = (floorIndex, unitIndex, field, value) => {
    const updatedFloorProperties = [...floorProperties];
    updatedFloorProperties[floorIndex].units[unitIndex][field] = value;
    setFloorProperties(updatedFloorProperties);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 5) {
      alert("You can upload a maximum of 5 images");
      return;
    }
    if (files.length > 0) {
      setImageFiles([...imageFiles, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    const newImageFiles = [...imageFiles];
    const newImagePreviews = [...imagePreviews];
    newImageFiles.splice(index, 1);
    newImagePreviews.splice(index, 1);
    setImageFiles(newImageFiles);
    setImagePreviews(newImagePreviews);
  };

  const handleAddOrEditApartment = async () => {
    try {
      if (!newApartment.name || !newApartment.location) {
        alert("Building Name and Location are required");
        return;
      }

      const formData = new FormData();
      Object.keys(newApartment).forEach((key) => {
        if (key !== "owner_id" && key !== "owner_type") {
          formData.append(key, newApartment[key]);
        }
      });

      // Explicitly set owner_id and owner_type
      formData.append("owner_id", userId || "");
      formData.append("owner_type", userRole);

      formData.append("isMultiUnit", isMultiUnit);
      if (isMultiUnit) {
        formData.append("totalFloors", totalFloors);
        formData.append("unitsPerFloor", unitsPerFloor);
        formData.append("floorProperties", JSON.stringify(floorProperties));
      }

      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      // Log FormData
      console.log("[Apartments.jsx] Sending FormData:");
      for (let [key, value] of formData.entries()) {
        console.log(`[Apartments.jsx] ${key}: ${value}`);
      }

      const url = isEditing
        ? `http://localhost:3000/api/apartments/${selectedApartment.id}`
        : "http://localhost:3000/api/apartments";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      if (result.success) {
        console.log("[Apartments.jsx] Success:", result);
        resetForm();
        fetchApartments();
        setShowModal(false);
      } else {
        alert(
          `Failed to ${isEditing ? "update" : "add"} apartment: ${
            result.message
          }`
        );
      }
    } catch (error) {
      console.error(
        `[Apartments.jsx] Error ${
          isEditing ? "updating" : "adding"
        } apartment:`,
        error
      );
      alert(`Error: ${error.message}`);
    }
  };

  const handleEditApartment = async (apartment) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/apartments/${apartment.id}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      if (!result.success || !result.data)
        throw new Error("Invalid apartment data");

      const apartmentData = result.data;
      setSelectedApartment(apartmentData);
      setNewApartment({
        name: apartmentData.name,
        location: apartmentData.location,
        price: apartmentData.price || "",
        bedrooms: apartmentData.bedrooms || "",
        bathrooms: apartmentData.bathrooms || "",
        area: apartmentData.area || "",
        description: apartmentData.description || "",
        floor_number: apartmentData.floor_number || "",
        amenities: apartmentData.amenities || "",
        status: apartmentData.status || "available",
        owner_id: apartmentData.owner_id || null,
        owner_type: apartmentData.owner_type || "admin",
      });

      const hasUnits = apartmentData.units && apartmentData.units.length > 0;
      const isMultiUnitBuilding = hasUnits && apartmentData.units.length > 1;
      setIsMultiUnit(isMultiUnitBuilding);

      if (isMultiUnitBuilding && hasUnits) {
        const unitsByFloor = {};
        apartmentData.units.forEach((unit) => {
          const floorNum = unit.floor_number || 1;
          if (!unitsByFloor[floorNum]) unitsByFloor[floorNum] = [];
          unitsByFloor[floorNum].push(unit);
        });

        const floors = Object.keys(unitsByFloor).map((floorNum) => ({
          floorNumber: parseInt(floorNum),
          units: unitsByFloor[floorNum].map((unit) => ({
            unitNumber: unit.unit_number,
            area: unit.area || "",
            bedrooms: unit.bedrooms || "",
            bathrooms: unit.bathrooms || "",
            price: unit.price || "",
            status: unit.status || "available",
          })),
        }));

        setFloorProperties(floors);
        setTotalFloors(Object.keys(unitsByFloor).length);
        const maxUnits = Math.max(
          ...Object.values(unitsByFloor).map((units) => units.length)
        );
        setUnitsPerFloor(maxUnits);
      } else if (hasUnits) {
        const unit = apartmentData.units[0];
        setNewApartment((prev) => ({
          ...prev,
          price: unit.price || "",
          bedrooms: unit.bedrooms || "",
          bathrooms: unit.bathrooms || "",
          area: unit.area || "",
          floor_number: unit.floor_number || "",
          status: unit.status || "available",
          owner_id: apartmentData.owner_id || null,
          owner_type: apartmentData.owner_type || "admin",
        }));
      }

      setIsEditing(true);
      setShowModal(true);
    } catch (error) {
      console.error("[Apartments.jsx] Error fetching apartment:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteApartment = async (id) => {
    if (window.confirm("Are you sure you want to delete this apartment?")) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/apartments/${id}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        fetchApartments();
      } catch (error) {
        console.error("[Apartments.jsx] Error deleting apartment:", error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const resetForm = () => {
    setNewApartment({
      name: "",
      location: "",
      price: "",
      bedrooms: "",
      bathrooms: "",
      area: "",
      description: "",
      floor_number: "",
      amenities: "",
      status: "available",
      owner_id: userId || null,
      owner_type: userRole,
    });
    setImageFiles([]);
    setImagePreviews([]);
    setIsEditing(false);
    setSelectedApartment(null);
    setIsMultiUnit(false);
    setTotalFloors(1);
    setUnitsPerFloor(1);
    setFloorProperties([]);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:3000/${imagePath}`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Apartments</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle size={20} /> Add New Apartment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apartments.length > 0 ? (
          apartments.map((apartment) => (
            <div
              key={apartment.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-48 bg-gray-200">
                {apartment.image ? (
                  <img
                    src={getImageUrl(apartment.image)}
                    alt={apartment.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <Building size={48} />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  {apartment.status}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {apartment.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {apartment.location}
                </p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-blue-600 font-bold">
                    {apartment.price}
                  </span>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <span>{apartment.bedrooms} Beds</span>
                    <span>{apartment.bathrooms} Baths</span>
                    <span>{apartment.area} sq ft</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {apartment.description || "No description available"}
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={() => handleEditApartment(apartment)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteApartment(apartment.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No apartments found. Add a new apartment to get started.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {isEditing ? "Edit Apartment" : "Add New Apartment"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="border-b pb-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Building Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Building Name*
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newApartment.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Location*
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={newApartment.location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Building Amenities
                      </label>
                      <input
                        type="text"
                        name="amenities"
                        value={newApartment.amenities}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Wi-Fi, Gym, Pool (comma separated)"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={newApartment.description}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="multiUnit"
                    checked={isMultiUnit}
                    onChange={handleMultiUnitToggle}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="multiUnit"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Multi-unit building
                  </label>
                </div>
              </div>

              {isMultiUnit ? (
                <div className="border p-4 rounded-lg mb-6 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Multi-unit Configuration
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Total Floors
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={totalFloors}
                        onChange={handleTotalFloorsChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Units Per Floor
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={unitsPerFloor}
                        onChange={handleUnitsPerFloorChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-6">
                    {floorProperties.map((floor, floorIndex) => (
                      <div
                        key={`floor-${floor.floorNumber}`}
                        className="border rounded-lg p-4"
                      >
                        <h4 className="text-md font-medium text-gray-800 mb-3">
                          Floor {floor.floorNumber}
                        </h4>
                        <div className="space-y-4">
                          {floor.units.map((unit, unitIndex) => (
                            <div
                              key={`unit-${floorIndex}-${unitIndex}`}
                              className="border-t pt-3"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="font-medium">
                                  Unit {unit.unitNumber}
                                </h5>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                <div>
                                  <label className="block text-xs text-gray-600">
                                    Area (sq ft)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={unit.area}
                                    onChange={(e) =>
                                      handlePropertyInputChange(
                                        floorIndex,
                                        unitIndex,
                                        "area",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600">
                                    Bedrooms
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={unit.bedrooms}
                                    onChange={(e) =>
                                      handlePropertyInputChange(
                                        floorIndex,
                                        unitIndex,
                                        "bedrooms",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600">
                                    Bathrooms
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={unit.bathrooms}
                                    onChange={(e) =>
                                      handlePropertyInputChange(
                                        floorIndex,
                                        unitIndex,
                                        "bathrooms",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600">
                                    Price
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={unit.price}
                                    onChange={(e) =>
                                      handlePropertyInputChange(
                                        floorIndex,
                                        unitIndex,
                                        "price",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600">
                                    Status
                                  </label>
                                  <select
                                    value={unit.status}
                                    onChange={(e) =>
                                      handlePropertyInputChange(
                                        floorIndex,
                                        unitIndex,
                                        "status",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                  >
                                    <option value="available">Available</option>
                                    <option value="rented">Rented</option>
                                    <option value="sold">Sold</option>
                                    <option value="pending">Pending</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Price (USD)*
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={newApartment.price}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        required={!isMultiUnit}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Bedrooms
                      </label>
                      <input
                        type="number"
                        name="bedrooms"
                        value={newApartment.bedrooms}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Bathrooms
                      </label>
                      <input
                        type="number"
                        name="bathrooms"
                        value={newApartment.bathrooms}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Area (sq ft)*
                      </label>
                      <input
                        type="number"
                        name="area"
                        value={newApartment.area}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        required={!isMultiUnit}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Floor Number
                      </label>
                      <input
                        type="number"
                        name="floor_number"
                        value={newApartment.floor_number}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Status*
                      </label>
                      <select
                        name="status"
                        value={newApartment.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={!isMultiUnit}
                      >
                        <option value="available">Available</option>
                        <option value="rented">Rented</option>
                        <option value="sold">Sold</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Images (Max 5)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                    <Camera size={20} />
                    <span>Upload Images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-gray-500">
                    {imageFiles.length}/5 images uploaded
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-2">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative group h-24 bg-gray-100 rounded-md overflow-hidden"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOrEditApartment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {isEditing ? "Update Apartment" : "Add Apartment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Apartments;
