import React, { useState } from "react";
import PropertiesHero from "../components/PropertyComponents/PropertiesHero";
import SearchFilterBar from "../components/PropertyComponents/SearchFilterBar";
import InfiniteScrollSection from "../components/PropertyComponents/InfiniteScrollSection";
import CallToAction from "../components/PropertyComponents/CallToAction";

const Apartment = () => {
  const [filters, setFilters] = useState({});

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <>
      <PropertiesHero
        title="Find Your Perfect Apartment"
        subtitle="Browse through our collection of premium apartments"
      />
      {/* <SearchFilterBar onFilterChange={handleFilterChange} isApartment={true} /> */}
      <InfiniteScrollSection filters={filters} apartmentView={true} />
      <CallToAction />
    </>
  );
};

export default Apartment;
