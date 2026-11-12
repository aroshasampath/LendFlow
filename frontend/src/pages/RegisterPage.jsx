import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Mail, Phone, Lock, Landmark, CheckCircle2, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify and try again.');
      return;
    }

    setLoading(true);
    try {
      const response = await register(formData);
      setSuccessMsg(response?.message || 'Your account has been created successfully.');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to complete registration. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 sm:my-10 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center mx-auto shadow-md shadow-brand-primary/25">
          <Landmark className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Create your Account</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Join LendFlow to manage loans and track repayment records securely.
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
        <Input
          label="Full Name"
          name="fullName"
          placeholder="e.g. Arosha Sampath"
          value={formData.fullName}
          onChange={handleChange}
          required
          icon={User}
        />

        <Input
          label="Username"
          name="username"
          placeholder="e.g. arosha_98"
          value={formData.username}
          onChange={handleChange}
          required
          helperText="Alphanumeric characters and underscores only (3-30 chars)."
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required
          icon={Mail}
        />

        <Input
          label="Phone Number"
          name="phoneNumber"
          type="tel"
          placeholder="+94 77 123 4567"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
          icon={Phone}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••••••"
          value={formData.password}
          onChange={handleChange}
          required
          icon={Lock}
          helperText="At least 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 symbol."
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="••••••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
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
          Create Account
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100 text-xs sm:text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-primary hover:underline">
          Log in here
        </Link>
      </div>
    </div>
  );
};

