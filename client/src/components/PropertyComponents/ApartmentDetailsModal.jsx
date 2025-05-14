import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  Building,
  Home,
  MapPin,
  IndianRupee,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PaymentForm from "./PaymentForm";

const ApartmentDetailsModal = ({ apartment, isOpen, onClose }) => {
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [floorData, setFloorData] = useState([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [apartmentImages, setApartmentImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Get user data from session storage
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    if (userData?.userData?.data?.id) {
      setUserId(userData.userData.data.id);
    }
  }, []);

  useEffect(() => {
    if (isOpen && apartment) {
      fetchFloorData();
      fetchApartmentImages();
    }
  }, [isOpen, apartment]);

  // Add polling to refresh floor data periodically when booking modal is open
  useEffect(() => {
    let intervalId;

    if (isOpen && isBookingOpen) {
      // Refresh floor data every 5 seconds while booking modal is open
      intervalId = setInterval(() => {
        fetchFloorData();
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, isBookingOpen]);

  const fetchFloorData = async () => {
    if (!apartment || !apartment.id) return;

    try {
      setIsLoading(true);
      console.log(`Fetching units for apartment ID: ${apartment.id}`);

      // First try to get data directly from the apartment_units table - this is the primary endpoint
      const response = await fetch(
        `http://localhost:3000/api/apartment-units?apartment_id=${apartment.id}`
      );

      if (!response.ok) {
        console.error(
          `Failed to fetch apartment units: ${response.status} ${response.statusText}`
        );
        throw new Error(
          `Failed to fetch floor data: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Apartment units data response:", data);

      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        processUnitsData(data.data);
        return; // Exit if we have data from the primary source
      }

      console.log(
        "No units found in apartment-units endpoint, trying apartment/:id endpoint"
      );

      // If apartment-units endpoint failed, try getting the apartment details which include units
      const apartmentResponse = await fetch(
        `http://localhost:3000/api/apartments/${apartment.id}`
      );

      if (!apartmentResponse.ok) {
        throw new Error(
          `Failed to fetch apartment details: ${apartmentResponse.status} ${apartmentResponse.statusText}`
        );
      }

      const apartmentData = await apartmentResponse.json();
      console.log("Apartment data response:", apartmentData);

      if (
        apartmentData.success &&
        apartmentData.data &&
        apartmentData.data.units &&
        Array.isArray(apartmentData.data.units) &&
        apartmentData.data.units.length > 0
      ) {
        processUnitsData(apartmentData.data.units);
        return;
      }

      // If no units found in both API endpoints, check if units are already in the apartment object
      console.log("No units found in API endpoints, checking apartment object");
      if (
        apartment.units &&
        Array.isArray(apartment.units) &&
        apartment.units.length > 0
      ) {
        processUnitsData(apartment.units);
        return;
      }

      // If we reach here, we have no real unit data - use fallback demo data
      console.log("No units found, creating fallback demo data");
      createFallbackFloorData();
    } catch (error) {
      console.error("Error fetching floor data:", error);
      createFallbackFloorData();
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to process units data and group by floor
  const processUnitsData = (units) => {
    // Group units by floor
    const floors = {};
    units.forEach((unit) => {
      const floorNumber = unit.floor_number || 1;
      if (!floors[floorNumber]) {
        floors[floorNumber] = [];
      }
      floors[floorNumber].push(unit);
    });

    // Convert to array format for rendering
    const floorsArray = Object.keys(floors).map((floor) => ({
      floor: parseInt(floor),
      units: floors[floor],
    }));

    console.log("Processed floor data:", floorsArray);
    setFloorData(floorsArray);

    // Select the first floor by default if there's data
    if (floorsArray.length > 0) {
      setSelectedFloor(floorsArray[0].floor);
    }
  };

  // Helper function to create fallback demo data
  const createFallbackFloorData = () => {
    const fallbackFloorData = [
      {
        floor: 3,
        units: [
          {
            id: `fallback-${apartment.id}-301`,
            apartment_id: apartment.id,
            unit_number: "301",
            floor_number: 3,
            area: apartment.area || "900",
            bedrooms: "3",
            bathrooms: "2",
            price: apartment.price ? parseInt(apartment.price) * 1.2 : 90000,
            status: "available",
          },
          {
            id: `fallback-${apartment.id}-302`,
            apartment_id: apartment.id,
            unit_number: "302",
            floor_number: 3,
            area: apartment.area || "850",
            bedrooms: "3",
            bathrooms: "2",
            price: apartment.price ? parseInt(apartment.price) * 1.15 : 85000,
            status: "booked",
          },
        ],
      },
      {
        floor: 2,
        units: [
          {
            id: `fallback-${apartment.id}-201`,
            apartment_id: apartment.id,
            unit_number: "201",
            floor_number: 2,
            area: apartment.area || "800",
            bedrooms: "2",
            bathrooms: "2",
            price: apartment.price ? parseInt(apartment.price) * 1.05 : 80000,
            status: "available",
          },
          {
            id: `fallback-${apartment.id}-202`,
            apartment_id: apartment.id,
            unit_number: "202",
            floor_number: 2,
            area: apartment.area || "820",
            bedrooms: "2",
            bathrooms: "2",
            price: apartment.price ? parseInt(apartment.price) * 1.1 : 82000,
            status: "available",
          },
        ],
      },
      {
        floor: 1,
        units: [
          {
            id: `fallback-${apartment.id}-101`,
            apartment_id: apartment.id,
            unit_number: "101",
            floor_number: 1,
            area: apartment.area || "750",
            bedrooms: apartment.bedrooms || "2",
            bathrooms: apartment.bathrooms || "1",
            price: apartment.price,
            status: "available",
          },
          {
            id: `fallback-${apartment.id}-102`,
            apartment_id: apartment.id,
            unit_number: "102",
            floor_number: 1,
            area: apartment.area || "780",
            bedrooms: "2",
            bathrooms: "1",
            price: apartment.price ? parseInt(apartment.price) * 0.95 : 75000,
            status: "under_maintenance",
          },
        ],
      },
    ];

    console.log("Using fallback demo data:", fallbackFloorData);
    setFloorData(fallbackFloorData);
    setSelectedFloor(2); // Select middle floor by default
  };

  const fetchApartmentImages = async () => {
    if (!apartment || !apartment.id) return;

    try {
      // Fetch images from apartment_images table
      const response = await fetch(
        `http://localhost:3000/api/apartments/${apartment.id}/images`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch apartment images");
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setApartmentImages(data.data);
      } else {
        // If no images found in the apartment_images table, use the main apartment image
        if (apartment.image) {
          setApartmentImages([{ image_path: apartment.image }]);
        } else {
          setApartmentImages([]);
        }
      }
    } catch (error) {
      console.error("Error fetching apartment images:", error);
      // Fallback to main apartment image
      if (apartment.image) {
        setApartmentImages([{ image_path: apartment.image }]);
      }
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return null;
    }

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // Convert Windows backslashes to forward slashes for URLs
    const normalizedPath = imagePath.replace(/\\/g, "/");

    // Check if the path already contains 'uploads/apartments'
    if (normalizedPath.includes("uploads/apartments")) {
      return `http://localhost:3000/${normalizedPath}`;
    }

    return `http://localhost:3000/uploads/apartments/${normalizedPath}`;
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === apartmentImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? apartmentImages.length - 1 : prevIndex - 1
    );
  };

  const handleFloorSelect = (floor) => {
    setSelectedFloor(floor);
    setSelectedUnit(null); // Reset selected unit
  };

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
  };

  const handleBookNow = () => {
    if (!userId) {
      // If user is not logged in, redirect to login page
      alert("Please log in to book an apartment");
      window.location.href = "/login";
      return;
    }
    setIsBookingOpen(true);
  };

  const handleBookingClose = () => {
    setIsBookingOpen(false);
    // Refresh floor data to update unit statuses after booking
    fetchFloorData();
    // Reset selected unit after successful booking
    setSelectedUnit(null);
  };

  const formatPrice = (price) => {
    if (!price) return "Price on request";
    return `₹${parseInt(price).toLocaleString()}`;
  };

  const getUnitStatus = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return { color: "bg-green-500", text: "Available" };
      case "booked":
      case "rented":
        return { color: "bg-red-500", text: "Booked" };
      case "reserved":
        return { color: "bg-yellow-500", text: "Reserved" };
      case "under_maintenance":
        return { color: "bg-gray-500", text: "Under Maintenance" };
      default:
        return { color: "bg-blue-500", text: "Available" };
    }
  };

  if (!isOpen || !apartment) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {/* Image Gallery */}
          <div className="relative h-64 overflow-hidden rounded-t-xl">
            {apartmentImages.length > 0 ? (
              <>
                <motion.img
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  src={getImageUrl(
                    apartmentImages[currentImageIndex]?.image_path
                  )}
                  alt={`${apartment.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/800x400?text=Image+Not+Available";
                  }}
                />
                {apartmentImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 p-2 rounded-full"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 p-2 rounded-full"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {apartmentImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full ${
                            index === currentImageIndex
                              ? "bg-white"
                              : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                <Building size={64} className="text-blue-300" />
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg z-10"
            >
              <X size={20} />
            </button>
            <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md z-10">
              <h2 className="text-2xl font-bold text-blue-900">
                {apartment.name}
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Apartment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3 text-gray-700">
                  <MapPin size={18} />
                  <span>{apartment.location || "Location not specified"}</span>
                </div>
                <div className="flex items-center gap-2 mb-3 text-gray-700">
                  <IndianRupee size={18} />
                  <span className="font-semibold text-blue-900">
                    {formatPrice(apartment.price)}
                  </span>
                </div>
                {apartment.status && (
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm ${
                        getUnitStatus(apartment.status).color
                      }`}
                    >
                      {getUnitStatus(apartment.status).text}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Building Features
                </h3>
                <ul className="space-y-2">
                  {apartment.amenities && (
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" />
                      <span>{apartment.amenities}</span>
                    </li>
                  )}
                  {apartment.description && (
                    <li className="text-gray-700 mt-4">
                      {apartment.description}
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {apartmentImages.length > 1 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Gallery</h3>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                  {apartmentImages.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex
                          ? "border-blue-500"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={getImageUrl(image.image_path)}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-16 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/100?text=N/A";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Floor & Units Section */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold text-blue-900 mb-4">
                All Floors & Units
              </h3>

              {isLoading ? (
                <div className="py-8 text-center">
                  <p>Loading floor data...</p>
                </div>
              ) : floorData.length > 0 ? (
                <div className="space-y-6">
                  {floorData
                    .sort((a, b) => b.floor - a.floor) // Sort floors in descending order (top floor first)
                    .map((floor) => (
                      <div
                        key={floor.floor}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div className="bg-blue-50 px-4 py-3 border-b">
                          <h4 className="font-medium text-lg text-blue-900">
                            Floor {floor.floor} ({floor.units.length} units)
                          </h4>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {floor.units.map((unit) => (
                              <div
                                key={unit.id}
                                onClick={() =>
                                  unit.status?.toLowerCase() === "available" &&
                                  handleUnitSelect(unit)
                                }
                                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                  selectedUnit?.id === unit.id
                                    ? "border-blue-500 shadow-md bg-blue-50"
                                    : "hover:shadow-md hover:bg-gray-50"
                                } ${
                                  unit.status?.toLowerCase() !== "available"
                                    ? "opacity-70"
                                    : ""
                                }`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-medium">
                                    Unit {unit.unit_number}
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs text-white ${
                                      getUnitStatus(unit.status).color
                                    }`}
                                  >
                                    {getUnitStatus(unit.status).text}
                                  </span>
                                </div>
                                <div className="space-y-1 text-sm">
                                  <p>Area: {unit.area || "N/A"} sq.ft</p>
                                  <p>Bedrooms: {unit.bedrooms || "N/A"}</p>
                                  <p>Bathrooms: {unit.bathrooms || "N/A"}</p>
                                  <p className="font-semibold">
                                    {formatPrice(unit.price)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="py-8 text-center border rounded-lg">
                  <Building size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">
                    No floor or unit information available
                  </p>
                </div>
              )}
            </div>

            {/* Booking Section */}
            <div className="mt-8 border-t pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <div className="mb-4 md:mb-0">
                  {selectedUnit ? (
                    <div className="text-blue-900">
                      <h4 className="font-bold text-lg mb-1">Ready to Book?</h4>
                      <p className="text-blue-700">
                        Selected: Floor {selectedFloor}, Unit{" "}
                        {selectedUnit.unit_number}
                      </p>
                      <p className="text-green-600 font-medium mt-1">
                        Price:{" "}
                        {formatPrice(selectedUnit.price || apartment.price)}
                      </p>
                    </div>
                  ) : (
                    <div className="text-blue-900">
                      <h4 className="font-bold text-lg mb-1">
                        Book Your Dream Home
                      </h4>
                      <p className="text-blue-700">
                        Select a unit from above to proceed
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleBookNow}
                  disabled={
                    !selectedUnit ||
                    selectedUnit.status?.toLowerCase() !== "available"
                  }
                  className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                    selectedUnit &&
                    selectedUnit.status?.toLowerCase() === "available"
                      ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:shadow-lg transform hover:scale-105"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {selectedUnit &&
                  selectedUnit.status?.toLowerCase() === "available"
                    ? "Book Now"
                    : !selectedUnit
                    ? "Select a Unit"
                    : "Unit Not Available"}
                </button>
              </div>

              {!selectedUnit && (
                <div className="text-center mt-4 text-gray-600 text-sm">
                  <p>
                    ⭐ Please select an available unit from the list above to
                    proceed with booking
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Booking Payment Modal */}
      {isBookingOpen && selectedUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="bg-white rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-blue-900">
                  Book Your Apartment
                </h3>
                <button
                  onClick={handleBookingClose}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg text-sm sm:text-base">
                <h4 className="font-medium text-blue-900 mb-2">
                  Booking Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <p>
                    <strong>Property:</strong> {apartment.name}
                  </p>
                  <p>
                    <strong>Location:</strong> {apartment.location}
                  </p>
                  <p>
                    <strong>Floor:</strong> {selectedFloor}
                  </p>
                  <p>
                    <strong>Unit:</strong> {selectedUnit.unit_number}
                  </p>
                  <p className="sm:col-span-2">
                    <strong>Price:</strong>{" "}
                    {formatPrice(selectedUnit.price || apartment.price)}
                  </p>
                </div>
              </div>

              <PaymentForm
                propertyId={apartment.id}
                propertyName={apartment.name}
                propertyPrice={selectedUnit.price || apartment.price}
                isApartment={true}
                unitId={selectedUnit.id}
                userId={userId}
                onSuccess={() => {
                  // Refresh floor data to show updated unit status
                  fetchFloorData();
                  // Close the booking modal
                  handleBookingClose();
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ApartmentDetailsModal;
