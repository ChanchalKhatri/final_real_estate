import React from "react";
import HeroSection from "../components/HomeComponents/HeroSection";
import FeaturedProperties from "../components/HomeComponents/FeaturedProperties";
import PropertyCategories from "../components/HomeComponents/PropertyCategories";
import WhyChooseUs from "../components/HomeComponents/WhyChooseUs";
import Testimonials from "../components/HomeComponents/Testimonials";
import ContactCTA from "../components/HomeComponents/ContactCTA";

const Home = () => {
  return (
    <>
      <HeroSection />
      <FeaturedProperties />
      <PropertyCategories />
      <WhyChooseUs />
      <Testimonials />
      <ContactCTA />
    </>
  );
};

export default Home;
