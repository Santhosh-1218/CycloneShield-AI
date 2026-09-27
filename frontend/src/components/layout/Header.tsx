import React from 'react';
import { Search, Bell, Menu, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-[#0F172A] border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Mobile Menu & Brand Logo */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/dashboard" className="flex items-center space-x-2.5 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-sm text-white tracking-tight">CycloneShield AI</span>
        </Link>
      </div>

      {/* Middle Search Input matching Mockup */}
      <div className="hidden sm:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search locations..."
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right Controls: Notifications & User Profile Badge matching Mockup */}
      <div className="flex items-center space-x-3">
        <button className="relative p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-400" />
        </button>

        <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'C'}
          </div>
          <div className="hidden md:block text-left">
            <div className="font-bold text-xs text-white leading-tight">
              {user?.displayName || 'Chief'}
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">
              Disaster Management
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

