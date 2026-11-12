import mongoose from 'mongoose';
import { Repayment } from '../models/Repayment.model.js';
import { Loan } from '../models/Loan.model.js';
import { toMinorUnits, toMajorUnits, formatCurrency } from '../utils/money.js';
import { validateRepaymentSubmission } from '../validators/repayment.validator.js';

/**
 * 1. Submit a Repayment (Borrower Feature)
 * POST /api/repayments
 */
export const submitRepayment = async (req, res, next) => {
  try {
    const {
      loanId,
      amount,
      paymentDate,
      paymentReference,
      notes,
      idempotencyKey,
    } = req.body;

    // Validation
    const validation = validateRepaymentSubmission({
      loanId,
      amount,
      paymentDate,
      idempotencyKey,
      paymentReference,
      notes,
    });

    if (!validation.isValid) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    if (!mongoose.Types.ObjectId.isValid(loanId)) {
      return res.status(404).json({
        success: false,
        message: 'We could not find this loan. It may have been removed or is unavailable.',
      });
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'We could not find this loan. It may have been removed or is unavailable.',
      });
    }

    // BOLA Check: Only the Borrower can submit repayments
    if (!loan.borrower.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }

    // State Check: Only active or overdue loans accept repayments
    if (!['active', 'overdue'].includes(loan.status)) {
      return res.status(400).json({
        success: false,
        message: 'Repayments can only be submitted for active or overdue loans.',
      });
    }

    // Idempotency Check: Prevent duplicate payment processing
    const existingPayment = await Repayment.findOne({ idempotencyKey: idempotencyKey.trim() });
    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: 'This repayment has already been processed.',
      });
    }

    // Financial Calculation in Integer Minor Units (Cents)
    const amountInMinorUnits = toMinorUnits(amount);

    // Guard: Repayment cannot exceed outstanding balance
    if (amountInMinorUnits > loan.remainingBalance) {
      return res.status(400).json({
        success: false,
        message: 'The repayment amount cannot exceed the outstanding balance.',
      });
    }

    const repayment = new Repayment({
      loan: loan._id,
      borrower: req.user._id,
      lender: loan.lender,
      amount: amountInMinorUnits,
      currency: loan.currency,
      paymentDate: new Date(paymentDate),
      paymentReference: paymentReference ? paymentReference.trim() : '',
      notes: notes ? notes.trim() : '',
      status: 'pending',
      idempotencyKey: idempotencyKey.trim(),
    });

    await repayment.save();

    // Record submission in loan audit timeline (Note: balance does NOT reduce until confirmed)
    loan.timeline.push({
      action: 'repayment_submitted',
      performedBy: req.user._id,
      timestamp: new Date(),
      note: `Repayment of ${formatCurrency(amountInMinorUnits, loan.currency)} submitted by borrower. Awaiting lender confirmation.`,
    });
    await loan.save();

    return res.status(201).json({
      success: true,
      message: 'Your repayment has been submitted.',
      data: {
        repayment,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This repayment has already been processed.',
      });
    }
    next(error);
  }
};

/**
 * 2. Confirm Repayment (Lender Feature - Reduces Balance)
 * POST /api/repayments/:id/confirm
 */
