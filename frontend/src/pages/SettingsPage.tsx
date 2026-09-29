import React, { useState } from 'react';
import { User, Sliders, LogOut, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from '../context/LocationContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { location } = useLocation();
  const navigate = useNavigate();

  const [language, setLanguage] = useState('English');
  const [mapLayer, setMapLayer] = useState('Wind Vector');
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
    <div className="max-w-4xl mx-auto space-y-6 text-[#111111]">
      <div className="flex items-center justify-between bg-white p-5 border border-[#E5E5E5] rounded-xl shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#111111]">Settings & Preferences</h1>
          <p className="text-xs text-[#666666] mt-0.5">Manage user session, map parameters, and alert notifications</p>
        </div>
      </div>

      {savedMsg && (
        <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Account Section */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E5E5E5]">
          <User className="w-5 h-5 text-[#16A34A]" />
          <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider">User Account Profile</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-[#666666] font-semibold block mb-1">User Name</label>
            <input
              type="text"
              readOnly
              value={user?.displayName || 'Chief Operational Officer'}
              className="w-full bg-[#F8FAFC] border border-[#E5E5E5] rounded-xl px-3.5 py-2 text-[#111111] font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#666666] font-semibold block mb-1">Role & Authority</label>
            <input
              type="text"
              readOnly
              value="Disaster Management Operational Analyst"
              className="w-full bg-[#F8FAFC] border border-[#E5E5E5] rounded-xl px-3.5 py-2 text-[#111111] font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#666666] font-semibold block mb-1">Authenticated Email</label>
            <input
              type="text"
              readOnly
              value={user?.email || 'chief@cycloneshield.ai'}
              className="w-full bg-[#F8FAFC] border border-[#E5E5E5] rounded-xl px-3.5 py-2 text-[#111111] font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#666666] font-semibold block mb-1">Active Sector Location</label>
            <input
              type="text"
              readOnly
              value={`${location.city}, ${location.state}`}
              className="w-full bg-[#F8FAFC] border border-[#E5E5E5] rounded-xl px-3.5 py-2 text-[#111111] font-bold focus:outline-none"
            />
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E5E5E5]">
          <Sliders className="w-5 h-5 text-[#16A34A]" />
          <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider">Platform Preferences</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-[#666666] font-semibold block mb-1">Default Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2 text-[#111111]"
            >
              <option value="English">English</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
            </select>
          </div>

          <div>
            <label className="text-[#666666] font-semibold block mb-1">Default Weather Layer</label>
            <select
              value={mapLayer}
              onChange={(e) => setMapLayer(e.target.value)}
              className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2 text-[#111111]"
            >
              <option value="Wind Vector">Wind Vector Component</option>
              <option value="Rainfall">Rainfall Accumulation Heatmap</option>
              <option value="Satellite SAR">Satellite SAR Inundation</option>
            </select>
          </div>
        </div>

        <Button variant="primary" size="sm" onClick={handleSave} className="mt-2">
          Save Preferences
        </Button>
      </Card>

      {/* Security */}
      <Card padding="lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#111111]">Active Session</h2>
            <p className="text-xs text-[#666666]">Firebase Authentication Token Session</p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={handleSignOut}
            icon={<LogOut className="w-4 h-4" />}
          >
            Sign Out Session
          </Button>
        </div>
      </Card>
    </div>
  );
};
