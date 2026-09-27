import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Map, 
  Sliders, 
  Building2, 
  Bot, 
  Bell, 
  Database, 
  History, 
  Settings, 
  LogOut, 
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Risk Map', path: '/risk-map', icon: Map },
    { name: 'Simulation', path: '/simulation', icon: Sliders },
    { name: 'Infrastructure', path: '/infrastructure', icon: Building2 },
    { name: 'Gemini Copilot', path: '/copilot', icon: Bot },
    { name: 'Alerts & Action Center', path: '/alerts', icon: Bell },
    { name: 'Data Sources', path: '/data-sources', icon: Database },
    { name: 'History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const content = (
    <div className="h-full flex flex-col justify-between bg-[#0F172A] border-r border-slate-800/80 text-slate-300 w-64 select-none">
      {/* Top Brand Header */}
      <div>
        <div className="h-16 px-5 flex items-center border-b border-slate-800/80">
          <NavLink to="/risk-map" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-900/40">
              <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-white">
                CycloneShield AI
              </span>
            </div>
          </NavLink>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-sm font-bold' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom User Profile & Logout Section */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0B132B]/50">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 mb-2">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="overflow-hidden text-xs">
              <div className="font-semibold text-white truncate">{user?.displayName || 'Chief'}</div>
              <div className="text-[10px] text-slate-400 truncate">Disaster Management</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-red-500/10 hover:border-red-500/30 text-slate-300 hover:text-red-400 text-xs font-semibold flex items-center justify-center space-x-2 border border-slate-700 transition-all"
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
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-xs h-full bg-[#0F172A]">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

