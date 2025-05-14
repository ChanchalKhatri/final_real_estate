import React from "react";
import AboutBanner from "../components/AboutComponents/AboutBanner";
import OurStory from "../components/AboutComponents/OurStory";
import CompanyStats from "../components/AboutComponents/CompanyStats";
import WhyChooseUs from "../components/AboutComponents/WhyChooseUs";
import MeetOurTeam from "../components/AboutComponents/MeetOurTeam";
import ClientTestimonials from "../components/AboutComponents/ClientTestimonials";
import CallToAction from "../components/AboutComponents/CallToAction";

const About = () => {
  return (
    <>
      <AboutBanner />
      <OurStory />
      <CompanyStats />
      <WhyChooseUs />
      <MeetOurTeam />
      <ClientTestimonials />
      <CallToAction />
    </>
  );
};

export default About;
