// components/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { Bell, Search, Settings, LogOut, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../lib/authInstances";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // ✅ Fetch admin profile image on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/admin/profile/image", { withCredentials: true });
        if (res?.data?.imageUrl) {
          setImage(res.data.imageUrl);
        }
      } catch (err) {
        // Use default image on error
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImage(previewUrl); // Optional: instant preview

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axiosInstance.post(
        "/admin/profile/upload-image",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response?.data?.imageUrl) {
        setImage(response.data.imageUrl);
      }
    } catch (err) {
      // Handle error silently or show toast
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning!";
    if (hour < 18) return "Good Afternoon!";
    return "Good Evening!";
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 md:h-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section - Menu Button (mobile) + Search Bar (desktop) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1">
          {/* Hamburger Menu Button - Visible on mobile/tablet */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>

          {/* Search Bar (visible on medium+ screens) */}
          <div className="flex-1 max-w-2xl hidden md:flex items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search jobs, employers, outlets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700 placeholder-gray-400 transition-all"
              />
            </div>
          </div>

          {/* Mobile Search Icon (visible on small screens) */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => {/* Add mobile search modal if needed */ }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Right Section - Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          {/* Notifications */}
          <button
            onClick={() => alert("Notifications feature coming soon!")}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group flex items-center justify-center"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 sm:gap-3 p-1 sm:p-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
              aria-label="User menu"
            >
              {/* Profile Info - Hidden on mobile, visible on tablet+ */}
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm sm:text-base font-semibold text-gray-900 leading-tight">
                  {user?.fullName?.split(' ')?.[0] || 'Admin'}
                </span>
                <span className="text-xs text-gray-500 leading-tight">
                  {getGreeting()}
                </span>
              </div>

              {/* Profile Image/Avatar */}
              {image ? (
                <img
                  src={image}
                  alt="Profile"
                  className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-500 transition-colors"
                />
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm sm:text-base font-semibold shadow-sm">
                  {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />

                  {/* Dropdown Content */}
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    {/* Profile Section */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                      <div className="flex flex-col items-center gap-3">
                        {image ? (
                          <img
                            src={image}
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => fileInputRef.current?.click()}
                          />
                        ) : (
                          <div
                            className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-3xl font-semibold text-white border-4 border-white shadow-md cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleImageChange}
                        />
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-900">{user?.fullName || 'Admin'}</p>
                          <p className="text-sm text-gray-600 mt-0.5">{user?.email || ''}</p>
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          Change Photo
                        </button>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          // Navigate to settings if route exists
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors group"
                      >
                        <Settings className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        <span className="font-medium">Settings</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors group"
                      >
                        <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
