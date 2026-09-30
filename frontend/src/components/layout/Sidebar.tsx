import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  CloudSun, 
  Map, 
  CalendarDays, 
  AlertTriangle, 
  Wind, 
  ShieldAlert, 
  ChevronDown, 
  Layers, 
  Satellite, 
  Building2, 
  Bot, 
  Zap, 
  Sliders, 
  History as HistoryIcon, 
  FileText, 
  Database, 
  Settings as SettingsIcon, 
  Info,
  LogOut,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(true);

  const mainNavItems = [
    { name: 'Weather', path: '/dashboard', icon: CloudSun },
    { name: 'Map', path: '/map', icon: Map },
    { name: 'Forecast', path: '/forecast', icon: CalendarDays },
    { name: 'Alerts', path: '/alerts', icon: AlertTriangle },
    { name: 'Cyclones', path: '/cyclones', icon: Wind },
    { name: 'Risk', path: '/risk', icon: ShieldAlert },
  ];

  const moreNavItems = [
    { name: 'Flood', path: '/flood', icon: Layers },
    { name: 'Satellite', path: '/satellite', icon: Satellite },
    { name: 'Infrastructure', path: '/infrastructure', icon: Building2 },
    { name: 'AI Copilot', path: '/copilot', icon: Bot },
    { name: 'Action Center', path: '/action-center', icon: Zap },
    { name: 'Simulation', path: '/simulation', icon: Sliders },
    { name: 'History', path: '/history', icon: HistoryIcon },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Data Sources', path: '/data-sources', icon: Database },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
    { name: 'About', path: '/about', icon: Info },
  ];

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const content = (
    <div className="h-full flex flex-col justify-between bg-white border-r border-[#E5E5E5] text-[#111111] w-64 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-5 flex items-center border-b border-[#E5E5E5]">
          <NavLink to="/" className="flex items-center space-x-3 group">
            <img
              src="/images/logo.png"
              alt="CycloneShield AI"
              className="w-8 h-8 rounded-lg object-cover shadow-xs border border-[#E5E5E5]"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-[#111111]">
                CycloneShield AI
              </span>
              <span className="text-[10px] text-[#888888] font-medium -mt-0.5">Weather Intelligence</span>
            </div>
          </NavLink>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
          <div className="text-[10px] font-bold text-[#888888] px-3 py-1 uppercase tracking-wider">
            Main
          </div>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer
                  ${isActive 
                    ? 'bg-[#F0FDF4] text-[#16A34A] font-bold border border-[#BBF7D0]' 
                    : 'text-[#666666] hover:text-[#111111] hover:bg-[#F8FAFC] border border-transparent'}
                `}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
              </NavLink>
            );
          })}

          {/* More Submenu */}
          <div className="pt-2">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold text-[#888888] uppercase tracking-wider hover:text-[#111111] transition-colors cursor-pointer"
            >
              <span>More Features</span>
              {moreOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>

            {moreOpen && (
              <div className="mt-1 space-y-0.5 pl-1">
                {moreNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen && setMobileOpen(false)}
                      className={({ isActive }) => `
                        flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer
                        ${isActive 
                          ? 'bg-[#F0FDF4] text-[#16A34A] font-bold' 
                          : 'text-[#666666] hover:text-[#111111] hover:bg-[#F8FAFC]'}
                      `}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0 text-[#888888]" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-[#E5E5E5] bg-[#FAF8FA]/50">
        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E5E5E5] mb-2 shadow-xs">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-[#16A34A] flex items-center justify-center text-white font-bold text-xs shrink-0">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
            </div>
            <div className="overflow-hidden text-xs">
              <div className="font-semibold text-[#111111] truncate">{user?.displayName || 'Chief Analyst'}</div>
              <div className="text-[10px] text-[#888888] truncate">Disaster Management</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-[#FEF2F2] text-[#666666] hover:text-[#DC2626] hover:border-[#FCA5A5] text-xs font-medium flex items-center justify-center space-x-2 border border-[#E5E5E5] transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block h-screen sticky top-0 shrink-0 z-30">
        {content}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-xs h-full bg-white">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
