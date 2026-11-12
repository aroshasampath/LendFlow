import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Lock, Landmark, CheckCircle2, AlertCircle } from 'lucide-react';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenFromUrl = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('Password reset token is missing. Please check your reset link.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Passwords do not match. Please verify and try again.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/auth/reset-password', {
        token,
        newPassword,
        confirmNewPassword,
      });
      setSuccessMsg(res.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to reset password. The link may have expired.');
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
        <h1 className="text-2xl font-extrabold text-slate-900">Set New Password</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Choose a strong password with at least 8 characters.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-brand-danger text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!tokenFromUrl && (
          <Input
            label="Reset Token"
            name="token"
            placeholder="Paste your reset token here"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        )}

        <Input
          label="New Password"
          name="newPassword"
          type="password"
          placeholder="••••••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          icon={Lock}
          helperText="At least 8 chars with uppercase, lowercase, number, and symbol."
        />

        <Input
          label="Confirm New Password"
          name="confirmNewPassword"
          type="password"
          placeholder="••••••••••••"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
          icon={Lock}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidthOnMobile
          loading={loading}
          className="w-full mt-2"
        >
          Update Password
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100">
        <Link to="/login" className="text-xs sm:text-sm font-semibold text-brand-primary hover:underline">
          Return to login
        </Link>
      </div>
    </div>
  );
};

