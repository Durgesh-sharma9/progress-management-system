import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-900 flex overflow-x-hidden relative">
      {/* Ambient background decorative glow lights */}
      <div className="fixed top-0 left-1/4 w-[400px] sm:w-[600px] h-[250px] sm:h-[350px] bg-brand-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[350px] sm:w-[500px] h-[200px] sm:h-[300px] bg-indigo-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-3 sm:p-5 lg:p-8 pb-20 sm:pb-24 lg:pb-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Dock */}
        <BottomNav />
      </div>
    </div>
  );
};

export default AppLayout;

