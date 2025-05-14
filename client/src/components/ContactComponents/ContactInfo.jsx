import React from "react";
import { MapPin, Phone, Mail, Clock } from "react-feather";
import { motion } from "framer-motion";

const { div: MotionDiv, section: MotionSection } = motion;

const ContactInfo = () => {
  return (
    <MotionSection
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="py-24 bg-gradient-to-br from-blue-50 to-amber-50 px-4"
    >
      <MotionDiv className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Address Card */}
        <div className="md:col-span-3 bg-gradient-to-r from-white via-white to-blue-50 rounded-3xl p-10 shadow-2xl hover:scale-[1.02] transition-transform group border border-blue-100">
          <div className="flex items-start gap-5 mb-4">
            <span className="bg-amber-100 p-5 rounded-2xl group-hover:bg-amber-500 transition-colors">
              <MapPin
                className="text-amber-600 group-hover:text-white"
                size={28}
              />
            </span>
            <div>
              <h2 className="text-3xl font-extrabold text-blue-900 mb-2">
                Our Office Address
              </h2>
              <p className="text-blue-700 font-medium text-lg leading-relaxed">
                Kalidas Market, Malkapur, Karad
              </p>
            </div>
          </div>
        </div>

        {/* Phone */}
        <div className="bg-gradient-to-r from-white via-white to-amber-50 rounded-3xl p-8 shadow-xl hover:scale-[1.02] transition-transform group border border-amber-100">
          <div className="flex items-start gap-5 mb-3">
            <span className="bg-amber-100 p-4 rounded-2xl group-hover:bg-amber-500 transition-colors">
              <Phone className="text-amber-600 group-hover:text-white" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-blue-900 mb-1">
                Phone Numbers
              </h2>
              <p className="text-blue-700 font-medium">Sales: +91 8983342468</p>
              <p className="text-blue-700 font-medium">
                Support: +91 9890571672
              </p>
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="bg-gradient-to-r from-white via-white to-amber-50 rounded-3xl p-8 shadow-xl hover:scale-[1.02] transition-transform group border border-amber-100">
          <div className="flex items-start gap-5 mb-3">
            <span className="bg-amber-100 p-4 rounded-2xl group-hover:bg-amber-500 transition-colors">
              <Mail className="text-amber-600 group-hover:text-white" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-blue-900 mb-1">
                Email Addresses
              </h2>
              <p className="text-blue-700 font-medium">
                General: info@homeconnect.com
              </p>
              <p className="text-blue-700 font-medium">
                Support: support@homeconnect.com
              </p>
            </div>
          </div>
        </div>

        {/* Office Hours */}
        <div className="bg-gradient-to-r from-white via-white to-amber-50 rounded-3xl p-8 shadow-xl hover:scale-[1.02] transition-transform group border border-amber-100">
          <div className="flex items-start gap-5 mb-3">
            <span className="bg-amber-100 p-4 rounded-2xl group-hover:bg-amber-500 transition-colors">
              <Clock className="text-amber-600 group-hover:text-white" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-blue-900 mb-1">
                Office Hours
              </h2>
              <p className="text-blue-700 font-medium">
                Mon - Fri: 9:00 AM - 6:00 PM
              </p>
              <p className="text-blue-700 font-medium">Sat - Sun: Closed</p>
            </div>
          </div>
        </div>
      </MotionDiv>
    </MotionSection>
  );
};

export default ContactInfo;
