import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";
import DashboardMain from "./dashboard/DashboardMain";

const PropertyLoad = lazy(() => import("./pages/Property"));
const PropertyDetailsLoad = lazy(() => import("./pages/PropertyDetails"));
const ApartmentLoad = lazy(() => import("./pages/Apartment"));
const AboutLoad = lazy(() => import("./pages/About"));
const ContactLoad = lazy(() => import("./pages/Contact"));
const RegisterLoad = lazy(() => import("./pages/Register"));
const LoginLoad = lazy(() => import("./pages/Login"));

const App = () => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith("/dashboard");

  return (
    <>
      {!isDashboardRoute && <Navbar />}
      <Suspense fallback={<div>...Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/property" element={<PropertyLoad />} />
          <Route path="/property/:id" element={<PropertyDetailsLoad />} />
          <Route path="/apartment" element={<ApartmentLoad />} />
          <Route path="/about" element={<AboutLoad />} />
          <Route path="/contact" element={<ContactLoad />} />
          <Route path="/register" element={<RegisterLoad />} />
          <Route path="/login" element={<LoginLoad />} />
          <Route path="/dashboard/*" element={<DashboardMain />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!isDashboardRoute && <Footer />}
    </>
  );
};

export default App;
