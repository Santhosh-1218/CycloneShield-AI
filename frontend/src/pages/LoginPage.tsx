import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const LoginPage: React.FC = () => {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, authError, clearAuthError, loading } = useAuth();
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const isInitialSignUp = routeLocation.pathname.includes('signup') || routeLocation.pathname.includes('register');
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(isInitialSignUp);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (routeLocation.state as any)?.from || '/dashboard';

  useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  useEffect(() => {
    setIsSignUpMode(routeLocation.pathname.includes('signup') || routeLocation.pathname.includes('register'));
    clearAuthError();
    setFormError(null);
  }, [routeLocation.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearAuthError();

    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }
    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    if (isSignUpMode) {
      if (password.length < 6) {
        setFormError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match. Please verify your password.');
        return;
      }

      setIsSubmitting(true);
      try {
        const profile = await signUpWithEmail(email, password, name);
        if (profile) {
          navigate(from, { replace: true });
        }
      } catch (err: any) {
        setFormError(err.message || 'Failed to create account.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(true);
      try {
        const profile = await signInWithEmail(email, password);
        if (profile) {
          navigate(from, { replace: true });
        }
      } catch (err: any) {
        setFormError(err.message || 'Failed to sign in.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      clearAuthError();
      setFormError(null);
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      console.warn("Google login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeError = formError || authError;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111111] flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none">
      {/* Top Header Link */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 text-[#666666] hover:text-[#111111] transition-colors text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Weather Platform</span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-[#888888] font-mono">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span>CycloneShield AI Secure Portal</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md mx-auto w-full my-auto">
        <Card padding="lg" className="shadow-xl border-[#E5E5E5] bg-white">
          <div className="text-center mb-6">
            <img
              src="/images/logo.png"
              alt="CycloneShield AI Logo"
              className="w-12 h-12 rounded-2xl object-cover mx-auto mb-3 shadow-md border border-[#E5E5E5]"
            />

            <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
              {isSignUpMode ? 'Create Your Account' : 'Sign In to CycloneShield'}
            </h1>
            <p className="text-xs text-[#666666] mt-1">
              {isSignUpMode 
                ? 'Register for live severe-weather & disaster intelligence' 
                : 'Access real-time meteorological command center & forecasts'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-[#F1F5F9] p-1 rounded-xl mb-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setIsSignUpMode(false);
                clearAuthError();
                setFormError(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                !isSignUpMode ? 'bg-white text-[#111111] shadow-xs' : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUpMode(true);
                clearAuthError();
                setFormError(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                isSignUpMode ? 'bg-white text-[#111111] shadow-xs' : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Banner */}
          {activeError && (
            <div className="mb-4 p-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] text-xs text-left flex items-start space-x-2 animate-in fade-in duration-200">
              <ShieldAlert className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <span className="leading-snug">{activeError}</span>
            </div>
          )}

          {/* Manual Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isSignUpMode && (
              <div>
                <label className="block text-[11px] font-bold text-[#444444] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-[#888888] pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Captain Ramesh Kumar"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAFC] border border-[#E5E5E5] rounded-xl text-xs sm:text-sm text-[#111111] placeholder-[#888888] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-[#444444] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-[#888888] pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@cycloneshield.ai"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAFC] border border-[#E5E5E5] rounded-xl text-xs sm:text-sm text-[#111111] placeholder-[#888888] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-[#444444] uppercase tracking-wider">
                  Password
                </label>
                {!isSignUpMode && (
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-semibold text-[#16A34A] hover:underline"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-[#888888] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-[#E5E5E5] rounded-xl text-xs sm:text-sm text-[#111111] placeholder-[#888888] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1 text-[#888888] hover:text-[#111111] transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isSignUpMode && (
              <div>
                <label className="block text-[11px] font-bold text-[#444444] uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-[#888888] pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-[#E5E5E5] rounded-xl text-xs sm:text-sm text-[#111111] placeholder-[#888888] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 p-1 text-[#888888] hover:text-[#111111] transition-colors cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2 font-bold"
              loading={isSubmitting}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {isSignUpMode ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          {/* Social / Demo Dividers */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E5E5]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-[#888888] bg-white px-2">
              Or continue with
            </div>
          </div>

          {/* Google and Demo Quick Sign-in */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#E5E5E5] hover:bg-[#F8FAFC] text-[#111111] font-semibold text-xs flex items-center justify-center space-x-2.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
            </button>

          </div>

          <div className="mt-5 text-center text-xs text-[#666666]">
            {isSignUpMode ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUpMode(false)}
                  className="font-bold text-[#16A34A] hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUpMode(true)}
                  className="font-bold text-[#16A34A] hover:underline cursor-pointer"
                >
                  Sign Up Free
                </button>
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* Footer info */}
      <div className="max-w-md mx-auto w-full text-center text-[11px] text-[#888888] pt-4">
        Protected by CycloneShield AI Weather Intelligence Authentication
      </div>
    </div>
  );
};
