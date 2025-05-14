import { useState, useEffect } from "react";
import { PlusCircle, XCircle, Camera } from "lucide-react";
import TeamCard from "../components/TeamCard";

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [newMember, setNewMember] = useState({
    first_name: "",
    last_name: "",
    position: "",
    email: "",
    image: "",
  });

  // Define an array of positions for the dropdown
  const positions = [
    "CEO",
    "CTO",
    "Marketing Director",
    "Head of Sales",
    "Product Manager",
    "Lead Developer",
    "UX Designer",
    "Content Writer",
    "Financial Analyst",
    "HR Manager",
  ];

  // Fetch team members from the backend
  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/team");

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setTeamMembers(result.data);
      } else {
        console.error("Unexpected API response:", result);
        setTeamMembers([]);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      setTeamMembers([]);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleInputChange = (e) => {
    setNewMember({ ...newMember, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Add or Edit a Team Member
  const handleAddOrEditMember = async () => {
    if (
      !newMember.first_name ||
      !newMember.last_name ||
      !newMember.position ||
      !newMember.email
    ) {
      alert("Please fill out all required fields.");
      return;
    }

    try {
      // Create a FormData object to send file and other data
      const formData = new FormData();
      formData.append("first_name", newMember.first_name);
      formData.append("last_name", newMember.last_name);
      formData.append("position", newMember.position);
      formData.append("email", newMember.email);

      // Append image file if available
      if (imageFile) {
        formData.append("image", imageFile);
      }

      let response;

      if (editingMember) {
        // Update team member in backend
        response = await fetch(
          `http://localhost:3000/api/team/${editingMember.id}`,
          {
            method: "PUT",
            body: formData,
          }
        );
      } else {
        // Add new member to backend
        response = await fetch("http://localhost:3000/api/team", {
          method: "POST",
          body: formData,
        });
      }

      if (response.ok) {
        fetchTeamMembers(); // Fetch updated data after add/edit
      }
    } catch (error) {
      console.error("Error saving team member:", error);
    }

    // Reset form
    setNewMember({
      first_name: "",
      last_name: "",
      position: "",
      email: "",
      image: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(false);
    setEditingMember(null);
  };

  // Edit a member
  const handleEditMember = (member) => {
    setEditingMember(member);
    setNewMember({
      first_name: member.first_name,
      last_name: member.last_name,
      position: member.position,
      email: member.email,
      image: member.image,
    });

    // Set image preview if there's an existing image
    if (member.image) {
      // For server-stored images, we need to include the base URL
      setImagePreview(`http://localhost:3000/${member.image}`);
    } else {
      setImagePreview(null);
    }
    setImageFile(null);
    setShowModal(true);
  };

  // Delete a member
  const handleDeleteMember = async (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        const response = await fetch(`http://localhost:3000/api/team/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchTeamMembers(); // Fetch updated data after delete
        }
      } catch (error) {
        console.error("Error deleting team member:", error);
      }
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-wide text-gray-900">
          🚀 Team Management
        </h1>
        <button
          onClick={() => {
            setEditingMember(null);
            setNewMember({
              first_name: "",
              last_name: "",
              position: "",
              email: "",
              image: "",
            });
            setImageFile(null);
            setImagePreview(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md transition-all hover:shadow-xl"
        >
          <PlusCircle size={22} /> Add Team Member
        </button>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {teamMembers.length > 0 ? (
          teamMembers.map((member) => (
            <TeamCard
              key={member.id}
              member={member}
              onEdit={() => handleEditMember(member)}
              onDelete={() => handleDeleteMember(member.id)}
            />
          ))
        ) : (
          <p className="text-center col-span-full text-gray-600">
            No team members found.
          </p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-10 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl shadow-xl w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                {editingMember ? "Edit Team Member" : "Add New Team Member"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Image Preview and Upload */}
            <div className="flex flex-col items-center mb-4">
              {imagePreview ? (
                <div className="relative mb-3">
                  <img
                    src={imagePreview}
                    alt="Team Member Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                  />
                  <label
                    htmlFor="team-image"
                    className="absolute bottom-0 right-0 bg-blue-500 p-1 rounded-full cursor-pointer"
                  >
                    <Camera size={16} className="text-white" />
                  </label>
                </div>
              ) : (
                <label
                  htmlFor="team-image"
                  className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer mb-3 hover:bg-gray-50"
                >
                  <Camera size={24} className="text-gray-400" />
                </label>
              )}
              <input
                type="file"
                id="team-image"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              <span className="text-sm text-gray-500">
                {imageFile ? imageFile.name : "Click to upload member image"}
              </span>
            </div>

            {/* Form Inputs */}
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={newMember.first_name}
              onChange={handleInputChange}
              className="w-full p-2 mb-3 border rounded-md"
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={newMember.last_name}
              onChange={handleInputChange}
              className="w-full p-2 mb-3 border rounded-md"
            />

            {/* Dropdown for Position */}
            <select
              name="position"
              value={newMember.position}
              onChange={handleInputChange}
              className="w-full p-2 mb-3 border rounded-md"
            >
              <option value="" disabled>
                Select Position
              </option>
              {positions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={newMember.email}
              onChange={handleInputChange}
              className="w-full p-2 mb-3 border rounded-md"
            />

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrEditMember}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {editingMember ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
