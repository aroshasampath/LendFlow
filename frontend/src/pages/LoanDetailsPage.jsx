import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Skeleton, SkeletonCard } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { 
  Coins, 
  User, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Ban, 
  ShieldCheck, 
  AlertCircle,
  CreditCard,
  History,
  Mail,
  Phone
} from 'lucide-react';

export const LoanDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loan, setLoan] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Modals
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLoanData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get(`/loans/${id}`);
      setLoan(res.data.loan);
      setUserRole(res.data.userRole);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to retrieve loan information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanData();
  }, [id]);

  // Handle Accept
  const handleAcceptLoan = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/loans/${id}/respond`, { action: 'accept' });
      setActionSuccess(res.message);
      fetchLoanData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to accept loan.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject
  const handleRejectLoan = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post(`/loans/${id}/respond`, {
        action: 'reject',
        rejectionReason,
      });
      setActionSuccess(res.message);
      setRejectModalOpen(false);
      fetchLoanData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to decline loan.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Cancel
  const handleCancelLoan = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post(`/loans/${id}/cancel`, {
        cancellationReason,
      });
      setActionSuccess(res.message);
      setCancelModalOpen(false);
      fetchLoanData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to cancel loan.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard className="md:col-span-2" />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (errorMsg && !loan) {
    return (
      <div className="max-w-md mx-auto my-12">
        <EmptyState
          icon={AlertCircle}
          title="Loan Unavailable"
          description={errorMsg || 'This loan agreement could not be loaded or you do not have permission to view it.'}
          actionText="Back to My Loans"
          actionTo="/loans"
        />
      </div>
    );
  }

  const isBorrower = userRole === 'borrower';
  const isLender = userRole === 'lender';
  const isPending = loan.status === 'pending';
  const isActive = loan.status === 'active';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumbs
        items={[
          { label: 'All Debts', path: '/loans' },
          { label: loan.description || 'Details' },
        ]}
      />

      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/loans"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white transition border border-slate-200"
            aria-label="Back to Debts"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{loan.description}</h1>
              <Badge status={loan.status}>{loan.status === 'completed' ? 'SETTLED' : loan.status.toUpperCase()}</Badge>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Record ID: {loan._id}</p>
          </div>
        </div>

        {/* Dynamic Action Buttons */}
        {isPending && isBorrower && (
          <div className="flex gap-2">
            <Button
              variant="primary"
              icon={CheckCircle2}
              loading={actionLoading}
              onClick={handleAcceptLoan}
            >
              Confirm Record
            </Button>
            <Button
              variant="danger"
              icon={XCircle}
              onClick={() => setRejectModalOpen(true)}
            >
              Decline
            </Button>
          </div>
        )}

        {isPending && isLender && (
          <Button
            variant="danger"
            icon={Ban}
            onClick={() => setCancelModalOpen(true)}
          >
            Cancel Record
          </Button>
        )}

        {isActive && (
          <Link to={`/repayments?loanId=${loan._id}`}>
            <Button variant="primary" icon={CreditCard}>
              View / Make Payment
            </Button>
          </Link>
        )}
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase">Original Amount</p>
          <p className="text-2xl font-extrabold text-slate-900">
            {loan.currency} {(loan.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400">
            {loan.interestRate > 0 ? `${loan.interestRate}% Interest` : 'Zero Interest'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase">Remaining to Pay</p>
          <p className="text-2xl font-extrabold text-brand-primary">
            {loan.currency} {(loan.remainingBalance / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 capitalize">{loan.repaymentFrequency} schedule</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Paid Back</p>
          <p className="text-2xl font-extrabold text-emerald-600">
            {loan.currency} {(loan.totalRepaid / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400">Return by {new Date(loan.dueDate).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Parties Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lender Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Who Paid / Lent</span>
            {isLender && <span className="text-xs font-semibold text-brand-primary">(You)</span>}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-brand-primary font-bold text-base flex items-center justify-center shrink-0 overflow-hidden">
              {loan.lender?.avatar ? (
                <img src={loan.lender.avatar} alt={loan.lender.fullName} className="w-full h-full object-cover" />
              ) : (
                loan.lender?.fullName?.charAt(0) || 'L'
              )}
            </div>
            <div className="truncate">
              <h3 className="font-bold text-slate-900 text-sm truncate">{loan.lender?.fullName}</h3>
              <p className="text-xs text-brand-primary font-mono truncate">@{loan.lender?.username}</p>
            </div>
          </div>
          <div className="text-xs text-slate-600 space-y-1.5 pt-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Mail className="w-3.5 h-3.5" />
              <span>{loan.lender?.email}</span>
            </div>
            {loan.lender?.phoneNumber && (
              <div className="flex items-center gap-2 text-slate-500">
                <Phone className="w-3.5 h-3.5" />
                <span>{loan.lender.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Borrower Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Who Received / Borrowed</span>
            {isBorrower && <span className="text-xs font-semibold text-brand-primary">(You)</span>}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-base flex items-center justify-center shrink-0 overflow-hidden">
              {loan.borrower?.avatar ? (
                <img src={loan.borrower.avatar} alt={loan.borrower.fullName} className="w-full h-full object-cover" />
              ) : (
                loan.borrower?.fullName?.charAt(0) || 'B'
              )}
            </div>
            <div className="truncate">
              <h3 className="font-bold text-slate-900 text-sm truncate">{loan.borrower?.fullName}</h3>
              <p className="text-xs text-brand-primary font-mono truncate">@{loan.borrower?.username}</p>
            </div>
          </div>
          <div className="text-xs text-slate-600 space-y-1.5 pt-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Mail className="w-3.5 h-3.5" />
              <span>{loan.borrower?.email}</span>
            </div>
            {loan.borrower?.phoneNumber && (
              <div className="flex items-center gap-2 text-slate-500">
                <Phone className="w-3.5 h-3.5" />
                <span>{loan.borrower.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loan Notes */}
      {loan.notes && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <h3 className="font-bold text-slate-900 text-sm">Notes & Details</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            {loan.notes}
          </p>
        </div>
      )}

      {/* Audit Timeline */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <History className="w-4 h-4 text-brand-primary" />
          History & Activity Timeline
        </h3>

        <div className="space-y-4 pl-2 border-l-2 border-slate-100">
          {loan.timeline?.map((event, idx) => (
            <div key={idx} className="relative pl-6 space-y-1">
              <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-brand-primary"></span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-slate-800">{event.action}</span>
                <span className="text-[11px] text-slate-400">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-600">{event.note}</p>
              {event.performedBy && (
                <p className="text-[11px] text-slate-400">
                  By: {event.performedBy.fullName || 'User'} (@{event.performedBy.username})
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Decline Record"
      >
        <form onSubmit={handleRejectLoan} className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to decline this record? You can add an optional reason.
          </p>

          <Input
            label="Reason (Optional)"
            name="rejectionReason"
            placeholder="e.g. Incorrect amount or already paid"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" size="sm" onClick={() => setRejectModalOpen(false)}>
              Keep
            </Button>
            <Button variant="danger" size="sm" type="submit" loading={actionLoading}>
              Decline
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Record"
      >
        <form onSubmit={handleCancelLoan} className="space-y-4">
          <p className="text-xs text-slate-600">
            You can cancel this record while it is still waiting for confirmation.
          </p>

          <Input
            label="Reason (Optional)"
            name="cancellationReason"
            placeholder="e.g. Entered by mistake or changed mind"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
          />

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" size="sm" onClick={() => setCancelModalOpen(false)}>
              Back
            </Button>
            <Button variant="danger" size="sm" type="submit" loading={actionLoading}>
              Cancel Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

