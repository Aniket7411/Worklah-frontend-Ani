import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, X, LayoutDashboard, Briefcase, Users, Building2, CreditCard, MessageSquare, QrCode, FileCheck, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

// Define the type for menu items
interface MenuItem {
  icon: React.ReactNode;
  text: string;
  path: string;
  description?: string;
}

// Using Lucide icons for better consistency and scalability
const menuItems: MenuItem[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    text: "Dashboard",
    path: "/",
    description: "Overview and analytics"
  },
  {
    icon: <Briefcase className="w-5 h-5" />,
    text: "Job Management",
    path: "/jobs/job-management",
    description: "Manage all jobs"
  },
  {
    icon: <FileCheck className="w-5 h-5" />,
    text: "Applications",
    path: "/applications",
    description: "Review & approve applications"
  },
  {
    icon: <Users className="w-5 h-5" />,
    text: "Hustle Heroes",
    path: "/hustle-heroes",
    description: "Worker management"
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    text: "Employers",
    path: "/employers",
    description: "Employer accounts"
  },
  {
    icon: <CreditCard className="w-5 h-5" />,
    text: "Payments & Transactions",
    path: "/payments",
    description: "Financial records"
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    text: "Support & Feedback",
    path: "/support",
    description: "Customer support"
  },
  {
    icon: <QrCode className="w-5 h-5" />,
    text: "QR Code Management",
    path: "/qrCode",
    description: "QR code settings"
  },
  {
    icon: <CalendarDays className="w-5 h-5" />,
    text: "Timesheet",
    path: "/timesheet",
    description: "Generate & manage timesheets"
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen: controlledIsOpen, onToggle }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [activePath, setActivePath] = useState<string>("/");
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = onToggle || setInternalIsOpen;

  // Update the active state based on the current route
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const large = window.innerWidth >= 1024;
      setIsLargeScreen(large);

      // On large screens, sidebar should always be open
      if (large && controlledIsOpen === undefined) {
        setInternalIsOpen(true);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [controlledIsOpen]);

  const toggleSidebar = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const handleNavClick = () => {
    // Close sidebar on mobile when navigating
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Check if path is active (supports nested routes)
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-white shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isLargeScreen ? 0 : (isOpen ? 0 : -320),
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed lg:sticky top-0 h-screen w-72 sm:w-80 bg-gradient-to-b from-[#F9FDFF] to-white border-r border-gray-200 flex flex-col shadow-lg lg:shadow-none z-50"
      >
        {/* Logo Section */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/assets/logo.png"
                alt="WorkLah Logo"
                className="h-10 sm:h-12 object-contain"
              />
              <span className="text-lg sm:text-xl font-bold text-gray-900 hidden sm:block">
                WorkLah
              </span>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 sm:px-4">
          <ul className="space-y-1.5">
            {menuItems.map((item, index) => {
              const active = isActive(item.path);
              return (
                <li key={item.text}>
                  <NavLink
                    to={item.path}
                    onClick={handleNavClick}
                    className={({ isActive: navIsActive }) =>
                      `group flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl transition-all duration-200 relative ${active || navIsActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                      }`
                    }
                  >
                    {/* Active indicator */}
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}

                    {/* Icon */}
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${active
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600"
                        }`}
                    >
                      {item.icon}
                    </div>

                    {/* Menu Item Text */}
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm sm:text-base font-medium truncate">
                        {item.text}
                      </span>
                      {item.description && (
                        <span className={`block text-xs mt-0.5 truncate ${active ? "text-white/80" : "text-gray-500"
                          }`}>
                          {item.description}
                        </span>
                      )}
                    </div>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Section */}
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-red-100 transition-colors">
              <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
            </div>
            <span className="font-medium text-sm sm:text-base">Logout</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;