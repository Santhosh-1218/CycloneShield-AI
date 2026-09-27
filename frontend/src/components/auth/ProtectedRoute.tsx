import React, { useState } from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoginModal } from './LoginModal';
import { Shield } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [modalDismissed, setModalDismissed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center text-slate-300">
        <div className="w-12 h-12 rounded-full border-2 border-shield-blue border-t-transparent animate-spin mb-4" />
        <div className="flex items-center space-x-2 text-sm font-mono text-slate-400">
          <Shield className="w-4 h-4 text-shield-accent" />
          <span>Verifying Security Credentials...</span>
        </div>
      </div>
    );
  }

  if (user) {
    return <Outlet />;
  }

  if (modalDismissed) {
    // Unauthenticated user closed the modal on a direct protected route entry
    return <Navigate to="/risk-map" replace />;
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <LoginModal
        isOpen={!modalDismissed}
        onClose={() => setModalDismissed(true)}
        targetPath={location.pathname}
        customTitle="Authentication Required"
        customExplanation={`The feature "${location.pathname}" requires an authenticated CycloneShield AI account.`}
      />
    </div>
  );
};
