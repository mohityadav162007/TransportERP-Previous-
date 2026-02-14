import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Truck,
    PieChart,
    FileText,
    History,
    Receipt,
    ShieldCheck,
    LogOut,
    Package,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import { Button } from '../components/ui/Button';

const Sidebar = ({ isOpen, onClose }) => {
    const { logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'All Trips', path: '/trips', icon: Truck },
        { name: 'Own Trips', path: '/own-trips', icon: Truck },
        { name: 'Analytics', path: '/analytics', icon: PieChart },
        { name: 'Reports', path: '/reports', icon: FileText },
        { name: 'Payments', path: '/payment-history', icon: History },
        { name: 'Expenses', path: '/expenses', icon: Receipt },
        { name: 'Couriers', path: '/courier', icon: Package },
        { name: 'Admin', path: '/admin-panel', icon: ShieldCheck },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-card text-card-foreground border-r">
            <div className="p-6 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                        <Truck className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Transport ERP</h1>
                </div>
                <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => onClose && onClose()}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                        >
                            <item.icon size={20} className={cn("transition-colors", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                            <span className="font-medium text-sm">{item.name}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="p-4 border-t space-y-2">
                <Button
                    variant="outline"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900"
                    onClick={logout}
                >
                    <LogOut size={18} className="mr-2" />
                    Logout
                </Button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 h-screen fixed left-0 top-0 flex-col z-30">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" onClick={onClose} />
            )}

            {/* Mobile Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-background shadow-lg transition-transform duration-300 md:hidden",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <SidebarContent />
            </div>
        </>
    );
};

export default Sidebar;
