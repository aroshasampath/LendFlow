import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Server, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Clock,
  Layers
} from 'lucide-react';
import { fetchSystemHealth } from '../services/api';

export const HomePage = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const loadHealth = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await fetchSystemHealth();
      setHealthData(data);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to connect to the backend server.');
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-dark to-slate-900 text-white rounded-2xl p-6 sm:p-10 shadow-xl shadow-brand-dark/10 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/20 text-brand-primaryLight border border-brand-primary/30 text-xs font-semibold tracking-wide uppercase">
            <Layers className="w-3.5 h-3.5" />
            Stage 2: Project Architecture Established
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Next-Generation Multi-User <span className="text-brand-primaryLight">Loan Management</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed">
            LendFlow enables peers and businesses to track bilateral lending, manage repayment schedules, enforce financial audit trails, and visualize balances across mobile, tablet, and desktop devices.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={loadHealth}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary text-white font-medium text-sm hover:bg-brand-primaryHover transition-all shadow-md shadow-brand-primary/25 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Verify Backend Health
            </button>
            <a
              href="#architecture"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-all border border-white/10"
            >
              Explore Architecture
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* System Health Status Card */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-brand-primary" />
              Live System Connectivity
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Real-time communication between React frontend, Express API, and MongoDB Atlas.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated: {lastRefreshed.toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          {/* Service Status */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
            <div className={`p-2.5 rounded-xl ${healthData?.status === 'healthy' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {healthData?.status === 'healthy' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Express Service</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">
                {loading ? 'Checking...' : healthData?.status === 'healthy' ? 'Healthy (Port 5000)' : 'Unavailable'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {healthData?.environment ? `Env: ${healthData.environment}` : 'Connecting to local backend'}
              </p>
            </div>
          </div>

          {/* Database Status */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">MongoDB Atlas</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">
                {loading ? 'Verifying...' : healthData?.database?.status === 'connected' ? 'Connected' : 'Offline'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Database: <span className="font-semibold text-brand-primary">{healthData?.database?.target || 'lendflow'}</span>
              </p>
            </div>
          </div>

          {/* Security Status */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-100 text-brand-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Security Controls</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">Helmet & CORS Active</p>
              <p className="text-xs text-slate-500 mt-1">Error Shielding Enabled</p>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </section>

      {/* Feature Pillar Highlights */}
      <section id="architecture" className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Application Architecture Highlights</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-brand-primary/50 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-brand-primary flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Dual-Role Workflows</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Users can seamlessly act as both lender and borrower with complete separation of authorization records.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-brand-primary/50 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Financial Integrity</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Eliminates floating-point calculation errors through integer minor units and strict audit trails.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-brand-primary/50 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Mobile-First UI/UX</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Designed from 320px mobile screens up to 1440px wide desktop displays without content clipping.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-brand-primary/50 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              04
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">STRIDE Hardened</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Built to withstand IDOR, NoSQL injection, brute force attacks, and token replay vulnerabilities.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

