import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Bell, User } from 'lucide-react';

const TopBar = () => {
    const { user } = useAuth();
    const [status, setStatus] = useState("CHECKING");

    useEffect(() => {
        const checkHealth = () => {
            api.get("/health")
                .then(() => setStatus("ONLINE"))
                .catch(() => setStatus("OFFLINE"));
        };

        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center justify-between mb-8 pl-1">
            {/* Mobile Title / Breadcrumb Placeholder */}
            <h2 className="text-xl font-bold text-white md:hidden">Transport ERP</h2>

            <div className="flex items-center ml-auto gap-4">
                {/* System Status Pill */}
                <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === "ONLINE" ? "bg-green-400" : "bg-red-400"}`}></span>
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status === "ONLINE" ? "bg-green-500" : "bg-red-500"}`}></span>
                    </span>
                    <span className="text-xs font-medium text-white/70">
                        {status === "ONLINE" ? "System Active" : "Offline"}
                    </span>
                </div>

                {/* Action Icons */}
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                        <Bell size={20} />
                    </button>

                    <div className="flex items-center gap-3 pl-2 sm:pl-4 sm:border-l border-white/10">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
                            <p className="text-xs text-white/50">{user?.role || 'Superuser'}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold border border-white/20">
                            {user?.email?.[0]?.toUpperCase() || 'A'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
