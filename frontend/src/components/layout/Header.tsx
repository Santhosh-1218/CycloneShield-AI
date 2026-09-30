import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Settings,
  Info,
  LayoutDashboard,
  MapPin,
  Zap,
  Building2,
  Sparkles,
  History as HistoryIcon,
  Database
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../context/LocationContext';
import { LocationSearch } from '../common/LocationSearch';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { user, logout } = useAuth();
  const { location } = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { label: 'Live Tracker', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Risk Map', path: '/risk-map', icon: MapPin },
    { label: 'Simulation', path: '/simulation', icon: Zap },
    { label: 'Infrastructure', path: '/infrastructure', icon: Building2 },
    { label: 'AI Assistant', path: '/copilot', icon: Sparkles },
    { label: 'History', path: '/history', icon: HistoryIcon },
    { label: 'Data Sources', path: '/data-sources', icon: Database }
  ];

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-transparent select-none p-1.5 sm:p-2.5 pointer-events-none w-full">
      <div className="w-full px-1 flex items-center justify-between gap-1.5 sm:gap-2">
        
        {/* Left Section: Brand Logo & Integrated Compact Search Bar */}
        <div className="pointer-events-auto flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#E5E5E5] shadow-md hover:bg-white transition-all group"
          >
            <img 
              src="/images/logo.png" 
              alt="CycloneShield AI" 
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover shadow-xs group-hover:scale-105 transition-transform" 
            />
            <span className="font-extrabold text-xs text-[#111111] tracking-tight leading-none hidden sm:inline">
              CYCLONESHIELD <span className="text-[#16A34A]">AI</span>
            </span>
          </Link>

          {/* Integrated Compact Search Bar */}
          <div className="w-40 sm:w-48 lg:w-56 hidden md:block shadow-md rounded-xl">
            <LocationSearch 
              compact={true} 
              placeholder="Search city..." 
            />
          </div>
        </div>

        {/* Center Section: Google Maps Style Navigation Chips (Compact, No Overflow Cutoff) */}
        <nav className="pointer-events-auto hidden lg:flex items-center space-x-1 sm:space-x-1.5 py-1 px-0.5 flex-1 justify-center max-w-5xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-full border transition-all shrink-0 cursor-pointer shadow-md backdrop-blur-md ${
                    isActive
                      ? 'bg-[#F0FDF4]/95 border-[#16A34A] text-[#16A34A] font-extrabold ring-1 ring-[#16A34A]/20'
                      : 'bg-white/95 border-[#E5E5E5] text-[#333333] hover:bg-white hover:border-[#CBD5E1] hover:text-[#111111]'
                  }`
                }
              >
                <Icon className={`w-3.5 h-3.5 ${item.label === 'AI Assistant' ? 'text-[#16A34A]' : ''}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Section: Location Badge, Alerts Bell Button, & Profile Avatar */}
        <div className="pointer-events-auto flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          
          {/* Active Location Indicator */}
          <div className="hidden 2xl:flex items-center gap-1.5 text-xs font-medium text-[#111111] bg-white/95 backdrop-blur-md border border-[#E5E5E5] px-2.5 py-1 rounded-full max-w-[130px] shadow-md truncate" title={`${location?.city || 'Kakinada'}, ${location?.state || 'Andhra Pradesh'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] shrink-0 animate-pulse" />
            <span className="truncate text-[10px] font-bold text-[#111111]">{location?.city || 'Kakinada'}</span>
          </div>

          {/* Notifications / Alerts Bell Button (Direct Redirection to /alerts) */}
          <button
            onClick={() => navigate('/alerts')}
            title="View Live Severe Weather Alerts"
            aria-label="Alerts & Notifications"
            className="p-1.5 sm:p-2 rounded-full bg-white/95 backdrop-blur-md text-[#DC2626] hover:text-[#B91C1C] hover:bg-[#FEF2F2] border border-[#FCA5A5] relative cursor-pointer shadow-md transition-colors group flex items-center gap-1"
          >
            <Bell className="w-4 h-4 animate-bounce" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#DC2626] border-2 border-white" />
          </button>

          {/* User Profile Avatar (Google Maps Style Ring) */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center p-0.5 rounded-full bg-white/95 backdrop-blur-md border-2 border-[#16A34A] hover:border-[#15803D] transition-colors cursor-pointer shadow-md"
              aria-label="User Profile Menu"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#16A34A] flex items-center justify-center text-white font-bold text-xs shadow-inner">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
            </button>

            {/* Profile Dropdown */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E5E5] rounded-2xl shadow-xl p-2 z-50 space-y-1 animate-in fade-in duration-150">
                <div className="px-3.5 py-2.5 border-b border-[#E5E5E5] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#16A34A] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-[#111111] truncate">
                      {user?.displayName || 'Authorized User'}
                    </div>
                    <div className="text-[10px] text-[#888888] truncate">
                      {user?.email || 'operator@cycloneshield.ai'}
                    </div>
                  </div>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-[#666666] hover:text-[#111111] hover:bg-[#F8FAFC] rounded-xl font-medium"
                >
                  <Settings className="w-3.5 h-3.5 text-[#888888]" />
                  <span>Settings</span>
                </Link>

                <Link
                  to="/about"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-[#666666] hover:text-[#111111] hover:bg-[#F8FAFC] rounded-xl font-medium"
                >
                  <Info className="w-3.5 h-3.5 text-[#888888]" />
                  <span>About CycloneShield</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl text-left cursor-pointer font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-full bg-white/95 backdrop-blur-md text-[#666666] hover:text-[#111111] hover:bg-white border border-[#E5E5E5] cursor-pointer shadow-md"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto lg:hidden border border-[#E5E5E5] bg-white/98 backdrop-blur-md rounded-2xl mt-2 px-4 py-3 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="pb-1">
            <LocationSearch placeholder="Search city or location..." />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-2 ${
                      isActive
                        ? 'text-[#16A34A] bg-[#F0FDF4] font-bold border-[#BBF7D0]'
                        : 'text-[#666666] bg-[#F8FAFC] border-[#E5E5E5] hover:text-[#111111]'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
