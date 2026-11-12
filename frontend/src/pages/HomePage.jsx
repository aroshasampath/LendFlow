import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton, SkeletonCard } from '../components/ui/Skeleton';
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  CreditCard, 
  Plus, 
  Search, 
  ArrowRight,
  ShieldCheck, 
  Clock, 
  Layers,
  Sparkles,
  UserCheck,
  Check
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeChartTab, setActiveChartTab] = useState('trends'); // 'trends' | 'repayments'

  const fetchSummary = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get('/dashboard/summary');
      setDashboardData(res.data);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to load dashboard details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSummary();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // UN-AUTHENTICATED LANDING PAGE
  if (!isAuthenticated) {
    return (
      <div className="space-y-12 py-4">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-brand-dark via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/20 text-brand-primaryLight border border-brand-primary/30 text-xs font-semibold tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              LendFlow Personal Loans
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Simple, Safe & Transparent <span className="text-brand-primaryLight">Peer-to-Peer</span> Loan Tracking
            </h1>

            <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed">
              Track money you lend to friends or borrow from family with clear terms, automated payment reminders, and exact zero-error calculations.
            </p>

            <div className="pt-3 flex flex-wrap gap-3.5">
              <Link to="/register">
                <Button variant="primary" size="lg" icon={Plus}>
                  Get Started Free
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Core Pillars */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center font-bold">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Lend & Borrow</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Easily manage money you lend out and money you owe with separate, crystal-clear records.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Accurate to the Cent</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Stores all financial values in exact cents, completely preventing rounding and balance errors.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Verified Repayments</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Borrowers record payments and lenders confirm them, keeping both sides in complete agreement.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Easy on Any Device</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Designed from the ground up for phones, tablets, and desktop screens with friendly touch controls.
            </p>
          </div>
        </section>
      </div>
    );
  }

  // SKELETON LOADING STATE
  if (loading && !dashboardData) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-60" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 h-64 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  // AUTHENTICATED DASHBOARD VIEW
  const cards = dashboardData?.cards || {};
  const charts = dashboardData?.charts?.trends || [];
  const overdueLoans = dashboardData?.overdueLoans || [];
  const upcomingLoans = dashboardData?.upcomingDueLoans || [];
  const recentLoans = dashboardData?.recentActivity?.loans || [];
  const recentRepayments = dashboardData?.recentActivity?.repayments || [];

  // Determine if there is any loan/repayment activity yet
  const hasActivity = 
    (cards.totalLent || 0) > 0 || 
    (cards.totalBorrowed || 0) > 0 || 
    (cards.activeLoans || 0) > 0 || 
    recentLoans.length > 0 || 
    recentRepayments.length > 0;

  // Check if charts have non-zero historical points
  const hasChartData = charts.some(c => (c.lent || 0) > 0 || (c.borrowed || 0) > 0 || (c.repaid || 0) > 0);

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back, {user?.fullName?.split(' ')[0] || user?.username}!
            <span className="text-xl sm:text-2xl">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track money you've lent, money you owe, and upcoming payments easily.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link to="/loans/create">
            <Button variant="primary" icon={Plus}>
              Propose a Loan
            </Button>
          </Link>
          <Link to="/repayments">
            <Button variant="secondary" icon={CreditCard}>
              Repayments
            </Button>
          </Link>
          <Link to="/users/search">
            <Button variant="outline" icon={Search}>
              Find Members
            </Button>
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-brand-danger text-xs sm:text-sm flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Urgent Overdue Loans Alert Banner (if any) */}
      {overdueLoans.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-700">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Attention: You have {overdueLoans.length} loan payment(s) past due date!</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {overdueLoans.map((ov) => (
              <div
                key={ov._id}
                className="p-3 bg-white rounded-xl border border-rose-100 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">{ov.description}</p>
                  <p className="text-slate-500 mt-0.5">
                    Remaining: <span className="font-bold text-rose-600">{ov.currency} {(ov.remainingBalance / 100).toFixed(2)}</span>
                  </p>
                </div>
                <Link to={`/loans/${ov._id}`}>
                  <Button variant="danger" size="sm" className="text-xs py-1">
                    Resolve
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3 Main Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Money You Lent (To Collect) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Money You Lent
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Coins className="w-5 h-5" />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500">To Collect / Receive</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                ${((cards.outstandingLent || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Total lent: <span className="font-semibold text-slate-600">${((cards.totalLent || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link 
                to="/loans?role=lender" 
                className="font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 hover:underline"
              >
                View Lent Loans
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2: Money You Borrowed (To Pay Back) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-50 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-amber-50 text-amber-700 border border-amber-100">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Money You Owe
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500">To Pay Back</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                ${((cards.outstandingBorrowed || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Total borrowed: <span className="font-semibold text-slate-600">${((cards.totalBorrowed || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link 
                to="/loans?role=borrower" 
                className="font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 hover:underline"
              >
                View Borrowed Loans
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 3: Loan Status & Overview */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-50 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-blue-50 text-brand-primary border border-blue-100">
                <Layers className="w-3.5 h-3.5" />
                Loans Summary
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Active</span>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{cards.activeLoans || 0}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Completed</span>
                <p className="text-2xl font-black text-emerald-700 mt-0.5">{cards.completedLoans || 0}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              {overdueLoans.length > 0 ? (
                <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {overdueLoans.length} Overdue
                </span>
              ) : (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  All on track
                </span>
              )}
              <Link 
                to="/loans" 
                className="font-bold text-brand-primary hover:text-brand-primaryDark inline-flex items-center gap-1 hover:underline"
              >
                Manage All Loans
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SMART SECTION: Show Getting Started Guide if No Activity, or Unified Analytics if Activity Exists */}
      {!hasActivity ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 text-brand-primary text-xs font-bold uppercase tracking-wide mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Quick Start
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Get Started with LendFlow in 3 Simple Steps
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Keep track of personal debts and loans without any complicated spreadsheets or awkward reminders.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-brand-primary/40 hover:bg-white transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-brand-primary flex items-center justify-center font-bold">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">1. Propose a Loan</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Lend money to a friend with clear due dates, return terms, and 0% or custom interest.
                </p>
              </div>
              <div className="pt-1">
                <Link to="/loans/create">
                  <Button variant="primary" size="sm" className="text-xs">
                    + Propose Loan
                  </Button>
                </Link>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-emerald-500/40 hover:bg-white transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">2. Find Friends</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Search registered members by their username or name to quickly send or review loan requests.
                </p>
              </div>
              <div className="pt-1">
                <Link to="/users/search">
                  <Button variant="outline" size="sm" className="text-xs">
                    Search Members
                  </Button>
                </Link>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-indigo-500/40 hover:bg-white transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">3. Record Repayments</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Record payments when installments are made. Both parties confirm for complete clarity.
                </p>
              </div>
              <div className="pt-1">
                <Link to="/repayments">
                  <Button variant="secondary" size="sm" className="text-xs">
                    View Repayments
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : hasChartData ? (
        /* Unified, Streamlined Analytics Card */
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Monthly Activity Overview</h3>
              <p className="text-xs text-slate-500">6-Month lending, borrowing, and repayment flow</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveChartTab('trends')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeChartTab === 'trends'
                    ? 'bg-white text-brand-primary shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lent vs Borrowed
              </button>
              <button
                type="button"
                onClick={() => setActiveChartTab('repayments')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeChartTab === 'repayments'
                    ? 'bg-white text-emerald-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Repayments Received
              </button>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {activeChartTab === 'trends' ? (
                <AreaChart data={charts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3157D5" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3157D5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBorrowed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A36A" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#16A36A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#17233C', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val) => [`$${Number(val).toFixed(2)}`]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="lent" name="Lent ($)" stroke="#3157D5" strokeWidth={2} fillOpacity={1} fill="url(#colorLent)" />
                  <Area type="monotone" dataKey="borrowed" name="Borrowed ($)" stroke="#16A36A" strokeWidth={2} fillOpacity={1} fill="url(#colorBorrowed)" />
                </AreaChart>
              ) : (
                <BarChart data={charts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#17233C', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val) => [`$${Number(val).toFixed(2)}`, 'Repaid']}
                  />
                  <Bar dataKey="repaid" name="Confirmed Repayments ($)" fill="#16A36A" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {/* Upcoming Due Dates & Recent Activity (Neat Responsive Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Due Dates (1 col on desktop) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-primary" />
              Upcoming Payments Due
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{upcomingLoans.length}</span>
          </div>

          <div className="space-y-3">
            {upcomingLoans.map((loan) => (
              <div
                key={loan._id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs hover:border-slate-300 transition"
              >
                <div className="truncate mr-2">
                  <p className="font-bold text-slate-900 truncate">{loan.description}</p>
                  <p className="text-brand-primary font-bold mt-0.5">
                    {loan.currency} {(loan.remainingBalance / 100).toFixed(2)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Due: {new Date(loan.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <Link to={`/loans/${loan._id}`}>
                  <Button variant="outline" size="sm" className="text-xs py-1 px-2.5">
                    View
                  </Button>
                </Link>
              </div>
            ))}

            {upcomingLoans.length === 0 && (
              <div className="text-center py-6 space-y-1.5">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-slate-700">All caught up!</p>
                <p className="text-[11px] text-slate-400">
                  No loan installments are due in the near future.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity (2 cols on desktop) */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-primary" />
              Recent Transactions & Activity
            </h3>
            <Link to="/loans" className="text-xs font-bold text-brand-primary hover:underline">
              View all &rarr;
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentRepayments.slice(0, 3).map((r) => (
              <div
                key={r._id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs hover:border-slate-200 transition"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate">Payment: {r.loan?.description || 'Loan'}</p>
                    <p className="text-[11px] text-slate-500">
                      From: {r.borrower?.fullName || 'Member'} &bull; {new Date(r.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-emerald-700">
                    {r.currency} {(r.amount / 100).toFixed(2)}
                  </p>
                  <Badge status={r.status}>{r.status}</Badge>
                </div>
              </div>
            ))}

            {recentLoans.slice(0, 3).map((l) => (
              <div
                key={l._id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs hover:border-slate-200 transition"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-brand-primary flex items-center justify-center font-bold shrink-0">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate">Loan: {l.description}</p>
                    <p className="text-[11px] text-slate-500">
                      Lender: {l.lender?.fullName || 'Member'} &bull; Borrower: {l.borrower?.fullName || 'Member'}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-900">
                    {l.currency} {(l.amount / 100).toFixed(2)}
                  </p>
                  <Badge status={l.status}>{l.status}</Badge>
                </div>
              </div>
            ))}

            {recentLoans.length === 0 && recentRepayments.length === 0 && (
              <div className="text-center py-8 space-y-1.5">
                <p className="text-xs font-semibold text-slate-700">No recent transactions</p>
                <p className="text-[11px] text-slate-400">
                  When you create a loan or make a payment, your activity will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
