import React from "react";
import ContactBanner from "../components/ContactComponents/ContactBanner";
import ContactInfo from "../components/ContactComponents/ContactInfo";
import ContactForm from "../components/ContactComponents/ContactForm";
import MapSection from "../components/ContactComponents/MapSection";
import SocialLinks from "../components/ContactComponents/SocialLinks";
import TeamSection from "../components/ContactComponents/TeamSection";

const Contact = () => {
  return (
    <>
      <ContactBanner />
      <ContactInfo />
      <ContactForm />
      <MapSection />
      <SocialLinks />
      <TeamSection />
    </>
  );
};

export default Contact;
