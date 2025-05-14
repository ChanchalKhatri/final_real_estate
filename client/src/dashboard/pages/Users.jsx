import { useState, useEffect } from "react";

const Users = () => {
  const [users, setUsers] = useState([]);

  // Function to fetch user data
  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/getAllUsers"
      ); // Update with the correct API endpoint
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setUsers(result.data); // Set fetched data to state
      } else {
        console.error("Unexpected API response:", result);
        setUsers([]); // Set empty array in case of an error or unexpected response
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]); // Set empty array if fetch fails
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold tracking-wide text-gray-900 mb-10">
        All Users
      </h1>

      {/* Users Table */}
      <div className="overflow-x-auto bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg shadow-lg">
        <table className="min-w-full table-auto text-sm text-gray-700">
          <thead>
            <tr className="bg-gradient-to-r from-blue-400 to-purple-400 text-white">
              <th className="py-3 px-6 text-left font-semibold">Username</th>
              <th className="py-3 px-6 text-left font-semibold">First Name</th>
              <th className="py-3 px-6 text-left font-semibold">Last Name</th>
              <th className="py-3 px-6 text-left font-semibold">Email ID</th>
              <th className="py-3 px-6 text-left font-semibold">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-4 px-6 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition-colors duration-200`}
                >
                  <td className="py-4 px-6">{user.username}</td>
                  <td className="py-4 px-6">{user.first_name}</td>
                  <td className="py-4 px-6">{user.last_name}</td>
                  <td className="py-4 px-6">{user.email}</td>
                  <td className="py-4 px-6">{user.role}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
