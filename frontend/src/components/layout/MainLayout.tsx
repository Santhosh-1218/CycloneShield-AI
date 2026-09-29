import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';

export const MainLayout: React.FC = () => {
  const { pathname } = useLocation();
  const isFullScreenMap = pathname === '/dashboard' || pathname === '/map' || pathname === '/risk-map';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#111111] font-sans selection:bg-[#F0FDF4] selection:text-[#16A34A]">
      {/* Top Navbar Header */}
      <Header />

      {/* Main Outlet Container */}
      <main className={`flex-1 w-full ${isFullScreenMap ? 'p-0' : 'max-w-7xl mx-auto p-3 sm:p-5 lg:p-6'}`}>
        <Outlet />
      </main>
    </div>
  );
};
