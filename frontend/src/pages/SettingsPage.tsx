import React, { useState } from 'react';
import { User, Sliders, Bell, ShieldCheck, LogOut, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [language, setLanguage] = useState('English');
  const [mapLayer, setMapLayer] = useState('Risk Level');
  const [autoRefresh, setAutoRefresh] = useState('15 mins');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [savedMsg, setSavedMsg] = useState('');

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const handleSave = () => {
    setSavedMsg('Preferences saved successfully.');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-800">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-xs text-slate-500">Manage your account and preferences</p>
      </div>

      {savedMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Account Section matching Mockup */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <User className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Account</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-500 font-medium block mb-1">Name</label>
            <input
              type="text"
              readOnly
              value={user?.displayName || 'Chief'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-500 font-medium block mb-1">Role</label>
            <input
              type="text"
              readOnly
              value="Chief - Disaster Management"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-500 font-medium block mb-1">Email</label>
            <input
              type="text"
              readOnly
              value={user?.email || 'chief@example.com'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-500 font-medium block mb-1">Region</label>
            <input
              type="text"
              readOnly
              value="Coastal Andhra Pradesh"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 pt-2 flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-700 font-medium">Google Account</span>
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                Connected
              </span>
              <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Manage</button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Section matching Mockup */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <Sliders className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Preferences</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-500 font-medium block mb-1">Default Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="English">English</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-500 font-medium block mb-1">Default Map Layer</label>
            <select
              value={mapLayer}
              onChange={(e) => setMapLayer(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="Risk Level">Risk Level</option>
              <option value="Rainfall">Rainfall Heatmap</option>
              <option value="Wind Speed">Wind Speed Vector</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-slate-500 font-medium block mb-1">Map Auto-Refresh</label>
            <select
              value={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="5 mins">5 mins</option>
              <option value="15 mins">15 mins</option>
              <option value="30 mins">30 mins</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
        >
          Save Preferences
        </button>
      </div>

      {/* Notifications Section matching Mockup */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <Bell className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Notifications</h2>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-700 font-medium">Email alerts</span>
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={(e) => setEmailAlerts(e.target.checked)}
            className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Security Section matching Mockup */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-5 h-5 text-red-500" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Security</h2>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Sign out of active session</span>
          <button
            onClick={handleSignOut}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

