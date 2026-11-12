import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  Coins, 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Percent 
} from 'lucide-react';

export const CreateLoanPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialBorrower = searchParams.get('borrower') || '';

  const [formData, setFormData] = useState({
    borrowerIdentifier: initialBorrower,
    amount: '',
    currency: 'USD',
    interestRate: '0',
    dueDate: '',
    repaymentFrequency: 'monthly',
    description: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  // Default dueDate to 30 days from now if not set
  useEffect(() => {
    if (!formData.dueDate) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      setFormData((prev) => ({
        ...prev,
        dueDate: futureDate.toISOString().split('T')[0],
      }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/loans', formData);
      setSuccessMsg(res.message || 'Your loan request has been sent.');
      setTimeout(() => {
        navigate(`/loans/${res.data.loan._id}`);
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to create loan request. Please check the information provided.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate quick summary metrics
  const principalNum = parseFloat(formData.amount) || 0;
  const interestNum = parseFloat(formData.interestRate) || 0;
  const totalDueEstimate = principalNum + (principalNum * interestNum) / 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/loans"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white transition border border-slate-200"
          aria-label="Back to Loans"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Create Loan Agreement</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Propose a bilateral loan request. The borrower will be notified to review and accept the terms.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
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
              label="Borrower (@username, email, or user ID)"
              name="borrowerIdentifier"
              placeholder="e.g. @borrower_username"
              value={formData.borrowerIdentifier}
              onChange={handleChange}
              required
              icon={User}
              helperText="The borrower must have an active LendFlow account."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Loan Amount (Principal)"
                name="amount"
                type="number"
                step="0.01"
                min="1"
                placeholder="1000.00"
                value={formData.amount}
                onChange={handleChange}
                required
                icon={Coins}
              />

              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full text-sm sm:text-base rounded-xl border border-slate-300 bg-white text-slate-900 px-3.5 py-2.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="LKR">LKR (Rs) - Sri Lankan Rupee</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Optional Interest Rate (%)"
                name="interestRate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="0"
                value={formData.interestRate}
                onChange={handleChange}
                icon={Percent}
                helperText="Enter 0 for interest-free loans."
              />

              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                  Repayment Frequency
                </label>
                <select
                  name="repaymentFrequency"
                  value={formData.repaymentFrequency}
                  onChange={handleChange}
                  className="w-full text-sm sm:text-base rounded-xl border border-slate-300 bg-white text-slate-900 px-3.5 py-2.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="monthly">Monthly Installments</option>
                  <option value="bi-weekly">Bi-Weekly Installments</option>
                  <option value="weekly">Weekly Installments</option>
                  <option value="one-time">One-Time Bullet Payment</option>
                </select>
              </div>
            </div>

            <Input
              label="Repayment Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              required
              icon={Calendar}
            />

            <Input
              label="Purpose / Description"
              name="description"
              placeholder="e.g. Business equipment purchase or emergency loan"
              value={formData.description}
              onChange={handleChange}
              required
              icon={FileText}
            />

            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                Additional Agreement Notes (Optional)
              </label>
              <textarea
                name="notes"
                rows={2}
                maxLength={1000}
                placeholder="Any special repayment conditions or collateral terms..."
                value={formData.notes}
                onChange={handleChange}
                className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-brand-primary placeholder:text-slate-400 text-slate-900"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="lg" loading={loading} fullWidthOnMobile className="w-full">
                Send Loan Proposal
              </Button>
            </div>
          </form>
        </div>

        {/* Real-time Summary Card (1 col) */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Coins className="w-4 h-4 text-brand-primary" />
              Agreement Summary
            </h3>

            <div className="p-4 rounded-2xl bg-brand-primaryLight/50 border border-brand-primary/20 space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Estimated Total</span>
                <p className="text-2xl font-black text-brand-primary">
                  {formData.currency} {totalDueEstimate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="pt-2 border-t border-brand-primary/10 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Principal:</span>
                  <span className="font-semibold text-slate-800">
                    {formData.currency} {principalNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Interest:</span>
                  <span className="font-semibold text-slate-800">{interestNum}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Frequency:</span>
                  <span className="font-semibold capitalize text-slate-800">{formData.repaymentFrequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Due Date:</span>
                  <span className="font-semibold text-slate-800">{formData.dueDate || 'Not set'}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Loan agreements become active only after the borrower explicitly accepts the proposal.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
