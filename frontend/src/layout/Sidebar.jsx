import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Truck,
    PlusCircle,
    PieChart,
    FileText,
    History,
    Receipt,
    ShieldCheck,
    LogOut,
    Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'All Trips', path: '/trips', icon: Truck },
        { name: 'New Trip', path: '/trips/new', icon: PlusCircle },
        { name: 'Own Trips', path: '/own-trips', icon: Truck },
        { name: 'Analytics', path: '/analytics', icon: PieChart },
        { name: 'Reports', path: '/reports', icon: FileText },
        { name: 'Payments', path: '/payment-history', icon: History },
        { name: 'Expenses', path: '/expenses', icon: Receipt },
        { name: 'Couriers', path: '/courier', icon: Package },
        { name: 'Admin', path: '/admin-panel', icon: ShieldCheck },
    ];

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 hidden md:flex flex-col glass-panel border-r border-white/10 z-50">
            <div className="p-6 border-b border-white/5">
                <h1 className="text-xl font-bold text-gradient">Transport ERP</h1>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                ${isActive
                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                                    : 'text-white/60 hover:text-white hover:bg-white/5 hover:translate-x-1'}
              `}
                        >
                            <item.icon size={20} className={isActive ? 'text-blue-400' : 'text-white/50'} />
                            <span className="font-medium text-sm">{item.name}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
