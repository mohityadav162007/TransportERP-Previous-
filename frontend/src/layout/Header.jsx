import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [status, setStatus] = useState("CHECKING");
  const { user, logout } = useAuth();

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

  return (
    <header className="flex items-center justify-between bg-white border-b px-6 py-3">
      <div className="font-semibold text-lg">
        Transport ERP
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${status === "ONLINE"
              ? "bg-green-600"
              : status === "OFFLINE"
                ? "bg-red-600"
                : "bg-gray-400"
              }`}
          />
          <span
            className={`font-medium ${status === "OFFLINE" ? "text-red-600" : "text-gray-700"
              }`}
          >
            {status === "ONLINE"
              ? "System Online"
              : status === "OFFLINE"
                ? "Database Down"
                : "Checking..."}
          </span>
        </div>

        {user && (
          <div className="flex items-center gap-3 border-l pl-4">
            <span className="text-gray-600">{user.email}</span>
            <button
              onClick={logout}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
