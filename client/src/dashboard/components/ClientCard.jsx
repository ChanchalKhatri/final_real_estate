import { Star, Edit, Trash2, User } from "lucide-react";

const ClientCard = ({ client, onEdit, onDelete }) => {
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
    <div className="bg-white p-6 rounded-xl shadow-lg transition-all hover:scale-105 hover:shadow-xl text-center border border-gray-200 relative">
      {/* Profile Picture */}
      {client.image ? (
        <img
          src={getImageUrl(client.image)}
          alt={`${client.first_name} ${client.last_name}`}
          className="w-24 h-24 mx-auto rounded-full border-4 border-blue-500 shadow-sm object-cover"
          onError={(e) => {
            console.error("Error loading client image");
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

      {/* Client Info */}
      <h2 className="text-xl font-semibold mt-4 text-gray-900">
        {client.first_name} {client.last_name}
      </h2>
      <p className="text-gray-600 italic">"{client.feedback}"</p>

      {/* Ratings */}
      <div className="flex justify-center mt-2">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            size={18}
            className={`${
              index < client.rating ? "text-yellow-500" : "text-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-3">
        <button
          onClick={() => onEdit(client)}
          className="text-blue-500 hover:text-blue-700"
        >
          <Edit size={20} />
        </button>
        <button
          onClick={() => onDelete(client.id)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default ClientCard;
