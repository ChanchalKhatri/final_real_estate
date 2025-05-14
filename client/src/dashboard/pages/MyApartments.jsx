import { useState, useEffect } from "react";
import { Building, FileSearch } from "lucide-react";
import ApartmentPropertyCard from "../components/ApartmentPropertyCard";

const MyApartments = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get user ID from session storage
  const userDataString = sessionStorage.getItem("userData");
  const parsedUserData = userDataString ? JSON.parse(userDataString) : null;
  const userId = parsedUserData?.userData?.data?.id;

  useEffect(() => {
    fetchUserBookings();
  }, [userId]);

  const fetchUserBookings = async () => {
    if (!userId) {
      setError("User ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`Fetching apartment bookings for user ID: ${userId}`);

      const response = await fetch(
        `http://localhost:3000/api/apartments/bookings/${userId}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(
          `API error: ${response.status} - ${errorText || "Unknown error"}`
        );
      }

      const data = await response.json();
      console.log(`Received booking data:`, data);

      if (data.success) {
        setBookings(data.data || []);
        if (data.data && data.data.length > 0) {
          console.log(`Found ${data.data.length} bookings`);
        } else {
          console.log("No bookings found");
        }
      } else {
        console.error("API returned error:", data.message);
        setError(data.message || "Failed to fetch booked apartments");
        setBookings([]);
      }
    } catch (err) {
      console.error("Error fetching booked apartments:", err);
      setError(
        `Error fetching your booked apartments: ${err.message}. Please try again.`
      );
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-gray-100">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-wide text-gray-900 flex items-center mb-4 sm:mb-0">
          <Building className="mr-2 sm:mr-3 flex-shrink-0" />
          <span>My Apartment Bookings</span>
        </h1>
      </div>

      {loading ? (
        <div className="text-center py-8 sm:py-12">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p>Loading your apartment bookings...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 sm:p-6 md:p-8 rounded-lg text-center">
          <div className="text-red-500 mb-4 flex justify-center">
            <FileSearch size={48} className="sm:w-16 sm:h-16" />
          </div>
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-blue-50 p-4 sm:p-6 md:p-8 rounded-lg text-center">
          <div className="text-blue-500 mb-4 flex justify-center">
            <Building size={48} className="sm:w-16 sm:h-16" />
          </div>
          <h3 className="text-lg font-semibold text-blue-700 mb-2">
            No Bookings Found
          </h3>
          <p className="text-blue-600">
            You haven't booked any apartments yet. Browse our apartment listings
            and book your dream home.
          </p>
          <a
            href="/apartment"
            className="mt-4 inline-block px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Browse Apartment
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {bookings.map((booking) => (
            <ApartmentPropertyCard key={booking.booking_id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApartments;
