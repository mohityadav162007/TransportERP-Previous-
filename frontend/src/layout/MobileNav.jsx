import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, PlusCircle, PieChart, Menu } from 'lucide-react';

const MobileNav = () => {
    const navItems = [
        { name: 'Home', path: '/', icon: LayoutDashboard },
        { name: 'Trips', path: '/trips', icon: Truck },
        { name: 'New', path: '/trips/new', icon: PlusCircle },
        { name: 'Stats', path: '/analytics', icon: PieChart },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 glass-panel border-t border-white/10 flex md:hidden items-center justify-around z-50 px-2 pb-safe">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `
            flex flex-col items-center justify-center p-2 rounded-xl transition-all
            ${isActive
                            ? 'text-blue-400 -translate-y-2'
                            : 'text-white/50 hover:text-white/80'}
          `}
                >
                    <item.icon size={20} className={({ isActive }) => isActive ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''} />
                    <span className="text-[10px] font-medium mt-1">{item.name}</span>
                </NavLink>
            ))}
            <button className="flex flex-col items-center justify-center p-2 text-white/50 hover:text-white/80">
                <Menu size={20} />
                <span className="text-[10px] font-medium mt-1">More</span>
            </button>
        </nav>
    );
};

export default MobileNav;
