import { Mail, Edit, Trash2, User } from "lucide-react";

const TeamCard = ({ member, onEdit, onDelete }) => {
  console.log(member);

  const handleDelete = async () => {
    if (
      window.confirm(`Are you sure you want to delete ${member.first_name}?`)
    ) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/team/${member.id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          onDelete(member.id); // Update UI after deletion
        } else {
          console.error("Failed to delete member");
        }
      } catch (error) {
        console.error("Error deleting member:", error);
      }
    }
  };

  // Handle image path - add server base URL if it's a server path
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Check if the image path is a full URL
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // Otherwise, prepend the server base URL
    return `http://localhost:3000/${imagePath}`;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg transition-all hover:scale-105 hover:shadow-xl text-center border border-gray-200">
      {/* Profile Picture */}
      {member.image ? (
        <img
          src={getImageUrl(member.image)}
          alt={`${member.first_name} ${member.last_name}`}
          className="w-24 h-24 mx-auto rounded-full border-4 border-blue-500 shadow-sm object-cover"
          onError={(e) => {
            console.error("Error loading team member image");
            e.target.onerror = null;
            e.target.src = ""; // Clear src to prevent endless retries
            e.target.parentNode.innerHTML = `
              <div class="w-24 h-24 mx-auto rounded-full border-4 border-blue-500 shadow-sm bg-gray-200 flex items-center justify-center">
                <User size={36} className="text-gray-400" />
              </div>
            `;
          }}
        />
      ) : (
        <div className="w-24 h-24 mx-auto rounded-full border-4 border-blue-500 shadow-sm bg-gray-200 flex items-center justify-center">
          <User size={36} className="text-gray-400" />
        </div>
      )}

      {/* Member Info */}
      <h2 className="text-xl font-semibold mt-4 text-gray-900">
        {member.first_name} {member.last_name}
      </h2>
      <p className="text-gray-600">{member.position}</p>

      {/* Contact */}
      <a
        href={`mailto:${member.email}`}
        className="flex items-center justify-center gap-2 text-blue-500 text-sm hover:text-blue-600 transition mt-2"
      >
        <Mail size={16} />
        {member.email}
      </a>

      {/* Edit & Delete Buttons */}
      <div className="mt-4 flex justify-center gap-3">
        <button
          onClick={() => onEdit(member)}
          className="text-yellow-500 hover:text-yellow-600"
        >
          <Edit size={18} />
        </button>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-600"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default TeamCard;
