import React from 'react';
import { Lock, X, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPath?: string;
  customTitle?: string;
  customExplanation?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  targetPath,
  customTitle = "Login Required",
  customExplanation = "Sign in to access advanced disaster intelligence, simulations, and infrastructure analysis."
}) => {
  const navigate = useNavigate();
  const { signInWithGoogle, authError, clearAuthError } = useAuth();
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  if (!isOpen) return null;

  const handleContinueWithGoogle = async () => {
    try {
      setIsSigningIn(true);
      clearAuthError();
      await signInWithGoogle();
      onClose();
      if (targetPath) {
        navigate(targetPath);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.log("Modal login error:", err);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-2xl bg-white text-slate-900 shadow-2xl p-6 sm:p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
        </div>

        {/* Content */}
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          {customTitle}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-6 max-w-xs mx-auto">
          {customExplanation}
        </p>

        {authError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs text-left flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleContinueWithGoogle}
            disabled={isSigningIn}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center space-x-3 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSigningIn ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 text-blue-600 hover:text-blue-700 font-semibold text-xs transition-colors"
          >
            Continue exploring
          </button>
        </div>
      </div>
    </div>
  );
};
