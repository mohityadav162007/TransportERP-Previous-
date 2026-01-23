import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen text-white flex">
            <Sidebar />
            <main className="flex-1 md:ml-64 p-4 md:p-8 transition-all duration-300">
                <div className="max-w-7xl mx-auto space-y-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
