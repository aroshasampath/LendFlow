import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, Landmark, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [devToken, setDevToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccessMsg(res.message);
      if (res._devPasswordResetToken) {
        setDevToken(res._devPasswordResetToken);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Unable to request password reset. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-14 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center mx-auto shadow-md shadow-brand-primary/25">
          <Landmark className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Reset your Password</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Enter your registered email address and we&apos;ll send you a secure password reset link.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-brand-danger text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm space-y-2">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>

          {devToken && (
            <div className="pt-2 border-t border-emerald-200">
              <p className="font-semibold text-xs text-emerald-800">Development Direct Link:</p>
              <Link
                to={`/reset-password?token=${devToken}`}
                className="text-xs text-brand-primary font-mono underline break-all block mt-1"
              >
                Click here to reset password with generated token
              </Link>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Registered Email Address"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          icon={Mail}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidthOnMobile
          loading={loading}
          className="w-full mt-2"
        >
          Send Reset Instructions
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </div>
    </div>
  );
};

