import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ResponsiveTable } from '../components/ui/ResponsiveTable';
import { SkeletonTable } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Calendar, 
  FileText, 
  AlertCircle,
  Filter,
  Coins,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const RepaymentsPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const loanIdFromUrl = searchParams.get('loanId') || '';

  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'lender', 'borrower'
  const [statusFilter, setStatusFilter] = useState('all');
  const [repayments, setRepayments] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0, hasMore: false });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Submit Repayment Modal State
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    loanId: loanIdFromUrl,
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentReference: '',
    notes: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  // Available Active Loans for Borrower
  const [activeLoans, setActiveLoans] = useState([]);

  // Confirm/Reject Modal State
  const [selectedRepayment, setSelectedRepayment] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch repayments
  const fetchRepayments = async (page = 1) => {
    setLoading(true);
    setErrorMsg('');
    try {
      let endpoint = `/repayments?role=${roleFilter}&status=${statusFilter}&page=${page}&limit=10`;
      if (loanIdFromUrl) {
        endpoint = `/repayments/loan/${loanIdFromUrl}`;
      }
      const res = await api.get(endpoint);
      if (loanIdFromUrl) {
        setRepayments(res.data.repayments || []);
        setPagination({ total: res.data.repayments?.length || 0, page: 1, totalPages: 1, hasMore: false });
      } else {
        setRepayments(res.data.repayments || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Unable to retrieve repayment records.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch active loans for modal dropdown (both as lender and borrower)
  const fetchActiveLoans = async () => {
    try {
      const res = await api.get('/loans?role=all&status=active&limit=50');
      setActiveLoans(res.data.loans || []);
    } catch {
      // Ignore background fetch failure
    }
  };

  useEffect(() => {
    fetchRepayments(1);
    fetchActiveLoans();
  }, [roleFilter, statusFilter, loanIdFromUrl]);

  // Handle Submit Repayment
  const handleSubmitRepayment = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Generate client-side cryptographic idempotency key
      const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const res = await api.post('/repayments', {
        ...submitForm,
        idempotencyKey,
      });

      setSuccessMsg(res.message || 'Your repayment has been submitted.');
      setSubmitModalOpen(false);
      setSubmitForm({
        loanId: loanIdFromUrl,
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentReference: '',
        notes: '',
      });
      fetchRepayments(1);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to submit repayment.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle Confirm Payment (Lender)
  const handleConfirmPayment = async () => {
    if (!selectedRepayment) return;
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.post(`/repayments/${selectedRepayment._id}/confirm`);
      setSuccessMsg(res.message);
      setConfirmModalOpen(false);
      fetchRepayments(1);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to confirm repayment.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject Payment (Lender)
  const handleRejectPayment = async (e) => {
    e.preventDefault();
    if (!selectedRepayment) return;
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.post(`/repayments/${selectedRepayment._id}/reject`, {
        rejectionReason,
      });
      setSuccessMsg(res.message);
      setRejectModalOpen(false);
      setRejectionReason('');
      fetchRepayments(1);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to decline repayment.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Repayment Details',
      key: 'details',
      render: (item) => {
        const isLender = item.lender?._id === user?.id || item.lender === user?.id;
        const otherParty = isLender ? item.borrower : item.lender;
        return (
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                isLender ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-brand-primary'
              }`}
            >
              {isLender ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div className="truncate max-w-[200px] sm:max-w-xs">
              <p className="font-bold text-slate-900 text-sm truncate">
                {item.loan?.description || 'Loan Agreement'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {isLender ? 'From:' : 'To:'} {otherParty?.fullName || 'Member'} (@{otherParty?.username})
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Amount',
      key: 'amount',
      render: (item) => (
        <span className="font-extrabold text-slate-900">
          {item.currency} {(item.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'Payment Date',
      key: 'paymentDate',
      render: (item) => new Date(item.paymentDate).toLocaleDateString(),
    },
    {
      header: 'Reference',
      key: 'paymentReference',
      render: (item) => (
        <span className="font-mono text-xs text-slate-600">
          {item.paymentReference || 'Direct Deposit'}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (item) => (
        <Badge status={item.status}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      key: 'action',
      render: (item) => {
        const isLender = item.lender?._id === user?.id || item.lender === user?.id;
        if (isLender && item.status === 'pending') {
          return (
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="primary"
                className="text-xs py-1 px-2.5"
                onClick={() => {
                  setSelectedRepayment(item);
                  setConfirmModalOpen(true);
                }}
              >
                Confirm
              </Button>
              <Button
                size="sm"
                variant="danger"
                className="text-xs py-1 px-2.5"
                onClick={() => {
                  setSelectedRepayment(item);
                  setRejectModalOpen(true);
                }}
              >
                Decline
              </Button>
            </div>
          );
        }
        return (
          <span className="text-xs text-slate-400 italic">
            {item.status === 'confirmed' ? 'Verified' : item.status === 'rejected' ? 'Declined' : 'Pending Review'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Breadcrumbs items={[{ label: 'Repayments' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Settlements & Repayments</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Record payments when debts are settled. Both sides stay verified with zero confusion.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setSubmitModalOpen(true)}
        >
          + Record Settlement
        </Button>
      </div>

      {/* Role Tabs */}
      {!loanIdFromUrl && (
        <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
          {[
            { key: 'all', label: 'All Settlements' },
            { key: 'lender', label: '🟢 Incoming to Confirm' },
            { key: 'borrower', label: '🔴 Outgoing Payments' },
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
      )}

      {/* Status Filter Pills */}
      {!loanIdFromUrl && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['all', 'pending', 'confirmed', 'rejected'].map((st) => (
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
      )}

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

      {/* Repayments Table / Cards */}
      {loading ? (
        <SkeletonTable rows={5} cols={5} />
      ) : repayments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No repayments found"
          description="There are currently no repayment records matching your selected filters. You can record a new repayment installment."
          actionText="Submit Repayment"
          actionOnClick={() => setSubmitModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          <ResponsiveTable
            columns={columns}
            data={repayments}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchRepayments(pagination.page - 1)}
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
                onClick={() => fetchRepayments(pagination.page + 1)}
                icon={ChevronRight}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Submit Repayment Modal */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title="Submit Loan Repayment"
      >
        <form onSubmit={handleSubmitRepayment} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700">
              Select Loan Agreement
            </label>
            <select
              name="loanId"
              value={submitForm.loanId}
              onChange={(e) => setSubmitForm({ ...submitForm, loanId: e.target.value })}
              required
              className="w-full text-sm rounded-xl border border-slate-300 bg-white text-slate-900 px-3.5 py-2.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="">-- Choose active loan --</option>
              {activeLoans.map((l) => {
                const isLender = l.lender?._id === user?.id || l.lender === user?.id;
                const otherParty = isLender ? l.borrower : l.lender;
                return (
                  <option key={l._id} value={l._id}>
                    {l.description} ({isLender ? `${otherParty?.fullName} owes you` : `You owe ${otherParty?.fullName}`}) - {l.currency} {(l.remainingBalance / 100).toFixed(2)}
                  </option>
                );
              })}
            </select>
          </div>

          <Input
            label="Repayment Amount"
            name="amount"
            type="number"
            step="0.01"
            min="1"
            placeholder="e.g. 250.00"
            value={submitForm.amount}
            onChange={(e) => setSubmitForm({ ...submitForm, amount: e.target.value })}
            required
            icon={Coins}
            helperText="Cannot exceed the loan's outstanding balance."
          />

          <Input
            label="Payment Date"
            name="paymentDate"
            type="date"
            value={submitForm.paymentDate}
            onChange={(e) => setSubmitForm({ ...submitForm, paymentDate: e.target.value })}
            required
            icon={Calendar}
          />

          <Input
            label="Payment Reference / Receipt ID (Optional)"
            name="paymentReference"
            placeholder="e.g. Bank slip, transaction ID, cash receipt"
            value={submitForm.paymentReference}
            onChange={(e) => setSubmitForm({ ...submitForm, paymentReference: e.target.value })}
            icon={FileText}
          />

          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700">
              Payment Notes (Optional)
            </label>
            <textarea
              name="notes"
              rows={2}
              maxLength={500}
              placeholder="Any details for the lender..."
              value={submitForm.notes}
              onChange={(e) => setSubmitForm({ ...submitForm, notes: e.target.value })}
              className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-brand-primary placeholder:text-slate-400 text-slate-900"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              The outstanding balance will be reduced immediately after the lender verifies and confirms the receipt.
            </span>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" size="sm" onClick={() => setSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitLoading}>
              Submit Repayment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Repayment Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Received Repayment"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Please confirm that you have received this payment from the borrower:
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Amount:</span>
              <span className="font-extrabold text-emerald-700 text-sm">
                {selectedRepayment?.currency} {selectedRepayment ? (selectedRepayment.amount / 100).toFixed(2) : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Borrower:</span>
              <span className="font-semibold text-slate-800">{selectedRepayment?.borrower?.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Reference:</span>
              <span className="font-mono text-slate-700">{selectedRepayment?.paymentReference || 'None'}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Confirming will deduct this amount from the loan&apos;s outstanding balance. This action cannot be undone.
          </p>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" size="sm" onClick={() => setConfirmModalOpen(false)}>
              Back
            </Button>
            <Button variant="primary" size="sm" loading={actionLoading} onClick={handleConfirmPayment}>
              Confirm & Deduct Balance
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Repayment Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Decline Repayment Request"
      >
        <form onSubmit={handleRejectPayment} className="space-y-4">
          <p className="text-xs text-slate-600">
            If you have not received this payment or the reference is incorrect, you can decline it.
          </p>

          <Input
            label="Reason for Declining (Optional)"
            name="rejectionReason"
            placeholder="e.g. Deposit not reflected in bank account"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" size="sm" onClick={() => setRejectModalOpen(false)}>
              Keep Under Review
            </Button>
            <Button variant="danger" size="sm" type="submit" loading={actionLoading}>
              Confirm Decline
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

