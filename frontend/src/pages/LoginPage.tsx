import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserLocation } from '../hooks/useUserLocation';

export const LoginPage: React.FC = () => {
  const { user, signInWithGoogle, authError, clearAuthError, loading } = useAuth();
  const { triggerLocationPromptIfNeeded } = useUserLocation();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSigningIn, setIsSigningIn] = useState(false);

  const from = (location.state as any)?.from || '/dashboard';

  useEffect(() => {
    if (user && !loading) {
      triggerLocationPromptIfNeeded();
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from, triggerLocationPromptIfNeeded]);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      clearAuthError();
      await signInWithGoogle();
      triggerLocationPromptIfNeeded();
      navigate(from, { replace: true });
    } catch (err) {
      console.log("Login page signin error:", err);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-slate-950">
      {/* Top Header Link */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-xs font-medium">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Public Website</span>
        </Link>
        <span className="text-xs font-mono text-slate-500">CycloneShield AI Portal</span>
      </div>

      {/* Main White Authentication Card matching Mockup */}
      <div className="max-w-md mx-auto w-full bg-white text-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl my-auto text-center border border-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-4 shadow-inner">
          <Shield className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">CycloneShield AI</h1>
        <p className="text-xs font-semibold text-slate-500 tracking-wider mt-1">
          Disaster Intelligence Platform
        </p>

        {authError && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs text-left flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center space-x-3 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{isSigningIn ? 'Authenticating...' : 'Continue with Google'}</span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Secure authentication powered by <strong className="text-slate-600">Firebase</strong>
          </p>
        </div>
      </div>

      {/* Footer text */}
      <div className="max-w-7xl mx-auto w-full text-center text-xs text-slate-500">
        © {new Date().getFullYear()} CycloneShield AI — Disaster Intelligence Platform
      </div>
    </div>
  );
};
