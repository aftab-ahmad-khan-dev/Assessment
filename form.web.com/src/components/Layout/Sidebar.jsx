import React, { useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../../assets/logo.png";
import {
  BarChart3,
  ScanLine,
  FileText,
  FileBadge2Icon,
  ChevronLeft,
  ChevronRight,
  Activity,
  LogOut,
  X,
} from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";

const Sidebar = ({ isMobileOpen, onClose }) => {
  const { sidebarCollapsed, toggleSidebar, logout } = useApp();
  const location = useLocation();

  const navItems = [
    { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
    { to: "/scan", icon: ScanLine, label: "Document Scan", primary: true },
    { to: "/records", icon: FileText, label: "Individual Records" },
    { to: "/business-records", icon: FileBadge2Icon, label: "Business Records" },
  ];

  useEffect(() => {
    if (isMobileOpen) onClose();
    // eslint-disable-next-line
  }, [location.pathname]);

  return (
    <>
      {/* Dim background overlay (mobile only) */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            key="overlay"
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar container */}
      <AnimatePresence>
        {(isMobileOpen || window.innerWidth >= 1024) && (
          <motion.aside
            key="sidebar"
            initial={{ x: "-100%", opacity: 0 }}
            animate={{
              x: 0,
              opacity: 1,
              width: sidebarCollapsed ? 72 : 280,
            }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              width: { duration: 0.35, ease: [0.25, 0.8, 0.25, 1] },
              default: { duration: 0.35, ease: "easeOut" },
            }}
            className="fixed lg:relative top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg lg:shadow-sm flex flex-col z-50"
          >
            {/* Header / Logo Section */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <AnimatePresence mode="wait">
                {!sidebarCollapsed && (
                  <motion.img
                    key="logo"
                    src={Logo}
                    alt="Logo"
                    className="w-40"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.25 }}
                  />
                )}
              </AnimatePresence>

              {/* Smooth Collapse Button */}
              <motion.button
                onClick={toggleSidebar}
                className="p-2 rounded-lg bg-gray-50 hidden lg:block hover:bg-gray-100 border border-gray-200 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {sidebarCollapsed ? (
                    <motion.div
                      key="chev-right"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="chev-left"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ChevronLeft className="h-4 w-4 text-gray-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
              {(
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-lg block lg:hidden bg-gray-50 hover:bg-gray-100 border border-gray-200 transition lg:hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="h-5 w-5 text-gray-600" />
                </motion.button>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-3 rounded-full transition-all duration-200 group relative ${isActive
                      ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    } ${sidebarCollapsed ? "justify-center" : "space-x-3"}`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.25 }}
                        className="font-medium text-sm"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
              <motion.button
                onClick={logout}
                className={`flex items-center w-full px-3 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 group ${sidebarCollapsed ? "justify-center" : "space-x-3"
                  }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <LogOut className="h-5 w-5" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.25 }}
                      className="font-medium text-sm"
                    >
                      Sign Out
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
