import { useState, useEffect } from "react";
import axios from "axios";
import { UserCircle, Save, Camera } from "lucide-react";
import InvoiceComponent from "../components/InvoiceComponent";

const Profile = () => {
  const [userData, setUserData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    profile_image: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      const response = await fetch(
        "http://localhost:3000/api/auth/getUserData",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setUserData(data.data);
        setUserId(data.data.id);
        console.log("User data loaded, ID:", data.data.id);

        setFormData({
          username: data.data.username,
          firstName: data.data.first_name,
          lastName: data.data.last_name,
          email: data.data.email,
        });
      } else {
        setError("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Error fetching user data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError("");
    setSuccess("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = sessionStorage.getItem("authToken");

      // Create form data to send both profile info and image
      const profileFormData = new FormData();
      profileFormData.append("username", formData.username);
      profileFormData.append("firstName", formData.firstName);
      profileFormData.append("lastName", formData.lastName);

      if (profileImage) {
        profileFormData.append("profileImage", profileImage);
      }

      const response = await axios.put(
        "http://localhost:3000/api/auth/updateProfile",
        profileFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setSuccess("Profile updated successfully");
        fetchUserData(); // Refresh data
        setIsEditing(false);
        setProfileImage(null);
        setImagePreview(null);
      } else {
        setError(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      setError("Error updating profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userData.username) {
    return <div className="text-center p-10">Loading user data...</div>;
  }

  // Get profile image URL if available
  const profileImageUrl = userData.profile_image
    ? `http://localhost:3000/${userData.profile_image}`
    : null;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <h1 className="text-2xl font-bold">User Profile</h1>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          {success}
        </div>
      )}

      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
            <div className="relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-200"
                />
              ) : profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-200"
                  onError={(e) => {
                    console.error("Error loading profile image");
                    e.target.onerror = null;
                    e.target.src = ""; // Clear src to prevent endless retries
                    e.target.parentNode.innerHTML = `<div class="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg></div>`;
                  }}
                />
              ) : (
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserCircle size={80} className="text-gray-400" />
                </div>
              )}

              {isEditing && (
                <label
                  htmlFor="profile-image"
                  className="absolute bottom-0 right-0 bg-purple-500 p-2 rounded-full cursor-pointer"
                >
                  <Camera size={16} className="text-white" />
                  <input
                    type="file"
                    id="profile-image"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
            <h2 className="text-xl font-semibold mt-4">
              {userData.first_name} {userData.last_name}
            </h2>
            <p className="text-gray-600 capitalize">{userData.role}</p>
          </div>

          <div className="md:w-2/3">
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                    {!loading && <Save size={16} />}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <h3 className="text-sm text-gray-500">Username</h3>
                    <p className="text-gray-800">{userData.username}</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-sm text-gray-500">Email</h3>
                    <p className="text-gray-800">{userData.email}</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-sm text-gray-500">First Name</h3>
                    <p className="text-gray-800">{userData.first_name}</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-sm text-gray-500">Last Name</h3>
                    <p className="text-gray-800">{userData.last_name}</p>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleEditToggle}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Update Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Payment History & Invoices
        </h2>
        {userId ? (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Showing payment history for user ID: {userId}
            </p>
            <InvoiceComponent userId={userId} />
          </>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded">
            <p>
              Loading user data... Please wait or refresh the page if this
              persists.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
