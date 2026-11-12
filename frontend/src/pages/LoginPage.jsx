import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Landmark, Mail, Lock, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, validateMfaLogin } = useAuth();

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // MFA Challenge State
  const [mfaRequired, setMfaRequired] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const redirectPath = location.state?.from?.pathname || '/';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await login(loginIdentifier, password);
      if (response?.mfaRequired) {
        setMfaRequired(true);
        setTempToken(response.tempToken);
        setSuccessMsg(response.message || 'Please enter your 6-digit authenticator code.');
      } else {
        setSuccessMsg('You have logged in successfully.');
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 800);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Email or password is incorrect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await validateMfaLogin(tempToken, totpCode);
      setSuccessMsg('Two-factor verification confirmed.');
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 800);
    } catch (err) {
      setErrorMsg(err.message || 'The verification code you entered is invalid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-12 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center mx-auto shadow-md shadow-brand-primary/25">
          <Landmark className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          {mfaRequired ? 'Two-Factor Verification' : 'Welcome Back'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {mfaRequired
            ? 'Open your authenticator app (Google Authenticator) and enter the 6-digit code.'
            : 'Log in to track shared expenses and debts.'}
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

      {!mfaRequired ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <Input
            label="Email or Username"
            name="loginIdentifier"
            placeholder="you@example.com or username"
            value={loginIdentifier}
            onChange={(e) => {
              setLoginIdentifier(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            required
            icon={Mail}
          />

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-brand-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              name="password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              required
              icon={Lock}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidthOnMobile
            loading={loading}
            className="w-full mt-2"
          >
            Log In
          </Button>
        </form>
      ) : (
        <form onSubmit={handleMfaSubmit} className="space-y-4">
          <Input
            label="6-Digit Authenticator Code"
            name="totpCode"
            type="text"
            maxLength={6}
            placeholder="e.g. 123456"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
            required
            icon={ShieldCheck}
            helperText="Enter the dynamic code shown in your mobile authenticator app."
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidthOnMobile
            loading={loading}
            className="w-full mt-2"
          >
            Verify & Continue
          </Button>

          <button
            type="button"
            onClick={() => {
              setMfaRequired(false);
              setTempToken('');
              setTotpCode('');
            }}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-800 transition py-2"
          >
            &larr; Back to standard login
          </button>
        </form>
      )}

      <div className="text-center pt-2 border-t border-slate-100 text-xs sm:text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-brand-primary hover:underline">
          Register now
        </Link>
      </div>
    </div>
  );
};

