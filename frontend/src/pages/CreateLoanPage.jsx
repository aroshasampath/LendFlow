import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { 
  Coins, 
  User, 
  Calendar, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Tag,
  Info
} from 'lucide-react';

const CATEGORY_TAGS = [
  { icon: '🍔', label: 'Food & Meals' },
  { icon: '🏠', label: 'Room Rent' },
  { icon: '📶', label: 'Wi-Fi / Bills' },
  { icon: '🛒', label: 'Groceries' },
  { icon: '⛽', label: 'Transport / Petrol' },
  { icon: '☕', label: 'Tea & Snacks' },
  { icon: '💵', label: 'Cash Given' },
];

export const CreateLoanPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialBorrower = searchParams.get('borrower') || '';
  const initialDirection = searchParams.get('direction') || 'lent'; // 'lent' | 'borrowed'

  const [direction, setDirection] = useState(initialDirection);
  const [formData, setFormData] = useState({
    borrowerIdentifier: initialBorrower,
    amount: '',
    currency: 'USD',
    interestRate: '0',
    dueDate: '',
    repaymentFrequency: 'one-time',
    description: '',
    notes: '',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleCategoryClick = (label) => {
    if (!formData.description) {
      setFormData((prev) => ({ ...prev, description: label }));
    } else {
      setFormData((prev) => ({ ...prev, description: `${prev.description} - ${label}` }));
    }
  };

  // Default dueDate to 30 days from now
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
      const payload = {
        ...formData,
        direction,
      };
      const res = await api.post('/loans', payload);
      setSuccessMsg(
        direction === 'lent'
          ? 'Debt record added! Your friend has been notified to acknowledge.'
          : 'Debt recorded! You noted that you owe this to your friend.'
      );
      setTimeout(() => {
        navigate(`/loans/${res.data.loan._id}`);
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to record debt. Please check username or details.');
    } finally {
      setLoading(false);
    }
  };

  const principalNum = parseFloat(formData.amount) || 0;
  const isLent = direction === 'lent';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Debts & IOUs', path: '/loans' },
          { label: isLent ? 'Record Money Given' : 'Record Money Borrowed' },
        ]}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/loans"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white transition border border-slate-200"
          aria-label="Back to Debts"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Record a Debt / IOU
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Keep track of money shared between friends and roommates so no one ever forgets.
          </p>
        </div>
      </div>

      {/* Modern Direction Segmented Toggle */}
      <div className="bg-white p-2 sm:p-2.5 rounded-3xl border border-slate-200/90 shadow-xs grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setDirection('lent')}
          className={`py-3 px-4 rounded-2xl flex items-center justify-center gap-2.5 text-xs sm:text-sm font-bold transition-all ${
            isLent
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 shrink-0" />
          <span>I Gave / Lent Money (They Owe Me)</span>
        </button>

        <button
          type="button"
          onClick={() => setDirection('borrowed')}
          className={`py-3 px-4 rounded-2xl flex items-center justify-center gap-2.5 text-xs sm:text-sm font-bold transition-all ${
            !isLent
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4 shrink-0" />
          <span>I Borrowed / Took Money (I Owe Them)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
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
            {/* Friend Selector */}
            <Input
              label={isLent ? "Who owes you? (Friend's username or email)" : "Who do you owe? (Friend's username or email)"}
              name="borrowerIdentifier"
              placeholder="e.g. @kasun or kasun@example.com"
              value={formData.borrowerIdentifier}
              onChange={handleChange}
              required
              icon={User}
              helperText="The other person will see this on their account and get notified."
            />

            {/* Amount & Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Amount"
                name="amount"
                type="number"
                step="0.01"
                min="1"
                placeholder="500.00"
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
                  <option value="LKR">LKR (Rs) - Sri Lankan Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>
            </div>

            {/* Quick Category Suggestion Tags */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-brand-primary" />
                Quick Tags (Click to add):
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_TAGS.map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => handleCategoryClick(tag.label)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-brand-primary hover:border-brand-primary/30 border border-transparent text-xs font-medium text-slate-700 transition flex items-center gap-1.5 active:scale-95"
                  >
                    <span>{tag.icon}</span>
                    <span>{tag.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* What is this for */}
            <Input
              label="What was this for?"
              name="description"
              placeholder="e.g. Dinner bill, Wi-Fi share, groceries, cash help"
              value={formData.description}
              onChange={handleChange}
              required
            />

            {/* Expected Return Date */}
            <Input
              label="Agreed Return / Settlement Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              required
              icon={Calendar}
              helperText="A friendly reminder date so neither person forgets."
            />

            {/* Additional Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                rows={2}
                maxLength={500}
                placeholder="e.g. Paid via FriMi, or cash handed over at hostel room..."
                value={formData.notes}
                onChange={handleChange}
                className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-brand-primary placeholder:text-slate-400 text-slate-900"
              />
            </div>

            {/* Optional Interest Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-1"
              >
                <span>{showAdvanced ? '− Hide optional interest' : '+ Add interest rate (optional)'}</span>
              </button>

              {showAdvanced && (
                <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <Input
                    label="Interest Rate (%)"
                    name="interestRate"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={formData.interestRate}
                    onChange={handleChange}
                    helperText="Leave 0% for interest-free friend loans."
                  />
                </div>
              )}
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                variant={isLent ? 'primary' : 'secondary'}
                size="lg"
                loading={loading}
                fullWidthOnMobile
                className="w-full text-sm sm:text-base py-3"
              >
                {isLent ? 'Save Note (Friend Owes You)' : 'Save Note (You Owe Friend)'}
              </Button>
            </div>
          </form>
        </div>

        {/* Live Preview Card (1 col) */}
        <div className="space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              Live Record Preview
            </h3>

            <div className={`p-4 rounded-2xl border space-y-3 ${
              isLent 
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' 
                : 'bg-amber-50/60 border-amber-200 text-amber-900'
            }`}>
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase opacity-75">
                  {isLent ? 'You Will Collect' : 'You Will Repay'}
                </span>
                <p className="text-2xl sm:text-3xl font-black mt-0.5">
                  {formData.currency} {principalNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="pt-2 border-t border-black/10 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="opacity-75">Direction:</span>
                  <span className="font-bold">
                    {isLent ? 'Friend owes you' : 'You owe friend'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Friend:</span>
                  <span className="font-semibold truncate max-w-[150px]">
                    {formData.borrowerIdentifier || 'Not selected yet'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">For:</span>
                  <span className="font-semibold truncate max-w-[150px]">
                    {formData.description || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Return Date:</span>
                  <span className="font-semibold">{formData.dueDate || 'Not set'}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Both you and your friend will receive an instant notification. The record appears on both accounts so you never lose track.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
