import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, ShieldAlert, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword, authError, clearAuthError } = useAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearAuthError();

    if (!email.trim()) {
      setFormError('Please enter your registered email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await resetPassword(email);
      if (success) {
        setIsSubmittedSuccess(true);
      }
    } catch (err: any) {
      setFormError(err?.message || 'Failed to send password reset email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeError = formError || authError;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111111] flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none">
      {/* Top Navigation */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link 
          to="/login" 
          className="flex items-center space-x-2 text-[#666666] hover:text-[#111111] transition-colors text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-[#888888] font-mono">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span>CycloneShield AI Security Portal</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-md mx-auto w-full my-auto">
        <Card padding="lg" className="shadow-xl border-[#E5E5E5] bg-white">
          <div className="text-center mb-6">
            <img
              src="/images/logo.png"
              alt="CycloneShield AI Logo"
              className="w-12 h-12 rounded-2xl object-cover mx-auto mb-3 shadow-md border border-[#E5E5E5]"
            />

            <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-xs text-[#666666] mt-1">
              Enter your account email below to receive secure password recovery instructions.
            </p>
          </div>

          {/* Active Error Alert */}
          {activeError && (
            <div className="mb-5 p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl flex items-start gap-2.5 text-xs text-[#991B1B] animate-fadeIn">
              <ShieldAlert className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{activeError}</div>
            </div>
          )}

          {isSubmittedSuccess ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#F0FDF4] border border-[#86EFAC] text-[#16A34A] flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-[#111111]">Recovery Link Sent</h3>
                <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                  Instructions to reset your password have been dispatched to{' '}
                  <strong className="text-[#111111]">{email}</strong>.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full"
                  onClick={() => setIsSubmittedSuccess(false)}
                >
                  Resend Email
                </Button>
              </div>

              <Link
                to="/login"
                className="block text-center text-xs font-bold text-[#16A34A] hover:underline pt-2"
              >
                Return to Sign In Page
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888888]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="operator@cycloneshield.ai"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F8FAFC] border border-[#E5E5E5] rounded-xl text-xs text-[#111111] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
                className="w-full py-3 font-bold text-xs tracking-wide shadow-md"
                icon={<KeyRound className="w-4 h-4" />}
              >
                {isSubmitting ? 'Sending Recovery Link...' : 'Send Password Reset Email'}
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-[#666666] hover:text-[#111111] transition-colors"
                >
                  Remembered your password? <span className="text-[#16A34A] font-bold hover:underline">Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>

      {/* Footer Branding */}
      <div className="text-center text-[11px] text-[#888888] font-medium pt-4">
        Protected by CycloneShield AI Security Protocol
      </div>
    </div>
  );
};
