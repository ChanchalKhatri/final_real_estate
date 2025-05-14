import { useEffect, useState } from "react";
import {
  Home,
  List,
  Users,
  MessageSquare,
  Layers,
  Settings,
  Mail,
  UserCircle,
  LogOut,
  Building,
  Bed,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("userData"));

    if (userData.userData.data.role) {
      setUserRole(userData.userData.data.role);
    }
  }, []);

  const menuItems = [
    { name: "Home", icon: <Home size={20} />, path: "/" },
    { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },

    ...(userRole === "user"
      ? [
          {
            name: "New Property",
            icon: <List size={20} />,
            path: "/dashboard/new-property",
          },
          {
            name: "My Property",
            icon: <List size={20} />,
            path: "/dashboard/my-property",
          },
          {
            name: "My Apartments",
            icon: <Building size={20} />,
            path: "/dashboard/my-apartments",
          },
        ]
      : []),

    ...(userRole === "admin" || userRole === "seller"
      ? [
          {
            name: "Property Features",
            icon: <List size={20} />,
            path: "/dashboard/property-features",
          },
          {
            name: "Apartments",
            icon: <Building size={20} />,
            path: "/dashboard/apartments",
          },
        ]
      : []),

    ...(userRole === "admin"
      ? [
          {
            name: "Client Says",
            icon: <MessageSquare size={20} />,
            path: "/dashboard/client-says",
          },
          { name: "Team", icon: <Users size={20} />, path: "/dashboard/team" },
          {
            name: "Users",
            icon: <Users size={20} />,
            path: "/dashboard/users",
          },
          {
            name: "Contact Submissions",
            icon: <Mail size={20} />,
            path: "/dashboard/contacts",
          },
        ]
      : []),
  ];

  const logout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/");
  };

  return (
    <aside className="w-64 h-screen fixed bg-white bg-opacity-90 backdrop-blur-md shadow-xl border-r border-gray-200 p-6 flex flex-col">
      {/* Logo & Title */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        <h2 className="text-lg font-bold text-gray-800">
          {{ user: "User Dashboard", seller: "Seller Dashboard" }[userRole] ||
            "Admin Dashboard"}
        </h2>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1">
        {menuItems.map((item) => (
          <Link key={item.name} to={item.path}>
            <button
              onClick={() => setActiveTab(item.name)}
              className={`flex items-center gap-4 p-3 w-full rounded-lg text-sm font-medium transition-all
                ${
                  activeTab === item.name
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
            >
              {item.icon} <span>{item.name}</span>
            </button>
          </Link>
        ))}
      </nav>

      {/* Profile Link - Added before logout */}
      <Link to="/dashboard/profile">
        <button
          onClick={() => setActiveTab("Profile")}
          className={`flex items-center gap-4 p-3 w-full rounded-lg text-sm font-medium transition-all mb-2
            ${
              activeTab === "Profile"
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
        >
          <UserCircle size={20} /> <span>Profile</span>
        </button>
      </Link>

      {/* Logout Button */}
      <button
        className="flex items-center gap-3 p-3 w-full text-red-600 font-medium hover:bg-red-50 rounded-lg transition-all"
        onClick={logout}
      >
        <LogOut size={20} /> Logout
      </button>
    </aside>
  );
};

export default Sidebar;
