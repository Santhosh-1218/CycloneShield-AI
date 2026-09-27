import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';

// Landing Page & Map Shell
import { LandingPage } from '../pages/LandingPage';
import { MapPage } from '../pages/MapPage';

// Auth
import { LoginPage } from '../pages/LoginPage';

// App Pages
import { AboutPage } from '../pages/AboutPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Standalone Login Page */}
      <Route path="/login" element={<LoginPage />} />

      {/* Landing Page (Hero section, live map preview, and live status indicator) */}
      <Route path="/" element={<LandingPage />} />

      {/* Operational Map Shell (Full-screen interactive map interface) */}
      <Route path="/risk-map" element={<MapPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/simulation" element={<MapPage defaultOverlay="simulation" />} />
      <Route path="/infrastructure" element={<MapPage defaultOverlay="infrastructure" />} />
      <Route path="/alerts" element={<MapPage defaultOverlay="alerts" />} />
      <Route path="/action-center" element={<MapPage defaultOverlay="alerts" />} />
      <Route path="/copilot" element={<MapPage defaultOverlay="copilot" />} />
      <Route path="/data-sources" element={<MapPage defaultOverlay="dataSources" />} />
      <Route path="/data" element={<MapPage defaultOverlay="dataSources" />} />
      <Route path="/history" element={<MapPage defaultOverlay="history" />} />
      <Route path="/settings" element={<MapPage defaultOverlay="settings" />} />
      <Route path="/dashboard" element={<Navigate to="/risk-map" replace />} />

      {/* Public Pages Layout */}
      <Route element={<PublicLayout />}>
        <Route path="/about" element={<AboutPage />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
