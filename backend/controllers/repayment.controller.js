import mongoose from 'mongoose';
import { Repayment } from '../models/Repayment.model.js';
import { Loan } from '../models/Loan.model.js';
import { toMinorUnits, toMajorUnits, formatCurrency } from '../utils/money.js';
import { validateRepaymentSubmission } from '../validators/repayment.validator.js';
import { sendNotification } from '../services/notification.service.js';

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

    if (!loan.borrower.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }

    if (!['active', 'overdue'].includes(loan.status)) {
      return res.status(400).json({
        success: false,
        message: 'Repayments can only be submitted for active or overdue loans.',
      });
    }

    const existingPayment = await Repayment.findOne({ idempotencyKey: idempotencyKey.trim() });
    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: 'This repayment has already been processed.',
      });
    }

    const amountInMinorUnits = toMinorUnits(amount);

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

    loan.timeline.push({
      action: 'repayment_submitted',
      performedBy: req.user._id,
      timestamp: new Date(),
      note: `Repayment of ${formatCurrency(amountInMinorUnits, loan.currency)} submitted by borrower. Awaiting lender confirmation.`,
    });
    await loan.save();

    // Notify Lender of incoming repayment
    await sendNotification({
      recipient: loan.lender,
      sender: req.user._id,
      type: 'repayment_submitted',
      title: 'New Repayment Received to Verify',
      message: `${req.user.fullName} submitted a payment of ${formatCurrency(amountInMinorUnits, loan.currency)} for "${loan.description}". Please review and confirm.`,
      link: `/repayments?loanId=${loan._id}`,
      metadata: { loanId: loan._id, repaymentId: repayment._id, amount: amountInMinorUnits },
    });

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

    const loan = await Loan.findById(repayment.loan);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'The associated loan agreement could not be found.',
      });
    }

    const previousBalance = loan.remainingBalance;
    const deduction = Math.min(repayment.amount, loan.remainingBalance);
    const newBalance = previousBalance - deduction;

    loan.remainingBalance = newBalance;
    loan.totalRepaid += deduction;

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

    loan.timeline.push({
      action: 'repayment_confirmed',
      performedBy: req.user._id,
      timestamp: new Date(),
      note: `Repayment of ${formatCurrency(repayment.amount, loan.currency)} confirmed by lender. Remaining balance is now ${formatCurrency(newBalance, loan.currency)}.`,
    });

    await loan.save();

    repayment.status = 'confirmed';
    repayment.confirmedAt = new Date();
    repayment.confirmedBy = req.user._id;
    repayment.previousBalance = previousBalance;
    repayment.newBalance = newBalance;
    await repayment.save();

    // Notify Borrower of confirmation
    await sendNotification({
      recipient: repayment.borrower,
      sender: req.user._id,
      type: 'repayment_confirmed',
      title: isNowCompleted ? 'Loan Fully Completed!' : 'Repayment Confirmed',
      message: `${req.user.fullName} confirmed your repayment of ${formatCurrency(repayment.amount, loan.currency)}. Outstanding balance: ${formatCurrency(newBalance, loan.currency)}.`,
      link: `/loans/${loan._id}`,
      metadata: { loanId: loan._id, repaymentId: repayment._id, newBalance },
    });

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

    const loan = await Loan.findById(repayment.loan);
    if (loan) {
      loan.timeline.push({
        action: 'repayment_rejected',
        performedBy: req.user._id,
        timestamp: new Date(),
        note: `Repayment of ${formatCurrency(repayment.amount, loan.currency)} declined by lender: ${repayment.rejectionReason}`,
      });
      await loan.save();

      // Notify Borrower of rejection
      await sendNotification({
        recipient: repayment.borrower,
        sender: req.user._id,
        type: 'repayment_rejected',
        title: 'Repayment Submission Declined',
        message: `${req.user.fullName} declined your repayment submission for "${loan.description}": ${repayment.rejectionReason}`,
        link: `/loans/${loan._id}`,
        metadata: { loanId: loan._id, repaymentId: repayment._id, reason: repayment.rejectionReason },
      });
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
