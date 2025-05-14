import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Inbox,
  Mail,
  Search,
  Phone,
  MessageSquare,
  Calendar,
} from "lucide-react";

const ContactSubmissions = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/contact");
        if (response.data.success) {
          setContacts(response.data.data);
        } else {
          setError("Failed to load contact submissions");
        }
      } catch (err) {
        console.error("Error fetching contacts:", err);
        setError("Failed to load contact submissions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-blue-900">
          Contact Submissions
        </h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded-lg text-red-700">{error}</div>
      ) : filteredContacts.length === 0 ? (
        <div className="bg-blue-50 p-10 rounded-xl flex flex-col items-center justify-center text-center">
          <Inbox size={48} className="text-blue-500 mb-4" />
          <h3 className="text-xl font-semibold text-blue-900 mb-2">
            No Contact Submissions
          </h3>
          <p className="text-blue-700">
            {searchTerm
              ? "No contacts match your search criteria. Try different keywords."
              : "There are no contact form submissions yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredContacts.map((contact) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="space-y-4 flex-grow">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xl text-blue-900">
                      {contact.fullname}
                    </span>
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                      {contact.subject}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail size={16} />
                      <span>{contact.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone size={16} />
                      <span>{contact.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 text-gray-700">
                    <MessageSquare size={18} className="mt-1 flex-shrink-0" />
                    <p className="flex-grow">{contact.message}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-gray-500 text-sm">
                  <Calendar size={14} />
                  <span>
                    {format(
                      new Date(contact.created_at),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactSubmissions;
