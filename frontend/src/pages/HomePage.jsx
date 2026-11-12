import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
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
  Landmark,
  Layers
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

  const fetchSummary = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get('/dashboard/summary');
      setDashboardData(res.data);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to retrieve dashboard analytics.');
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
              LendFlow Fintech Platform
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Smarter, Safer <span className="text-brand-primaryLight">Peer-to-Peer</span> Loan Management
            </h1>

            <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed">
              Track bilateral loans, automate repayment schedules, eliminate floating-point calculation errors, and maintain immutable financial audit trails across all your devices.
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
            <h3 className="font-bold text-slate-900 text-base">Dual-Role Workflows</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Act as both lender and borrower simultaneously with complete separation of authorization records.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Minor-Unit Precision</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Stores all financial values in integer cents to eliminate floating-point calculation bugs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Idempotent Payments</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Guarantees zero duplicate repayments and requires lender verification before balance deduction.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Mobile-First QA</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Responsive table-to-card transformation ensuring comfortable touch interaction on every screen size.
            </p>
          </div>
        </section>
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

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Welcome back, {user?.fullName?.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Here is your bilateral financial summary and active lending portfolio.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link to="/loans/create">
            <Button variant="primary" icon={Plus}>
              New Loan
            </Button>
          </Link>
          <Link to="/repayments">
            <Button variant="secondary" icon={CreditCard}>
              Repayments
            </Button>
          </Link>
          <Link to="/users/search">
            <Button variant="outline" icon={Search}>
              Search
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

      {/* Overdue Loans Urgent Alert Banner */}
      {overdueLoans.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-red-50 border border-red-200 text-red-800 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-brand-danger">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Attention: You have {overdueLoans.length} loan agreement(s) past due date!</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {overdueLoans.map((ov) => (
              <div
                key={ov._id}
                className="p-3 bg-white rounded-xl border border-red-100 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">{ov.description}</p>
                  <p className="text-slate-500">
                    Remaining: {ov.currency} {(ov.remainingBalance / 100).toFixed(2)}
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

      {/* 6 Financial Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Total Lent</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 truncate">
            ${((cards.totalLent || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-400">Principal funded</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Total Borrowed</span>
            <ArrowDownLeft className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 truncate">
            ${((cards.totalBorrowed || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-400">Principal taken</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Outstanding Lent</span>
            <Coins className="w-4 h-4 text-brand-primary" />
          </div>
          <p className="text-lg sm:text-xl font-black text-brand-primary truncate">
            ${((cards.outstandingLent || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-400">Receivable balance</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Outstanding Due</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-lg sm:text-xl font-black text-amber-600 truncate">
            ${((cards.outstandingBorrowed || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-400">Payable balance</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Active Loans</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900">
            {cards.activeLoans || 0}
          </p>
          <p className="text-[10px] text-slate-400">Active agreements</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg sm:text-xl font-black text-emerald-700">
            {cards.completedLoans || 0}
          </p>
          <p className="text-[10px] text-slate-400">Fully cleared</p>
        </div>
      </div>

      {/* Visual Analytics Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Lending vs Borrowing Trends */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Monthly Activity Trends</h3>
              <p className="text-xs text-slate-500">6-Month Lending vs Borrowing Volume ($)</p>
            </div>
            <TrendingUp className="w-5 h-5 text-brand-primary" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3157D5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3157D5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBorrowed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A36A" stopOpacity={0.4} />
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
            </ResponsiveContainer>
          </div>
        </div>

        {/* Repayment Flow Chart */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Repayment Cash Flow</h3>
              <p className="text-xs text-slate-500">Confirmed installment payments by month ($)</p>
            </div>
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#17233C', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val) => [`$${Number(val).toFixed(2)}`, 'Repaid']}
                />
                <Bar dataKey="repaid" name="Confirmed Repayments ($)" fill="#3157D5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Upcoming Due Dates & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Due Dates (1 col) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-primary" />
              Upcoming Due Dates
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{upcomingLoans.length}</span>
          </div>

          <div className="space-y-3">
            {upcomingLoans.map((loan) => (
              <div
                key={loan._id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs hover:border-slate-300 transition"
              >
                <div className="truncate mr-2">
                  <p className="font-bold text-slate-900 truncate">{loan.description}</p>
                  <p className="text-brand-primary font-bold mt-0.5">
                    {loan.currency} {(loan.remainingBalance / 100).toFixed(2)}
                  </p>
                  <p className="text-[11px] text-slate-400">
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
              <p className="text-xs text-slate-400 italic text-center py-6">
                No active loans pending near-term due dates.
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
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
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-primary flex items-center justify-center font-bold shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate">Repayment: {r.loan?.description || 'Loan'}</p>
                    <p className="text-[11px] text-slate-500">
                      From: {r.borrower?.fullName} &bull; {new Date(r.paymentDate).toLocaleDateString()}
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
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate">Loan: {l.description}</p>
                    <p className="text-[11px] text-slate-500">
                      Lender: {l.lender?.fullName} &bull; Borrower: {l.borrower?.fullName}
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
              <p className="text-xs text-slate-400 italic text-center py-6">
                No recent transactions recorded yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
