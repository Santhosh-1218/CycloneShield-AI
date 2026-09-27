import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar';
import { LocationModal } from '../location/LocationModal';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 flex flex-col font-sans">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-navy-800 border-t border-slate-800/80 py-8 px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">CYCLONE<span className="text-shield-accent">SHIELD</span> AI</span>
            <span>— Disaster Intelligence Platform (Phase 1 Prototype)</span>
          </div>
          <p>© {new Date().getFullYear()} CycloneShield AI. Built for hackathon demonstration.</p>
        </div>
      </footer>
      <LocationModal />
    </div>
  );
};
