import React, { useState } from "react";
import PropertiesHero from "../components/PropertyComponents/PropertiesHero";
import SearchFilterBar from "../components/PropertyComponents/SearchFilterBar";
import PropertyGrid from "../components/PropertyComponents/PropertyGrid";
import InfiniteScrollSection from "../components/PropertyComponents/InfiniteScrollSection";
import CallToAction from "../components/PropertyComponents/CallToAction";

const Property = () => {
  const [filters, setFilters] = useState({});

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <>
      <PropertiesHero />
      <SearchFilterBar onFilterChange={handleFilterChange} />
      {/* <PropertyGrid /> */}
      <InfiniteScrollSection filters={filters} />
      <CallToAction />
    </>
  );
};

export default Property;
