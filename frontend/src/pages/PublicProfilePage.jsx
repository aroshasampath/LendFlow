import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  User, 
  Calendar, 
  ShieldCheck, 
  ArrowLeft, 
  Coins, 
  AlertCircle,
  Lock,
  Layers
} from 'lucide-react';

export const PublicProfilePage = () => {
  const { identifier } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchPublicData = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await api.get(`/users/profile/${encodeURIComponent(identifier)}`);
        if (isMounted) setProfile(res.data.user);
      } catch (err) {
        if (isMounted) {
          setErrorMsg(err.message || 'We could not find this user profile. It may be unavailable.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPublicData();
    return () => {
      isMounted = false;
    };
  }, [identifier]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  if (errorMsg || !profile) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-brand-danger flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">User Profile Unavailable</h2>
        <p className="text-xs sm:text-sm text-slate-500">{errorMsg || 'We could not find this user profile.'}</p>
        <Link to="/users/search">
          <Button variant="primary" size="sm" icon={ArrowLeft} className="mt-2">
            Back to User Search
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/users/search"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Search Members
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-slate-900 via-brand-dark to-brand-primary" />

        <div className="p-6 sm:p-8 -mt-14 space-y-6">
          {/* Avatar and Basic Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-md ring-1 ring-slate-200 shrink-0 overflow-hidden">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.fullName}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-brand-primary text-white font-extrabold text-3xl flex items-center justify-center">
                    {profile.fullName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                  {profile.fullName}
                </h1>
                <p className="text-xs sm:text-sm text-brand-primary font-mono font-medium">
                  @{profile.username}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge status="active">Verified Member</Badge>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm text-slate-700 leading-relaxed">
              {profile.bio}
            </div>
          )}

          {/* Member Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Member since {new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" />
              <span className="font-mono text-[11px]">ID: {profile.id}</span>
            </div>
          </div>

          {/* Privacy Guarantee Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-emerald-800 text-xs flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-bold">LendFlow Privacy Guarantee</p>
              <p className="text-emerald-700 mt-0.5 leading-relaxed">
                Private contact numbers, personal email addresses, and bilateral loan records are protected under zero-leakage security protocols.
              </p>
            </div>
          </div>

          {/* Action Trigger for Stage 6 Loan Management */}
          <div className="pt-2">
            <Link to={`/loans/create?borrower=${encodeURIComponent(profile.username)}`}>
              <Button variant="primary" size="md" icon={Coins} fullWidthOnMobile>
                Propose Loan to {profile.fullName.split(' ')[0]}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
