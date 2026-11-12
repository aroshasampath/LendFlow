import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ResponsiveTable } from '../components/ui/ResponsiveTable';
import { SkeletonTable } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { 
  Plus, 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export const MyLoansPage = () => {
  const { user } = useAuth();
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'lender', 'borrower'
  const [statusFilter, setStatusFilter] = useState('all');
  const [loans, setLoans] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0, hasMore: false });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchLoans = async (page = 1) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get(
        `/loans?role=${roleFilter}&status=${statusFilter}&page=${page}&limit=10`
      );
      setLoans(res.data.loans || []);
      setPagination(res.data.pagination);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to retrieve loan agreements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans(1);
  }, [roleFilter, statusFilter]);

  const columns = [
    {
      header: 'Debt / Expense',
      key: 'description',
      render: (loan) => {
        const isLender = loan.lender?._id === user?.id || loan.lender === user?.id;
        const otherParty = isLender ? loan.borrower : loan.lender;
        return (
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                isLender ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {isLender ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
            </div>
            <div className="truncate max-w-[200px] sm:max-w-xs">
              <p className="font-bold text-slate-900 text-sm truncate">{loan.description}</p>
              <p className="text-xs text-slate-500 truncate">
                {isLender ? 'Owed by:' : 'Owed to:'} {otherParty?.fullName || 'Friend'} (@{otherParty?.username})
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Total Amount',
      key: 'amount',
      render: (loan) => (
        <span className="font-semibold text-slate-800">
          {loan.currency} {(loan.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'Balance Left',
      key: 'remainingBalance',
      render: (loan) => (
        <span className="font-bold text-brand-primary">
          {loan.currency} {(loan.remainingBalance / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'Return Date',
      key: 'dueDate',
      render: (loan) => new Date(loan.dueDate).toLocaleDateString(),
    },
    {
      header: 'Status',
      key: 'status',
      render: (loan) => (
        <Badge status={loan.status}>
          {loan.status === 'completed' ? 'Settled' : loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      key: 'action',
      render: (loan) => (
        <Link to={`/loans/${loan._id}`}>
          <Button size="sm" variant="outline" className="text-xs py-1">
            View / Settle
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Breadcrumbs items={[{ label: 'All Debts' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">All Debts</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track money friends owe you, money you owe friends, and active records.
          </p>
        </div>

        <Link to="/loans/create">
          <Button variant="primary" icon={Plus}>
            + Add Expense
          </Button>
        </Link>
      </div>

      {/* Role Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        {[
          { key: 'all', label: 'All Debts' },
          { key: 'lender', label: '🟢 Friends Owe Me' },
          { key: 'borrower', label: '🔴 I Owe Friends' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setRoleFilter(tab.key)}
            className={`pb-3 transition-colors border-b-2 -mb-[2px] touch-target cursor-pointer ${
              roleFilter === tab.key
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {['all', 'pending', 'active', 'completed', 'overdue', 'rejected', 'cancelled'].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-full capitalize font-medium transition cursor-pointer ${
              statusFilter === st
                ? 'bg-brand-primary text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-brand-danger text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loans Table / Cards */}
      {loading ? (
        <SkeletonTable rows={5} cols={5} />
      ) : loans.length === 0 ? (
        <EmptyState
          icon={Coins}
          title="No debts found"
          description="No records found matching your filters. You can add a new expense or clear filters."
          actionText="+ Add Expense"
          actionTo="/loans/create"
        />
      ) : (
        <div className="space-y-4">
          <ResponsiveTable
            columns={columns}
            data={loans}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchLoans(pagination.page - 1)}
                icon={ChevronLeft}
              >
                Previous
              </Button>

              <span className="text-xs text-slate-500 font-medium">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <Button
                variant="secondary"
                size="sm"
                disabled={!pagination.hasMore}
                onClick={() => fetchLoans(pagination.page + 1)}
                icon={ChevronRight}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

