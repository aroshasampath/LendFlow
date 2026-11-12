import mongoose from 'mongoose';

const repaymentSchema = new mongoose.Schema(
  {
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loan',
      required: [true, 'Loan reference is required.'],
      index: true,
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Borrower is required.'],
      index: true,
    },
    lender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lender is required.'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Repayment amount is required.'],
      min: [100, 'Minimum repayment amount is 1.00 in minor currency units.'],
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      uppercase: true,
      enum: ['USD', 'LKR', 'EUR', 'GBP'],
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required.'],
      default: Date.now,
    },
    paymentReference: {
      type: String,
      trim: true,
      maxlength: [100, 'Payment reference cannot exceed 100 characters.'],
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters.'],
      default: '',
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'rejected'],
      default: 'pending',
      index: true,
    },
    idempotencyKey: {
      type: String,
      required: [true, 'Idempotency key is required to prevent duplicate processing.'],
      unique: true,
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    confirmedAt: {
      type: Date,
    },
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    previousBalance: {
      type: Number,
      min: 0,
    },
    newBalance: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for querying payments by loan and status
repaymentSchema.index({ loan: 1, status: 1 });
repaymentSchema.index({ borrower: 1, status: 1 });
repaymentSchema.index({ lender: 1, status: 1 });

export const Repayment = mongoose.model('Repayment', repaymentSchema);
