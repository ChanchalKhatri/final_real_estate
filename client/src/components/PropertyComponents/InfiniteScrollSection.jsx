import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ChevronLeft, ChevronRight, User, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PaymentForm from "./PaymentForm";
import ApartmentDetailsModal from "./ApartmentDetailsModal";

const { div: MotionDiv, section: MotionSection, img: MotionImg } = motion;

const InfiniteScrollSection = ({ filters = {}, apartmentView = false }) => {
  const [properties, setProperties] = useState([]); // State to store properties or apartments
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [error, setError] = useState(null); // State to handle error state
  const [visibleCount, setVisibleCount] = useState(9); // State to control number of visible items
  const [filteredProperties, setFilteredProperties] = useState([]); // State to store filtered items
  const [columns, setColumns] = useState([]); // State to store database columns
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  // Fetch columns from property or apartment table
  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const endpoint = apartmentView
          ? "http://localhost:3000/api/apartments/columns"
          : "http://localhost:3000/api/properties/columns";

        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.success && Array.isArray(data.columns)) {
          setColumns(data.columns);
        } else {
          console.error(
            "Failed to fetch columns:",
            data.message || "Unknown error"
          );
        }
      } catch (error) {
        console.error("Error fetching columns:", error);
      }
    };

    fetchColumns();
  }, [apartmentView]);

  // Fetching properties or apartments data from API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);

        // Build query parameters from filters
        const queryParams = new URLSearchParams();

        // Process all filter parameters
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            // Handle special case for propertyType (maps to type in the backend)
            const paramName = key === "propertyType" ? "type" : key;
            queryParams.append(paramName, value);
          }
        });

        // Create URL with query parameters
        const endpoint = apartmentView
          ? "http://localhost:3000/api/apartments"
          : "http://localhost:3000/api/properties";

        const url = `${endpoint}${
          queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;

        console.log(
          `Fetching ${apartmentView ? "apartments" : "properties"} with URL:`,
          url
        );

        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage;

          try {
            const errorJson = JSON.parse(errorText);
            errorMessage =
              errorJson.message ||
              `Server returned ${response.status}: ${response.statusText}`;
          } catch (_) {
            // If response is not JSON
            errorMessage = `Server returned ${response.status}: ${
              response.statusText
            }. Details: ${errorText.substring(0, 100)}`;
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log(
          `${apartmentView ? "Apartments" : "Properties"} fetched:`,
          data
        );

        if (data.success) {
          setProperties(data);
          setFilteredProperties(data.data || []);
        } else {
          setError(
            data.message ||
              `Failed to fetch ${apartmentView ? "apartments" : "properties"}`
          );
          setFilteredProperties([]);
        }
      } catch (err) {
        console.error(
          `Error fetching ${apartmentView ? "apartments" : "properties"}:`,
          err
        );
        setError(
          `Failed to load ${apartmentView ? "apartments" : "properties"}: ` +
            (err.message || "Unknown error")
        );
        setFilteredProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [filters, apartmentView]);

  // Update filtered properties when properties or filters change
  useEffect(() => {
    if (!properties.data) return;

    // Initialize filtered properties with the data from API
    setFilteredProperties(properties.data);

    // Reset visibleCount when filters change
    setVisibleCount(9);
  }, [properties]);

  // Debugging to help track filter application
  useEffect(() => {
    console.log("Current filters:", filters);
    console.log(
      `${apartmentView ? "Apartments" : "Properties"} data:`,
      properties?.data?.length
    );
    console.log("Filtered items:", filteredProperties?.length);
  }, [filters, properties, filteredProperties, apartmentView]);

  const handleExploreMore = () => {
    setVisibleCount((prevCount) => prevCount + 6); // Increase visible count by 6
  };

  // Navigate to property or apartment details page
  const viewDetails = (item) => {
    if (apartmentView) {
      // Show apartment details modal
      setSelectedApartment(item);
      setIsModalOpen(true);
    } else {
      navigate(`/property/${item.id}`, { state: { property: item } });
    }
  };

  // Get image URL with server base path if needed
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "https://via.placeholder.com/400x300?text=No+Image+Available";
    }

    // Check if the image path is a full URL
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // Convert Windows backslashes to forward slashes for URLs
    const normalizedPath = imagePath.replace(/\\/g, "/").toLowerCase();

    if (apartmentView) {
      // For apartments
      if (normalizedPath.includes("uploads/apartments")) {
        const pathParts = normalizedPath.split("uploads/apartments/");
        const filename = pathParts[pathParts.length - 1];
        return `http://localhost:3000/uploads/apartments/${filename}`;
      }
      // Handle capitalized "Uploads" path
      else if (
        normalizedPath.includes("uploads/apartments") ||
        normalizedPath.toLowerCase().includes("uploads/apartments")
      ) {
        // Extract the filename, regardless of path case
        const filename = normalizedPath.split(/[/\\]/).pop();
        return `http://localhost:3000/uploads/apartments/${filename}`;
      }
      // Otherwise, assume it's just a filename and prepend the full path
      return `http://localhost:3000/uploads/apartments/${normalizedPath}`;
    } else {
      // For properties
      if (normalizedPath.includes("uploads/properties")) {
        const pathParts = normalizedPath.split("uploads/properties/");
        const filename = pathParts[pathParts.length - 1];
        return `http://localhost:3000/uploads/properties/${filename}`;
      }
      // Handle capitalized "Uploads" path
      else if (
        normalizedPath.includes("uploads/properties") ||
        normalizedPath.toLowerCase().includes("uploads/properties")
      ) {
        // Extract the filename, regardless of path case
        const filename = normalizedPath.split(/[/\\]/).pop();
        return `http://localhost:3000/uploads/properties/${filename}`;
      }
      // Otherwise, assume it's just a filename and prepend the full path
      return `http://localhost:3000/uploads/properties/${normalizedPath}`;
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
    }),
    hover: {
      y: -10,
      scale: 1.03,
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Get filtered properties to display
  const propertiesToShow = filteredProperties.slice(0, visibleCount);

  // Get column fields based on active filters and database columns
  const getDisplayColumns = () => {
    // Base columns always shown
    const displayColumns = ["name", "price", "location", "description"];

    // Get active filter keys that have values
    const activeFilterKeys = Object.keys(filters).filter((key) => filters[key]);

    // Add columns based on active filters
    activeFilterKeys.forEach((key) => {
      if (!displayColumns.includes(key)) {
        // For propertyType filter, we show the 'type' column
        const columnName = key === "propertyType" ? "type" : key;
        if (!displayColumns.includes(columnName)) {
          displayColumns.push(columnName);
        }
      }
    });

    // Add relevant columns from the database schema
    if (columns && columns.length > 0) {
      const skipColumns = [
        "id",
        "created_at",
        "updated_at",
        "user_id",
        "image",
      ];

      columns.forEach((column) => {
        const columnName = column.name;
        if (
          !displayColumns.includes(columnName) &&
          !skipColumns.includes(columnName)
        ) {
          displayColumns.push(columnName);
        }
      });
    }

    return displayColumns;
  };

  const displayColumns = getDisplayColumns();

  // Format value for display based on column type
  const formatColumnValue = (property, columnName) => {
    if (
      !property ||
      property[columnName] === undefined ||
      property[columnName] === null
    ) {
      return "N/A";
    }

    const value = property[columnName];

    // Special formatting for specific columns
    switch (columnName) {
      case "price":
        return typeof value === "number" ? `₹${value.toLocaleString()}` : value;
      case "area":
        return `${value} sq.ft`;
      case "bedrooms":
        return `${value} ${value === 1 ? "bedroom" : "bedrooms"}`;
      case "bathrooms":
        return `${value} ${value === 1 ? "bathroom" : "bathrooms"}`;
      case "created_at":
      case "updated_at":
        return new Date(value).toLocaleDateString();
      default:
        return value;
    }
  };

  // Get emoji icon for specific columns
  const getColumnIcon = (columnName) => {
    switch (columnName) {
      case "bedrooms":
        return "🛏️";
      case "bathrooms":
        return "🛁";
      case "area":
        return "📐";
      case "location":
        return "📍";
      case "price":
        return "💰";
      case "status":
        return "🏷️";
      case "type":
        return "🏠";
      case "parking_spaces":
        return "🚗";
      case "furnished":
        return "🪑";
      case "year_built":
        return "📅";
      default:
        return "";
    }
  };

  // Add function to get owner badge color
  const getOwnerBadgeColor = (ownerType) => {
    return ownerType === "seller" ? "bg-green-500" : "bg-purple-500";
  };

  return (
    <>
      <MotionSection
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ once: true }}
        className="py-20 px-4 bg-white"
      >
        <div className="max-w-screen-2xl mx-auto px-4">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-blue-900 mb-16">
            Featured{" "}
            <span className="text-amber-500">
              {apartmentView ? "Apartments" : "Properties"}
            </span>
          </h2>

          {/* Show filter information if any filters are applied */}
          {Object.values(filters).some((value) => value) && (
            <div className="mb-8 p-4 bg-blue-50 rounded-xl">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Active Filters:
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (!value) return null;

                  let displayValue = value;
                  if (typeof value === "string" && value.includes("_")) {
                    displayValue = value
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase());
                  }

                  return (
                    <span
                      key={key}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^\w/, (c) => c.toUpperCase())}
                      : {displayValue}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {propertiesToShow.map((item, i) => (
              <MotionDiv
                key={item.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true }}
                className="group bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
              >
                {/* Image Section */}
                <div className="relative overflow-hidden">
                  <MotionImg
                    src={getImageUrl(item.image)}
                    alt={item.location}
                    className="w-full h-52 sm:h-60 object-cover transform group-hover:scale-105 transition-transform duration-300"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/400x300?text=No+Image+Available";
                    }}
                  />
                  <span className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                    {apartmentView ? item.status || "Available" : item.type}
                  </span>
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-4">
                  {/* Core property information */}
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-blue-900">
                      {item.name}
                    </h3>

                    {/* Owner badge for properties */}
                    {!apartmentView && item.owner_type && (
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${getOwnerBadgeColor(
                          item.owner_type
                        )}`}
                      >
                        {item.owner_type === "seller" ? "Seller" : "Admin"}
                      </span>
                    )}
                  </div>

                  <p className="text-lg font-semibold text-amber-500">
                    Price: {formatColumnValue(item, "price")}
                  </p>

                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    Location: {getColumnIcon("location")} {item.location}
                  </div>

                  {/* Owner information for properties */}
                  {!apartmentView && item.owner_name && (
                    <div className="text-sm text-gray-600 flex items-center">
                      <User className="h-4 w-4 mr-1" /> Owner: {item.owner_name}
                    </div>
                  )}

                  {/* Dynamic property details based on displayed columns */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {displayColumns
                      .filter(
                        (column) =>
                          // Skip columns already shown above and empty values
                          ![
                            "name",
                            "price",
                            "location",
                            "description",
                            "owner_name",
                            "owner_type",
                          ].includes(column) &&
                          item[column] !== undefined &&
                          item[column] !== null &&
                          item[column] !== ""
                      )
                      .map((column) => (
                        <div key={column} className="text-sm text-gray-600">
                          {column.charAt(0).toUpperCase() +
                            column.slice(1).replace(/_/g, " ")}
                          :{getColumnIcon(column)}{" "}
                          {formatColumnValue(item, column)}
                        </div>
                      ))}
                  </div>

                  {displayColumns.includes("description") && (
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  )}

                  <motion.button
                    onClick={() => viewDetails(item)}
                    whileHover={{ scale: 1.04 }}
                    transition={{ type: "spring", stiffness: 250, damping: 12 }}
                    className="w-full py-2 text-white bg-blue-900 hover:bg-blue-800 transition-colors rounded-xl font-medium"
                  >
                    View Details
                  </motion.button>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>

        {visibleCount < filteredProperties.length && (
          <div className="mt-6 text-center">
            <button
              onClick={handleExploreMore}
              className="px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600"
            >
              Explore More
            </button>
          </div>
        )}

        {/* No results message */}
        {filteredProperties.length === 0 && !loading && (
          <div className="text-center py-10">
            <p className="text-xl text-gray-600">
              No {apartmentView ? "apartments" : "properties"} found matching
              your filters.
            </p>
            <p className="text-gray-500 mt-2">
              Try adjusting your search criteria.
            </p>
          </div>
        )}
      </MotionSection>

      {/* Apartment Details Modal */}
      {apartmentView && (
        <ApartmentDetailsModal
          apartment={selectedApartment}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default InfiniteScrollSection;
