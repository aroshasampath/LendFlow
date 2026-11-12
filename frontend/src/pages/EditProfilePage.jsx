import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { User, Phone, Image, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sample avatar presets
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.put('/users/me', formData);
      setSuccessMsg(res.message || 'Your profile has been updated successfully.');
      updateUser(res.data.user);
      setTimeout(() => {
        navigate('/profile');
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to update profile. Please check the details you entered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Breadcrumbs
        items={[
          { label: 'My Profile', path: '/profile' },
          { label: 'Edit Profile' },
        ]}
      />

      <div className="flex items-center gap-3">
        <Link
          to="/profile"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white transition border border-slate-200"
          aria-label="Back to Profile"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Edit Profile</h1>
          <p className="text-xs sm:text-sm text-slate-500">Update your name, contact phone, avatar, and bio.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full Name"
            name="fullName"
            placeholder="Your name"
            value={formData.fullName}
            onChange={handleChange}
            required
            icon={User}
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

          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700">Bio / About Me</label>
            <textarea
              name="bio"
              rows={3}
              maxLength={500}
              placeholder="Tell other lenders or borrowers about your lending interests or business..."
              value={formData.bio}
              onChange={handleChange}
              className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-brand-primary placeholder:text-slate-400 text-slate-900"
            />
            <p className="text-right text-[11px] text-slate-400">{formData.bio.length} / 500 characters</p>
          </div>

          <div className="space-y-3">
            <Input
              label="Avatar Image URL (Optional)"
              name="avatar"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={formData.avatar}
              onChange={handleChange}
              icon={Image}
            />

            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">Or choose a preset profile picture:</p>
              <div className="flex gap-3">
                {avatarPresets.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar: preset })}
                    className={`w-12 h-12 rounded-xl overflow-hidden ring-2 transition-all ${
                      formData.avatar === preset ? 'ring-brand-primary scale-105' : 'ring-transparent hover:ring-slate-300'
                    }`}
                  >
                    <img src={preset} alt={`Preset ${index}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100">
            <Button type="submit" variant="primary" loading={loading} fullWidthOnMobile>
              Save Profile Changes
            </Button>
            <Button
              type="button"
              variant="secondary"
              fullWidthOnMobile
              onClick={() => navigate('/profile')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

