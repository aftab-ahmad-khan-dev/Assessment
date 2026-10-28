import React from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const { currentUser } = useApp();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/scan":
        return "New Scan";
      case "/records":
        return "All Records";
      default:
        return "OCR Sticker Intake";
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30"
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        {/* Hamburger menu button for mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {getPageTitle()}
          </h1>
          <p className="text-sm text-gray-600 mt-1 hidden sm:block">
            Welcome back, {currentUser?.username}
          </p>
        </div>

        <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
