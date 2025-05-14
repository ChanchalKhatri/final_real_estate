import { Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import PropertyFeatures from "./pages/PropertyFeatures";
import ClientSays from "./pages/ClientSays";
import Team from "./pages/Team";
import Users from "./pages/Users";
import Property from "./pages/Property";
import NewProperty from "./pages/NewProperty";
import ContactSubmissions from "./pages/ContactSubmissions";
import Profile from "./pages/Profile";
import Apartments from "./pages/Apartments";
import MyApartments from "./pages/MyApartments";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="my-property" element={<Property />} />
        <Route path="my-apartments" element={<MyApartments />} />
        <Route path="new-property" element={<NewProperty />} />
        <Route path="property-features" element={<PropertyFeatures />} />
        <Route path="apartments" element={<Apartments />} />
        <Route path="property">
          <Route path="view/:id" element={<Property />} />
          <Route path="edit/:id" element={<NewProperty />} />
          <Route path="new" element={<NewProperty />} />
        </Route>
        <Route path="client-says" element={<ClientSays />} />
        <Route path="team" element={<Team />} />
        <Route path="users" element={<Users />} />
        <Route path="contacts" element={<ContactSubmissions />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
