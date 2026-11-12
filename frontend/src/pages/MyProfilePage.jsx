import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Edit3, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const MyProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">My Profile</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal identity, contact details, and account preferences.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/profile/edit">
            <Button variant="primary" icon={Edit3}>
              Edit Profile
            </Button>
          </Link>
          <Link to="/security-settings">
            <Button variant="outline" icon={KeyRound}>
              Security
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Profile Identity Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Decorative Banner */}
        <div className="h-32 bg-gradient-to-r from-brand-primary to-indigo-700 relative">
          <div className="absolute top-4 right-4">
            <Badge status={user?.isEmailVerified ? 'completed' : 'pending'}>
              {user?.isEmailVerified ? 'Verified Member' : 'Verification Pending'}
            </Badge>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 mb-6">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg ring-1 ring-slate-200 shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-brand-primary text-white font-extrabold text-3xl flex items-center justify-center">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                  {user?.fullName}
                </h2>
                <p className="text-xs sm:text-sm text-brand-primary font-mono font-medium">
                  @{user?.username}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                Role: {user?.role || 'User'}
              </span>
            </div>
          </div>

          {/* User Bio */}
          {user?.bio ? (
            <p className="text-sm text-slate-600 leading-relaxed mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {user.bio}
            </p>
          ) : (
            <div className="text-xs text-slate-400 italic mb-6">
              No bio added yet. Click &quot;Edit Profile&quot; to introduce yourself.
            </div>
          )}

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="p-2 rounded-lg bg-blue-50 text-brand-primary">
                <Mail className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Email Address</p>
                <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Phone className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Phone Number</p>
                <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">{user?.phoneNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2 lg:col-span-1">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Member Since</p>
                <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
