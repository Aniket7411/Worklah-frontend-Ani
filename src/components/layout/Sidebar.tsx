import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Define the type for menu items
interface MenuItem {
  icon: string;
  text: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { icon: "/assets/icons/sidebar_icon1.svg", text: "Dashboard", path: "/" },
  { icon: "/assets/icons/sidebar_icon2.svg", text: "Job Management", path: "/jobs/job-management" },
  { icon: "/assets/icons/sidebar_icon3.svg", text: "Hustle Heroes", path: "/hustle-heroes" },
  { icon: "/assets/icons/sidebar_icon4.svg", text: "Employers", path: "/employers" },
  { icon: "/assets/icons/sidebar_icon5.svg", text: "Payments & Transactions", path: "/payments" },
  { icon: "/assets/icons/sidebar_icon6.svg", text: "Support & Feedback", path: "/support" },
  { icon: "/assets/icons/sidebar_icon6.svg", text: "QR Code Management", path: "/qrCode" },
];

const Sidebar: React.FC = () => {
  const [activePath, setActivePath] = useState<string>("/");
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Update the active state based on the current route
  React.useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-white shadow-md"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed lg:relative h-screen w-[300px] bg-[#F9FDFF] border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out z-40
        ${isOpen ? "left-0" : "-left-full lg:left-0"}`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-center gap-2">
            <img
              src="/assets/logo.png"
              alt="logo"
              className="h-14 object-contain"
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.text}>
                <NavLink
                  to={item.path}
                  onClick={() => {
                    setActivePath(item.path);
                    if (window.innerWidth < 1024) {
                      setIsOpen(false);
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activePath === item.path
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  {/* Icon Background */}
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full p-2 ${activePath === item.path
                      ? "bg-blue-600 text-gray-600"
                      : "bg-gray-200 text-gray-600"
                      }`}
                  >
                    <img src={item.icon} alt={item.text} className="w-8 h-8 fill-gray-500" />
                  </div>
                  {/* Menu Item Text */}
                  <span>{item.text}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="flex items-center gap-3 text-gray-600 hover:text-gray-900 w-full px-4 py-3 rounded-lg transition-colors hover:bg-gray-100"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-transparent hover:bg-gray-200">
              <LogOut size={20} />
            </div>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;