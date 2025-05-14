import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "react-feather";

const { section: MotionSection, div: MotionDiv } = motion;

const SearchFilterBar = ({ onFilterChange, isApartment = false }) => {
  const [filters, setFilters] = useState({});
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch columns from property or apartment table
  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const endpoint = isApartment
          ? "http://localhost:3000/api/apartments/columns"
          : "http://localhost:3000/api/properties/columns";

        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.success && Array.isArray(data.columns)) {
          setColumns(data.columns);
          // Initialize filters with empty values for each column
          const initialFilters = {};
          data.columns.forEach((column) => {
            if (
              ![
                "id",
                "created_at",
                "updated_at",
                "user_id",
                "image",
                "name",
                "location",
                "price",
                "status",
                "description",
              ].includes(column.name)
            ) {
              initialFilters[column.name] = "";
            }
          });
          setFilters(initialFilters);
        } else {
          console.error(
            "Failed to fetch columns:",
            data.message || "Unknown error"
          );
        }
      } catch (error) {
        console.error("Error fetching columns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchColumns();
  }, [isApartment]);

  const handleFilterChange = (field, value) => {
    const updatedFilters = { ...filters, [field]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    const emptyFilters = {};
    columns.forEach((column) => {
      if (
        ![
          "id",
          "created_at",
          "updated_at",
          "user_id",
          "image",
          "name",
          "location",
          "price",
          "status",
          "description",
        ].includes(column.name)
      ) {
        emptyFilters[column.name] = "";
      }
    });
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  // Helper to render filter options for a column
  const renderFilterOptions = (column) => {
    switch (column.name) {
      case "property_type":
      case "type":
        return (
          <>
            <option value="">Property Type</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
          </>
        );
      case "price":
        return (
          <>
            <option value="">Price Range</option>
            <option value="below_100k">Below ₹100k</option>
            <option value="100k_500k">₹100k - ₹500k</option>
            <option value="500k_1m">₹500k - ₹1M</option>
            <option value="above_1m">Above ₹1M</option>
          </>
        );
      case "bedrooms":
        return (
          <>
            <option value="">Bedrooms</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </>
        );
      case "bathrooms":
        return (
          <>
            <option value="">Bathrooms</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </>
        );
      case "area":
        return (
          <>
            <option value="">Area (sq.ft)</option>
            <option value="below_1000">Below 1000</option>
            <option value="1000_3000">1000 - 3000</option>
            <option value="3000_5000">3000 - 5000</option>
            <option value="above_5000">5000+</option>
          </>
        );
      case "status":
        return (
          <>
            <option value="">Status</option>
            <option value="For Sale">For Sale</option>
            <option value="For Rent">For Rent</option>
          </>
        );
      case "furnishing":
        return (
          <>
            <option value="">Furnishing</option>
            <option value="Furnished">Furnished</option>
            <option value="Unfurnished">Unfurnished</option>
            <option value="Semi-Furnished">Semi-Furnished</option>
          </>
        );
      case "year_built":
        return (
          <>
            <option value="">Year Built</option>
            {Array.from(
              { length: 30 },
              (_, i) => new Date().getFullYear() - i
            ).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </>
        );
      case "floor_number":
        return (
          <>
            <option value="">Floor Number</option>
            {Array.from({ length: 20 }, (_, i) => i + 1).map((floor) => (
              <option key={floor} value={floor}>
                {floor}
              </option>
            ))}
          </>
        );
      case "total_floors":
        return (
          <>
            <option value="">Total Floors</option>
            {Array.from({ length: 20 }, (_, i) => i + 1).map((floor) => (
              <option key={floor} value={floor}>
                {floor}
              </option>
            ))}
          </>
        );
      case "parking_spaces":
        return (
          <>
            <option value="">Parking Spaces</option>
            {Array.from({ length: 5 }, (_, i) => i + 1).map((spaces) => (
              <option key={spaces} value={spaces}>
                {spaces}+
              </option>
            ))}
          </>
        );
      default:
        if (column.type === "boolean") {
          return (
            <>
              <option value="">Any {column.label || column.name}</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </>
          );
        }
        return <option value="">Select {column.label || column.name}</option>;
    }
  };

  // Skip certain columns that shouldn't be filters
  const skipColumns = [
    "id",
    "created_at",
    "updated_at",
    "user_id",
    "image",
    "name",
    "location",
    "price",
    "status",
    "description",
  ];

  return (
    <MotionSection
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-white py-8 px-4 shadow-lg rounded-xl max-w-screen-xl mx-auto -mt-20 relative z-10"
    >
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-5 gap-4"
      >
        {/* Search Input */}
        <div className="col-span-2 flex items-center border rounded-lg px-3">
          <Search className="text-blue-600" size={18} />
          <input
            type="text"
            placeholder="Search by keyword or location"
            className="w-full px-2 py-2 outline-none"
            value={filters.keyword || ""}
            onChange={(e) => handleFilterChange("keyword", e.target.value)}
          />
        </div>

        {/* Dynamic Filters based on columns */}
        {loading ? (
          <div className="col-span-3 text-center">Loading filters...</div>
        ) : (
          columns
            .filter((column) => !skipColumns.includes(column.name))
            .slice(0, 3) // Show first 3 filters in the top row
            .map((column, index) => (
              <select
                key={index}
                className="border rounded-lg px-3 py-2"
                value={filters[column.name] || ""}
                onChange={(e) =>
                  handleFilterChange(column.name, e.target.value)
                }
              >
                {renderFilterOptions(column)}
              </select>
            ))
        )}
      </MotionDiv>

      <div className="mt-4 flex flex-wrap gap-4">
        {/* Additional Filters */}
        {!loading &&
          columns
            .filter((column) => !skipColumns.includes(column.name))
            .slice(3) // Show remaining filters below
            .map((column, index) => (
              <select
                key={index}
                className="border rounded-lg px-3 py-2"
                value={filters[column.name] || ""}
                onChange={(e) =>
                  handleFilterChange(column.name, e.target.value)
                }
              >
                {renderFilterOptions(column)}
              </select>
            ))}

        <button
          className="flex items-center gap-1 bg-amber-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform"
          onClick={handleApplyFilters}
        >
          <Filter size={16} /> Apply Filters
        </button>

        <button
          className="flex items-center gap-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
          onClick={handleClearFilters}
        >
          Clear Filters
        </button>
      </div>
    </MotionSection>
  );
};

export default SearchFilterBar;
