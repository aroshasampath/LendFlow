import mongoose from 'mongoose';

const timelineEventSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'created',
        'accepted',
        'rejected',
        'repayment_submitted',
        'repayment_confirmed',
        'repayment_rejected',
        'completed',
        'cancelled',
      ],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const loanSchema = new mongoose.Schema(
  {
    lender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lender is required.'],
      index: true,
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Borrower is required.'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Loan amount is required.'],
      min: [100, 'Minimum loan amount is 1.00 in minor currency units.'], // 100 minor units = 1.00
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      uppercase: true,
      enum: ['USD', 'LKR', 'EUR', 'GBP'],
    },
    interestRate: {
      type: Number,
      default: 0,
      min: [0, 'Interest rate cannot be negative.'],
      max: [100, 'Interest rate cannot exceed 100%.'],
    },
    description: {
      type: String,
      required: [true, 'Description is required.'],
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters.'],
    },
    loanDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Repayment due date is required.'],
      index: true,
    },
    repaymentFrequency: {
      type: String,
      required: true,
      enum: ['one-time', 'weekly', 'bi-weekly', 'monthly'],
      default: 'monthly',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters.'],
      default: '',
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'active', 'rejected', 'completed', 'overdue', 'cancelled'],
      default: 'pending',
      index: true,
    },
    remainingBalance: {
      type: Number,
      required: true,
      min: [0, 'Remaining balance cannot be negative.'],
    },
    totalRepaid: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Total repaid cannot be negative.'],
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    timeline: [timelineEventSchema],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast multi-party and status queries
loanSchema.index({ lender: 1, status: 1 });
loanSchema.index({ borrower: 1, status: 1 });
loanSchema.index({ status: 1, dueDate: 1 });

export const Loan = mongoose.model('Loan', loanSchema);
