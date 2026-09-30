import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { LoginModal } from '../auth/LoginModal';

export const PublicNavbar: React.FC = () => {
  const { user, signInWithGoogle } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [intendedRoute] = useState<string>('/dashboard');


  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.log("Sign in handle:", e);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[#0B132B] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo matching Mockup */}
            <Link to="/" className="flex items-center space-x-2.5 group">
              <img 
                src="/images/logo.png" 
                alt="CycloneShield AI" 
                className="w-8 h-8 rounded-full object-cover shadow-sm group-hover:scale-110 transition-transform" 
              />
              <span className="font-extrabold text-base tracking-tight text-white">
                CycloneShield AI
              </span>
            </Link>

            {/* Desktop Navigation Links matching Mockup */}
            <div className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-300">
              <Link
                to="/"
                className={`transition-colors hover:text-white ${location.pathname === '/' ? 'text-white font-bold' : ''}`}
              >
                Home
              </Link>
              <Link
                to="/risk-map"
                className={`transition-colors hover:text-white ${location.pathname === '/risk-map' ? 'text-white font-bold' : ''}`}
              >
                Risk Map
              </Link>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>

            {/* Desktop Google Sign-In Pill Button matching Mockup */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <Link
                  to="/dashboard"
                  className="py-2 px-5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="px-4 py-2 rounded-full bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold flex items-center space-x-2 border border-slate-200 shadow-md transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0F172A] border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Home
            </Link>

            <Link
              to="/risk-map"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Risk Map
            </Link>

            <div className="pt-3 border-t border-slate-800">
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-full bg-blue-600 text-white font-bold text-xs text-center block shadow-md"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignIn();
                  }}
                  className="w-full py-2.5 px-4 rounded-full bg-white text-slate-900 font-bold text-xs text-center flex items-center justify-center space-x-2 shadow-md"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Login Required Modal Triggered from Public Nav */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        targetPath={intendedRoute}
      />
    </>
  );
};

