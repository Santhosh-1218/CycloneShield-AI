import React, { useState } from 'react';
import { Settings, X, LogOut, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SettingsOverlayPanelProps {
  onClose: () => void;
}

export const SettingsOverlayPanel: React.FC<SettingsOverlayPanelProps> = ({ onClose }) => {
  const { user, logout } = useAuth();

  const [language, setLanguage] = useState('English');
  const [mapLayer, setMapLayer] = useState('Risk Level');
  const [autoRefresh, setAutoRefresh] = useState('15 mins');
  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = () => {
    setSavedMsg('Preferences saved.');
    setTimeout(() => setSavedMsg(''), 2500);
  };

  return (
    <div className="w-96 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-slate-100 flex flex-col space-y-4 z-40 select-none max-h-[85vh] overflow-y-auto">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>Platform Settings</span>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {savedMsg && (
        <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Account Info */}
      <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
        <span className="text-slate-400 block text-[10px] uppercase font-mono">Operator</span>
        <div className="font-bold text-white">{user?.displayName || 'Chief - Disaster Management'}</div>
        <div className="text-[11px] text-slate-400">{user?.email || 'chief@cycloneshield.ai'}</div>
      </div>

      {/* Preferences */}
      <div className="space-y-3 text-xs">
        <div>
          <label className="text-slate-400 block mb-1 font-mono">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="English">English</option>
            <option value="Telugu">Telugu (తెలుగు)</option>
            <option value="Hindi">Hindi (हिंदी)</option>
          </select>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-mono">Default Layer</label>
          <select
            value={mapLayer}
            onChange={(e) => setMapLayer(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="Risk Level">Risk Level Overlay</option>
            <option value="Rainfall">Rainfall Accumulation</option>
            <option value="Wind Speed">Wind Vector Speed</option>
          </select>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-mono">Telemetry Auto-Refresh</label>
          <select
            value={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="5 mins">5 mins</option>
            <option value="15 mins">15 mins</option>
            <option value="30 mins">30 mins</option>
          </select>
        </div>
      </div>

      <div className="pt-2 flex items-center space-x-2">
        <button
          onClick={handleSave}
          className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all"
        >
          Save
        </button>

        {user && (
          <button
            onClick={() => logout()}
            className="py-2 px-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold text-xs transition-all flex items-center space-x-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );
};
