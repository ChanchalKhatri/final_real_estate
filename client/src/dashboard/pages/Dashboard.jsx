import { useEffect, useState } from "react";
import {
  Users,
  Home,
  UserPlus,
  Building,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [totalProperties, setTotalProperties] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTeam, setTotalTeam] = useState(0);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [purchasedProperties, setPurchasedProperties] = useState([]);
  const [bookedApartments, setBookedApartments] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [soldProperties, setSoldProperties] = useState([]);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all", "available", "sold"

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("userData"));

    if (userData?.userData?.data) {
      setUserRole(userData.userData.data.role);
      setUserId(userData.userData.data.id);
    }
  }, []);

  useEffect(() => {
    // Fetch total properties
    fetch("http://localhost:3000/api/properties")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setTotalProperties(data.data.length);
        } else {
          console.error("Invalid data format:", data);
        }
      })
      .catch((error) => console.error("Error fetching properties:", error));

    // Fetch total users
    fetch("http://localhost:3000/api/auth/getAllUsers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setTotalUsers(data.data.length);
        } else {
          console.error("Invalid data format:", data);
        }
      })
      .catch((error) => console.error("Error fetching users:", error));

    // Fetch total team members
    fetch("http://localhost:3000/api/team")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setTotalTeam(data.data.length);
        } else {
          console.error("Invalid data format:", data);
        }
      })
      .catch((error) => console.error("Error fetching team members:", error));
  }, []);

  // Fetch apartment bookings for regular users
  useEffect(() => {
    if (userId && userRole === "user") {
      fetch(`http://localhost:3000/api/apartments/bookings/user/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setBookedApartments(data.data);
          } else {
            console.error("Invalid data format for apartment bookings:", data);
            setBookedApartments([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching apartment bookings:", error);
          setBookedApartments([]);
        });
    }
  }, [userId, userRole]);

  // Fetch properties based on user role
  useEffect(() => {
    if (!userRole) return;

    setLoading(true);

    if (userRole === "admin") {
      // Admin sees all properties
      fetch(`http://localhost:3000/api/properties?isAdmin=true`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            const properties = data.data;
            setAllProperties(properties);

            // Now fetch payment data to determine which properties are sold
            fetch(`http://localhost:3000/api/payment/all`)
              .then((res) => res.json())
              .then((paymentData) => {
                if (
                  paymentData.success &&
                  Array.isArray(paymentData.payments)
                ) {
                  // Get all property IDs that have payments
                  const soldPropertyIds = new Set(
                    paymentData.payments.map((payment) => payment.property_id)
                  );

                  // Separate properties into sold and available
                  const sold = properties.filter((prop) =>
                    soldPropertyIds.has(prop.id)
                  );
                  const available = properties.filter(
                    (prop) => !soldPropertyIds.has(prop.id)
                  );

                  setSoldProperties(sold);
                  setAvailableProperties(available);
                }
                setLoading(false);
              })
              .catch((error) => {
                console.error("Error fetching payment data:", error);
                setLoading(false);
              });
          } else {
            console.error("Invalid data format for admin properties:", data);
            setLoading(false);
          }
        })
        .catch((error) => {
          console.error("Error fetching admin properties:", error);
          setLoading(false);
        });
    } else if (userId) {
      // Regular users see only their purchased properties
      fetch(`http://localhost:3000/api/userprop/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            // Filter properties to only include those added by the user
            const userAddedProperties = data.data.filter(
              (prop) => prop.user_id === userId
            );
            setPurchasedProperties(userAddedProperties);
          } else {
            console.error(
              "Invalid data format for purchased properties:",
              data
            );
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching purchased properties:", error);
          setLoading(false);
        });
    }
  }, [userRole, userId]);

  const dashboardTitle =
    {
      user: "User Dashboard",
      seller: "Seller Dashboard",
    }[userRole] || "Admin Dashboard";

  // Properties to display based on user role and active tab
  const getDisplayProperties = () => {
    if (userRole !== "admin" && userRole !== "seller")
      return purchasedProperties;

    switch (activeTab) {
      case "available":
        return availableProperties;
      case "sold":
        return soldProperties;
      default:
        return allProperties;
    }
  };

  const displayProperties = getDisplayProperties();

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-semibold">{dashboardTitle}</h1>
      <p className="text-gray-600 mt-2">Welcome to the {dashboardTitle}.</p>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-blue-500 text-white p-4 rounded-lg flex items-center">
          <Home className="w-10 h-10 mr-3" />
          <div>
            <h2 className="text-lg font-semibold">Total Properties</h2>
            <p className="text-2xl">{totalProperties}</p>
          </div>
        </div>

        {userRole === "admin" ? (
          <>
            <div className="bg-green-500 text-white p-4 rounded-lg flex items-center">
              <Users className="w-10 h-10 mr-3" />
              <div>
                <h2 className="text-lg font-semibold">Total Users</h2>
                <p className="text-2xl">{totalUsers}</p>
              </div>
            </div>

            <div className="bg-yellow-500 text-white p-4 rounded-lg flex items-center">
              <UserPlus className="w-10 h-10 mr-3" />
              <div>
                <h2 className="text-lg font-semibold">Total Team</h2>
                <p className="text-2xl">{totalTeam}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-amber-500 text-white p-4 rounded-lg flex items-center">
              <Home className="w-10 h-10 mr-3" />
              <div>
                <h2 className="text-lg font-semibold">My Properties</h2>
                <p className="text-2xl">{purchasedProperties.length}</p>
              </div>
            </div>

            <div className="bg-purple-500 text-white p-4 rounded-lg flex items-center">
              <Building className="w-10 h-10 mr-3" />
              <div>
                <h2 className="text-lg font-semibold">My Apartments</h2>
                <p className="text-2xl">{bookedApartments.length}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Properties Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {userRole === "admin" || userRole === "seller"
              ? "All Properties"
              : "My Properties"}
          </h2>
          {(userRole === "admin" || userRole === "seller") && (
            <Link
              to="/dashboard/property/new"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm"
            >
              Add New Property
            </Link>
          )}
        </div>

        {/* Admin Tabs */}
        {(userRole === "admin" || userRole === "seller") && (
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === "all"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              All Properties ({allProperties.length})
            </button>
            <button
              onClick={() => setActiveTab("available")}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
                activeTab === "available"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <XCircle size={16} className="mr-1" /> Available (
              {availableProperties.length})
            </button>
            <button
              onClick={() => setActiveTab("sold")}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
                activeTab === "sold"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <CheckCircle size={16} className="mr-1" /> Sold (
              {soldProperties.length})
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading properties...</div>
        ) : displayProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayProperties.map((property) => {
              console.log("data-props: ", property);
              return (
                <div
                  key={property.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="h-40 mb-3 overflow-hidden rounded-md">
                    <img
                      src={`http://localhost:3000/${property.image}`}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-lg">{property.name}</h3>
                  <p className="text-gray-600 mb-1">
                    Location: {property.location}
                  </p>
                  <p className="text-amber-600 font-medium mb-2">
                    Price: {property.price}
                  </p>

                  {userRole === "admin" && (
                    <>
                      {activeTab === "sold" && (
                        <div className="mt-2 mb-2">
                          <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs">
                            <CheckCircle size={14} className="inline mr-1" />{" "}
                            Property Sold
                          </span>
                        </div>
                      )}

                      <div className="flex space-x-2 mt-2">
                        <Link
                          to={`/dashboard/property/edit/${property.id}`}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/dashboard/property/view/${property.id}`}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200"
                        >
                          View
                        </Link>
                      </div>
                    </>
                  )}
                  {userRole === "seller" && (
                    <>
                      {activeTab === "sold" && (
                        <div className="mt-2 mb-2">
                          <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs">
                            <CheckCircle size={14} className="inline mr-1" />{" "}
                            Property Sold
                          </span>
                        </div>
                      )}

                      <div className="flex space-x-2 mt-2">
                        <Link
                          to={`/dashboard/property/edit/${property.id}`}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/dashboard/property/view/${property.id}`}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200"
                        >
                          View
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p>
              {userRole === "admin" || userRole === "seller"
                ? activeTab === "all"
                  ? "No properties found in the system."
                  : activeTab === "available"
                  ? "No available properties found."
                  : "No sold properties found."
                : "You haven't purchased any properties yet."}
            </p>
          </div>
        )}
      </div>

      {/* Apartment Bookings Section (for regular users) */}
      {userRole === "user" && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Apartment Bookings</h2>
            <Link
              to="/dashboard/my-apartments"
              className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg text-sm"
            >
              View All
            </Link>
          </div>

          {bookedApartments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookedApartments.slice(0, 3).map((booking) => (
                <div
                  key={booking.booking_id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="h-40 mb-3 overflow-hidden rounded-md bg-gray-200 flex items-center justify-center">
                    {booking.image ? (
                      <img
                        src={`http://localhost:3000/${booking.image}`}
                        alt={booking.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building size={48} className="text-gray-400" />
                    )}
                  </div>
                  <h3 className="font-semibold text-lg flex items-center">
                    <Building size={16} className="mr-2" /> {booking.name}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    Unit: {booking.unit_number}
                  </p>
                  <p className="text-purple-600 font-medium mb-2">
                    Status: {booking.booking_status}
                  </p>
                  <div className="mt-2">
                    <Link
                      to="/dashboard/my-apartments"
                      className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm hover:bg-purple-200"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p>You haven't booked any apartments yet.</p>
              <Link
                to="/apartments"
                className="inline-block mt-2 text-purple-600 hover:text-purple-700"
              >
                Browse Available Apartments
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
