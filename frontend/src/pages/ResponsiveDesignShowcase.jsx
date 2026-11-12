import React, { useState } from 'react';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  CheckCircle, 
  AlertCircle, 
  Sliders, 
  Layers, 
  DollarSign, 
  Calendar, 
  User, 
  ExternalLink,
  Shield,
  FileText
} from 'lucide-react';
import { useViewport } from '../hooks/useViewport';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { ResponsiveTable } from '../components/ui/ResponsiveTable';
import { Modal } from '../components/ui/Modal';

export const ResponsiveDesignShowcase = () => {
  const { width, height, breakpoint, isMobile, isTablet, isDesktop } = useViewport();
  const [modalOpen, setModalOpen] = useState(false);
  const [testFormValues, setTestFormValues] = useState({
    name: 'Arosha Sampath',
    email: 'test@lendflow.io',
    amount: '25000',
  });
  const [formError, setFormError] = useState('');

  // Sample loan data for testing responsive table/cards
  const sampleLoans = [
    {
      id: 'LN-1001',
      borrower: 'Kasun Perera',
      amount: '$1,200.00',
      frequency: 'Monthly',
      dueDate: '2026-12-15',
      status: 'active',
    },
    {
      id: 'LN-1002',
      borrower: 'Dilani Fernando',
      amount: '$3,500.00',
      frequency: 'Bi-Weekly',
      dueDate: '2026-11-30',
      status: 'pending',
    },
    {
      id: 'LN-1003',
      borrower: 'Nimal Jayasuriya',
      amount: '$800.00',
      frequency: 'Monthly',
      dueDate: '2026-10-20',
      status: 'overdue',
    },
    {
      id: 'LN-1004',
      borrower: 'Sanduni Silva',
      amount: '$4,000.00',
      frequency: 'Monthly',
      dueDate: '2026-09-01',
      status: 'completed',
    },
  ];

  const columns = [
    {
      header: 'Loan ID',
      key: 'id',
      render: (item) => <span className="font-mono text-xs font-bold text-brand-primary">{item.id}</span>,
    },
    {
      header: 'Borrower',
      key: 'borrower',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
            {item.borrower.charAt(0)}
          </div>
          <span className="font-medium text-slate-900">{item.borrower}</span>
        </div>
      ),
    },
    {
      header: 'Principal',
      key: 'amount',
      render: (item) => <span className="font-bold text-slate-900">{item.amount}</span>,
    },
    {
      header: 'Repayment',
      key: 'frequency',
    },
    {
      header: 'Due Date',
      key: 'dueDate',
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
      header: 'Action',
      key: 'action',
      render: (item) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setModalOpen(true)}
          className="text-xs py-1"
        >
          Inspect
        </Button>
      ),
    },
  ];

  const handleTestSubmit = (e) => {
    e.preventDefault();
    if (!testFormValues.amount || Number(testFormValues.amount) <= 0) {
      setFormError('Please enter a valid loan amount greater than zero.');
    } else {
      setFormError('');
      setModalOpen(true);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primaryLight text-brand-primary text-xs font-semibold uppercase tracking-wider mb-2">
            <Smartphone className="w-3.5 h-3.5" />
            Stage 3 Responsive Foundation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Responsive Design System & QA
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Validating real-time viewport adaptation across 320px mobile up to 1440px desktop displays.
          </p>
        </div>

        <Button variant="primary" onClick={() => setModalOpen(true)}>
          Test Responsive Modal
        </Button>
      </div>

      {/* Real-time Viewport Monitor */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-brand-primary" />
          Live Viewport Metrics
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Screen Width</span>
            <p className="text-xl sm:text-2xl font-extrabold text-brand-primary mt-0.5">{width}px</p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Screen Height</span>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-0.5">{height}px</p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Tailwind Tier</span>
            <p className="text-base sm:text-lg font-bold text-emerald-700 mt-1 uppercase">{breakpoint}</p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Device Mode</span>
            <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              {isMobile ? 'Mobile (<768px)' : isTablet ? 'Tablet (768-1023px)' : 'Desktop (>=1024px)'}
            </p>
          </div>
        </div>
      </div>

      {/* Target Viewport Specifications Checklist */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          Mandatory Viewport Standards (Master Prompt Stage 3)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
          {[
            { size: '320 × 568', label: 'Small Mobile (iPhone SE/5)', current: width === 320 },
            { size: '375 × 812', label: 'Standard Mobile (iPhone X/11)', current: width === 375 },
            { size: '390 × 844', label: 'Modern Mobile (iPhone 13/14)', current: width === 390 },
            { size: '414 × 896', label: 'Large Mobile (XR/Plus)', current: width === 414 },
            { size: '768 × 1024', label: 'Tablet Portrait (iPad)', current: width === 768 },
            { size: '1024 × 768', label: 'Tablet Landscape (iPad Pro)', current: width === 1024 },
            { size: '1366 × 768', label: 'Standard Laptop', current: width === 1366 },
            { size: '1440 × 900', label: 'Large Desktop', current: width === 1440 },
          ].map((vp) => (
            <div
              key={vp.size}
              className={`p-3 rounded-xl border transition-all ${
                vp.current
                  ? 'bg-brand-primaryLight border-brand-primary text-brand-primary font-bold shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <p className="font-mono font-bold text-sm">{vp.size}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{vp.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Responsive Dual-Mode Table / Card Transformation */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Responsive Table Transformation
            </h2>
            <p className="text-xs text-slate-500">
              Desktop renders a tabular view; mobile automatically transforms into stacked touch cards.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 self-start sm:self-auto">
            {isMobile ? 'Mobile Card Mode Active' : 'Desktop Table Mode Active'}
          </span>
        </div>

        <ResponsiveTable columns={columns} data={sampleLoans} />
      </div>

      {/* Responsive Form Layout */}
      <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Responsive Touch-Friendly Forms</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Full-width inputs, $\ge$ 44px touch targets, mobile numeric keyboards, and accessible validation.
          </p>
        </div>

        <form onSubmit={handleTestSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Borrower Name"
              name="name"
              placeholder="e.g. Arosha Sampath"
              value={testFormValues.name}
              onChange={(e) => setTestFormValues({ ...testFormValues, name: e.target.value })}
              required
              icon={User}
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="borrower@lendflow.io"
              value={testFormValues.email}
              onChange={(e) => setTestFormValues({ ...testFormValues, email: e.target.value })}
              required
            />

            <Input
              label="Loan Amount (LKR / USD)"
              name="amount"
              type="number"
              placeholder="50000"
              value={testFormValues.amount}
              onChange={(e) => setTestFormValues({ ...testFormValues, amount: e.target.value })}
              error={formError}
              helperText="Zero-decimal floating prevention active"
              required
              icon={DollarSign}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button type="submit" variant="primary" fullWidthOnMobile>
              Validate & Submit
            </Button>
            <Button
              type="button"
              variant="secondary"
              fullWidthOnMobile
              onClick={() => {
                setTestFormValues({ name: '', email: '', amount: '' });
                setFormError('');
              }}
            >
              Reset Form
            </Button>
          </div>
        </form>
      </div>

      {/* Responsive Modal / Mobile Bottom Sheet */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Loan Details & Responsive Modal"
      >
        <div className="space-y-3">
          <p className="text-slate-600">
            This dialog adapts gracefully to the device viewport:
          </p>
          <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside bg-slate-50 p-3 rounded-xl border border-slate-200">
            <li><strong>Mobile screens:</strong> Acts as a native bottom sheet drawer with rounded top corners.</li>
            <li><strong>Desktop & Tablets:</strong> Centers smoothly with backdrop blur and focused keyboard controls.</li>
            <li><strong>Accessibility:</strong> ESC key closes the dialog; background scroll is locked.</li>
          </ul>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

