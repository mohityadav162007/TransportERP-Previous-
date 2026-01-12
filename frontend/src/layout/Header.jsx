import { useEffect, useState } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Menu, X, LogOut, User } from "lucide-react";

export default function Header() {
  const [status, setStatus] = useState("CHECKING");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkHealth = () => {
      api.get("/health")
        .then(() => setStatus("ONLINE"))
        .catch(() => setStatus("OFFLINE"));
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000); // every 10s

    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { name: "Dashboard", path: "/" },
    { name: "Trips", path: "/trips" },
    { name: "Own Trips", path: "/own-trips" },
    { name: "Analytics", path: "/analytics" },
    { name: "Reports", path: "/reports" },
    { name: "Payment History", path: "/payment-history" },
    { name: "Daily Expenses", path: "/expenses" },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ name: "Admin Panel", path: "/admin-panel" });
  }

  return (
    <header className="bg-white/5 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
      <div className="px-6 py-3 flex items-center justify-between">

        {/* Left: Logo & Navigation */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            {location.pathname !== "/" && (
              <button
                onClick={() => navigate(-1)}
                className="p-1 rounded-full hover:bg-white/10 text-gray-300 transition-colors"
                title="Go Back"
              >
                <span className="text-xl">←</span>
              </button>
            )}
            <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
            <div className="font-bold text-xl text-white tracking-tight">
              Transport ERP
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right: System Status & User Profile */}
        <div className="flex items-center gap-6">
          {/* System Status */}
          <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === "ONLINE" ? "bg-green-400" : status === "OFFLINE" ? "bg-red-400" : "bg-gray-400"
                }`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status === "ONLINE" ? "bg-green-500" : status === "OFFLINE" ? "bg-red-500" : "bg-gray-500"
                }`}></span>
            </span>
            <span
              className={`text-xs font-semibold ${status === "OFFLINE" ? "text-red-400" : "text-gray-300"
                }`}
            >
              {status === "ONLINE"
                ? "System Online"
                : status === "OFFLINE"
                  ? "Database Down"
                  : "Checking..."}
            </span>
          </div>

          {/* User Profile */}
          {user && (
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-white leading-tight">Admin</span>
                <span className="text-xs text-gray-400">{user.email}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
