import React from "react";
import { motion } from "framer-motion";
import { MapPin, Home, Zap } from "react-feather";

const { div: MotionDiv, section: MotionSection } = motion;

const properties = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    title: "3 BHK Apartment in Downtown",
    location: "Downtown City",
    price: "$450,000",
    bedrooms: 3,
    bathrooms: 2,
    size: "1,500 sq.ft",
    badge: "New",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    title: "Luxury Villa with Pool",
    location: "Uptown Hills",
    price: "$1,200,000",
    bedrooms: 5,
    bathrooms: 4,
    size: "3,800 sq.ft",
    badge: "Hot Deal",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=800&q=80",
    title: "Modern Office Space",
    location: "Business Bay",
    price: "$750,000",
    bedrooms: 0,
    bathrooms: 2,
    size: "2,500 sq.ft",
    badge: "Featured",
  },
];

const PropertyGrid = () => {
  return (
    <MotionSection
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="py-14 bg-white px-4"
    >
      <div className="max-w-screen-xl mx-auto space-y-8">
        <h2 className="text-4xl font-bold text-blue-900 text-center">
          Our Listings
        </h2>

        <div className="grid gap-8 md:grid-cols-3 sm:grid-cols-2">
          {properties.map((property) => (
            <MotionDiv
              key={property.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white shadow-lg rounded-xl overflow-hidden hover:scale-105 transition-transform"
            >
              <div className="relative">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-56 object-cover"
                />
                <span className="absolute top-4 left-4 bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-semibold uppercase">
                  {property.badge}
                </span>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="text-lg font-semibold text-blue-900">
                  {property.title}
                </h3>
                <p className="flex items-center gap-1 text-sm text-blue-700">
                  <MapPin size={14} /> {property.location}
                </p>
                <p className="flex items-center gap-1 text-sm text-blue-700">
                  <IndianRupee size={14} /> {property.price}
                </p>

                <div className="flex justify-between text-sm text-blue-800 pt-2 border-t">
                  <span>{property.bedrooms} Beds</span>
                  <span>{property.bathrooms} Baths</span>
                  <span>{property.size}</span>
                </div>

                <button className="mt-4 w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-1">
                  <Zap size={16} /> View Details
                </button>
              </div>
            </MotionDiv>
          ))}
        </div>
      </div>
    </MotionSection>
  );
};

export default PropertyGrid;
