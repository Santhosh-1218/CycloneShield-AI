import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Settings,
  Info
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Risk Map', path: '/risk-map' },
    { label: 'Simulation', path: '/simulation' },
    { label: 'Infrastructure', path: '/infrastructure' },
    { label: 'Copilot', path: '/copilot' },
    { label: 'Alerts', path: '/alerts' },
    { label: 'History', path: '/history' },
    { label: 'Data Sources', path: '/data-sources' }
  ];

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E5E5] select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 shrink-0">
          <Link to="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#16A34A] flex items-center justify-center text-white shadow-xs group-hover:bg-[#15803D] transition-colors">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base text-[#111111] tracking-tight leading-tight">
                CYCLONESHIELD <span className="text-[#16A34A]">AI</span>
              </span>
              <span className="hidden sm:block text-[9px] text-[#888888] tracking-wider uppercase font-medium">
                Weather Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center space-x-1 lg:space-x-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-1.5 text-xs font-semibold rounded-md transition-all relative ${
                  isActive
                    ? 'text-[#111111] font-bold after:absolute after:bottom-[-20px] after:left-2 after:right-2 after:h-[2px] after:bg-[#16A34A] after:rounded-full'
                    : 'text-[#666666] hover:text-[#111111] hover:bg-[#F8FAFC]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Medium Screen Compact Nav */}
        <nav className="hidden md:flex xl:hidden items-center space-x-1">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-2.5 py-1 text-xs font-semibold rounded-md transition-all relative ${
                  isActive
                    ? 'text-[#16A34A] font-bold bg-[#F0FDF4] border border-[#BBF7D0]'
                    : 'text-[#666666] hover:text-[#111111] hover:bg-[#F8FAFC]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Section: Location Badge, Search, Alerts, Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Active Location Indicator (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-[#111111] bg-white border border-[#E5E5E5] px-2.5 py-1.5 rounded-lg max-w-[180px] shadow-xs truncate" title={`${location?.city || 'Kakinada'}, ${location?.state || 'Andhra Pradesh'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] shrink-0" />
            <span className="truncate text-xs font-semibold">{location?.city || 'Kakinada'}</span>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setUserDropdownOpen(false);
              }}
              aria-label="Alerts & Notifications"
              className="p-2 rounded-lg text-[#666666] hover:text-[#111111] hover:bg-[#F8FAFC] border border-[#E5E5E5] relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#16A34A]" />
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E5E5] rounded-xl shadow-lg p-3 z-50 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
                  <span className="text-xs font-bold text-[#111111]">Active Alerts & Notifications</span>
                  <Link to="/alerts" onClick={() => setNotificationsOpen(false)} className="text-[11px] font-semibold text-[#16A34A] hover:underline">
                    View All
                  </Link>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg">
                    <div className="font-bold text-[#15803D] flex items-center justify-between">
                      <span>Global Satellite Feed</span>
                      <span className="text-[10px] font-normal text-[#16A34A]">Live</span>
                    </div>
                    <p className="text-[11px] text-[#666666] mt-0.5">
                      GDACS & Open-Meteo spatial streams active.
                    </p>
                  </div>
                  <div className="p-2.5 bg-[#F8FAFC] border border-[#E5E5E5] rounded-lg">
                    <div className="font-bold text-[#111111]">Location Monitoring</div>
                    <p className="text-[11px] text-[#666666] mt-0.5">
                      Monitoring {location?.city || 'Kakinada'}, {location?.state || 'Andhra Pradesh'}.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setUserDropdownOpen(!userDropdownOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center space-x-2 p-1 rounded-lg border border-[#E5E5E5] hover:bg-[#F8FAFC] cursor-pointer"
              aria-label="User Profile Menu"
            >
              <div className="w-7 h-7 rounded-md bg-[#16A34A] flex items-center justify-center text-white font-bold text-xs">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <span className="hidden sm:block text-xs font-semibold text-[#111111] pr-1 max-w-[100px] truncate">
                {user?.displayName || 'Operator'}
              </span>
            </button>

            {/* Profile Dropdown */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E5E5E5] rounded-xl shadow-lg p-2 z-50 space-y-1 animate-in fade-in duration-150">
                <div className="px-3 py-2 border-b border-[#E5E5E5]">
                  <div className="font-bold text-xs text-[#111111] truncate">
                    {user?.displayName || 'Authorized User'}
                  </div>
                  <div className="text-[11px] text-[#888888] truncate">
                    {user?.email || 'operator@cycloneshield.ai'}
                  </div>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-[#666666] hover:text-[#111111] hover:bg-[#F8FAFC] rounded-lg"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </Link>

                <Link
                  to="/about"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-[#666666] hover:text-[#111111] hover:bg-[#F8FAFC] rounded-lg"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>About CycloneShield</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg text-left cursor-pointer"
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
            className="xl:hidden p-2 rounded-lg text-[#666666] hover:text-[#111111] hover:bg-[#F8FAFC] border border-[#E5E5E5] cursor-pointer"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#E5E5E5] bg-white px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="pb-2">
            <LocationSearch placeholder="Search city or location..." />
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center ${
                    isActive
                      ? 'text-[#16A34A] bg-[#F0FDF4] font-bold border border-[#BBF7D0]'
                      : 'text-[#666666] hover:text-[#111111] hover:bg-[#F8FAFC]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
