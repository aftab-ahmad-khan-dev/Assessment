import React, { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useApp } from "../../context/AppContext.jsx";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";

const Layout = () => {
  const { isAuthenticated } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isMobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content (does NOT move when sidebar opens) */}
      <div className="flex-1 flex flex-col relative z-0">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto ">
          <div className="container mx-auto px-3 sm:px-6 lg:py-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
