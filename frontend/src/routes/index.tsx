import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';

import { LandingPage } from '../pages/LandingPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ForecastPage } from '../pages/ForecastPage';
import { AlertsPage } from '../pages/AlertsPage';
import { CyclonesPage } from '../pages/CyclonesPage';
import { RiskPage } from '../pages/RiskPage';
import { FloodPage } from '../pages/FloodPage';
import { SatellitePage } from '../pages/SatellitePage';
import { InfrastructurePage } from '../pages/InfrastructurePage';
import { CopilotPage } from '../pages/CopilotPage';
import { ActionCenterPage } from '../pages/ActionCenterPage';
import { SimulationPage } from '../pages/SimulationPage';
import { HistoryPage } from '../pages/HistoryPage';
import { ReportsPage } from '../pages/ReportsPage';
import { DataSourcesPage } from '../pages/DataSourcesPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AboutPage } from '../pages/AboutPage';
import { LoginPage } from '../pages/LoginPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Standalone Authentication Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<LoginPage />} />
      <Route path="/register" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Main Application Layout Shell */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/map" element={<DashboardPage />} />
        <Route path="/risk-map" element={<RiskPage />} />
        <Route path="/risk" element={<RiskPage />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="/infrastructure" element={<InfrastructurePage />} />
        <Route path="/copilot" element={<CopilotPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/action-center" element={<ActionCenterPage />} />
        <Route path="/forecast" element={<ForecastPage />} />
        <Route path="/cyclones" element={<CyclonesPage />} />
        <Route path="/flood" element={<FloodPage />} />
        <Route path="/satellite" element={<SatellitePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/data-sources" element={<DataSourcesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