export const confirmRepayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'We could not find this repayment record.',
      });
    }

    const repayment = await Repayment.findById(id);
    if (!repayment) {
      return res.status(404).json({
        success: false,
        message: 'We could not find this repayment record.',
      });
    }

    // BOLA Check: Only the Lender can confirm incoming repayments
    if (!repayment.lender.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }

    // State Check: Can only confirm pending payments
    if (repayment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This repayment has already been processed.',
      });
    }

    const loan = await Loan.findById(repayment.loan);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'The associated loan agreement could not be found.',
      });
    }

    // Deduct from remaining balance atomically
    const previousBalance = loan.remainingBalance;
    const deduction = Math.min(repayment.amount, loan.remainingBalance);
    const newBalance = previousBalance - deduction;

    loan.remainingBalance = newBalance;
    loan.totalRepaid += deduction;

    // Check if loan is now fully completed
    let isNowCompleted = false;
    if (newBalance === 0) {
      loan.status = 'completed';
      isNowCompleted = true;
      loan.timeline.push({
        action: 'completed',
        performedBy: req.user._id,
        timestamp: new Date(),
        note: 'Outstanding balance has reached zero. Loan agreement marked as completed.',
      });
    }

    // Add repayment confirmation to timeline
    loan.timeline.push({
      action: 'repayment_confirmed',
      performedBy: req.user._id,
      timestamp: new Date(),
      note: `Repayment of ${formatCurrency(repayment.amount, loan.currency)} confirmed by lender. Remaining balance is now ${formatCurrency(newBalance, loan.currency)}.`,
    });

    await loan.save();

    // Update repayment record
    repayment.status = 'confirmed';
    repayment.confirmedAt = new Date();
    repayment.confirmedBy = req.user._id;
    repayment.previousBalance = previousBalance;
    repayment.newBalance = newBalance;
    await repayment.save();

    return res.status(200).json({
      success: true,
      message: isNowCompleted
        ? 'Your repayment has been confirmed. The loan balance is fully cleared!'
        : 'Your repayment has been confirmed.',
      data: {
        repayment,
        loan: {
          id: loan._id,
          remainingBalance: loan.remainingBalance,
          totalRepaid: loan.totalRepaid,
          status: loan.status,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Reject Repayment (Lender Feature)
 * POST /api/repayments/:id/reject
 */
export const rejectRepayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'We could not find this repayment record.',
      });
    }

    const repayment = await Repayment.findById(id);
    if (!repayment) {
      return res.status(404).json({
        success: false,
        message: 'We could not find this repayment record.',
      });
    }

    // BOLA Check: Only the Lender can reject repayments
    if (!repayment.lender.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }

    if (repayment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This repayment has already been processed.',
      });
    }

    repayment.status = 'rejected';
    repayment.rejectionReason = rejectionReason ? rejectionReason.trim() : 'Declined by lender.';
    await repayment.save();

    // Record in loan timeline
    const loan = await Loan.findById(repayment.loan);
    if (loan) {
      loan.timeline.push({
        action: 'repayment_rejected',
        performedBy: req.user._id,
        timestamp: new Date(),
        note: `Repayment of ${formatCurrency(repayment.amount, loan.currency)} declined by lender: ${repayment.rejectionReason}`,
      });
      await loan.save();
    }

    return res.status(200).json({
      success: true,
      message: 'The repayment request has been declined.',
      data: { repayment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Get Repayments for a Specific Loan
 * GET /api/repayments/loan/:loanId
 */
export const getLoanRepayments = async (req, res, next) => {
  try {
    const { loanId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(loanId)) {
      return res.status(404).json({
        success: false,
        message: 'We could not find this loan.',
      });
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'We could not find this loan.',
      });
    }

    // BOLA Check: Only Lender or Borrower can access payment history
    if (!loan.lender.equals(req.user._id) && !loan.borrower.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }

    const repayments = await Repayment.find({ loan: loan._id })
      .populate('borrower', 'fullName username avatar')
      .populate('lender', 'fullName username avatar')
      .populate('confirmedBy', 'fullName username avatar')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        repayments,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Get User Repayments (Global History & Pending Actions)
 * GET /api/repayments?role=lender|borrower|all&status=pending|confirmed|rejected
 */
export const getMyRepayments = async (req, res, next) => {
  try {
    const { role = 'all', status, page = 1, limit = 15 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    let roleFilter = {};
    if (role === 'lender') {
      roleFilter = { lender: req.user._id };
    } else if (role === 'borrower') {
      roleFilter = { borrower: req.user._id };
    } else {
      roleFilter = {
        $or: [{ lender: req.user._id }, { borrower: req.user._id }],
      };
    }

    let statusFilter = {};
    if (status && status !== 'all') {
      statusFilter = { status };
    }

    const queryFilter = { ...roleFilter, ...statusFilter };

    const [repayments, total] = await Promise.all([
      Repayment.find(queryFilter)
        .populate('loan', 'description currency remainingBalance amount status')
        .populate('borrower', 'fullName username avatar')
        .populate('lender', 'fullName username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Repayment.countDocuments(queryFilter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      data: {
        repayments,
        pagination: {
          total,
          page: pageNum,
          totalPages,
          hasMore: pageNum < totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

