import React from 'react';
import Sidebar from './Sidebar';
import GlassStatusBar from '../components/GlassStatusBar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen text-white flex">
            <Sidebar />
            <main className="flex-1 md:ml-64 transition-all duration-300 relative flex flex-col">
                <GlassStatusBar />
                <div className="p-4 md:p-8 flex-1">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
