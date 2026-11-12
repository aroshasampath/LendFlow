import mongoose from 'mongoose';
import { Loan } from '../models/Loan.model.js';
import { User } from '../models/User.model.js';
import { toMinorUnits, toMajorUnits, formatCurrency } from '../utils/money.js';
import { validateLoanCreation } from '../validators/loan.validator.js';
import { sendNotification } from '../services/notification.service.js';

/**
 * 1. Create a New Loan Request
 * POST /api/loans
 */
export const createLoan = async (req, res, next) => {
  try {
    const {
      borrowerIdentifier,
      friendIdentifier,
      direction = 'lent', // 'lent' (default: I gave money, they owe me) OR 'borrowed' (I took money, I owe them)
      amount,
      currency,
      interestRate,
      description,
      dueDate,
      repaymentFrequency,
      notes,
    } = req.body;

    const targetIdentifier = friendIdentifier || borrowerIdentifier;

    const validation = validateLoanCreation({
      borrowerIdentifier: targetIdentifier,
      amount,
      currency,
      dueDate,
      repaymentFrequency,
      description,
    });

    if (!validation.isValid) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    let friendFilter = {};
    if (mongoose.Types.ObjectId.isValid(targetIdentifier)) {
      friendFilter = { _id: targetIdentifier };
    } else {
      const cleanIdent = targetIdentifier.toLowerCase().trim();
      friendFilter = {
        $or: [{ username: cleanIdent }, { email: cleanIdent }],
      };
    }

    const counterparty = await User.findOne(friendFilter);
    if (!counterparty) {
      return res.status(404).json({
        success: false,
        message: 'The specified friend or member could not be found. Please check the username or email.',
      });
    }

    if (counterparty._id.equals(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot create a debt record with yourself.',
      });
    }

    const amountInMinorUnits = toMinorUnits(amount);

    const isBorrowed = direction === 'borrowed';
    const lenderId = isBorrowed ? counterparty._id : req.user._id;
    const borrowerId = isBorrowed ? req.user._id : counterparty._id;

    const loan = new Loan({
      lender: lenderId,
      borrower: borrowerId,
      amount: amountInMinorUnits,
      currency: (currency || 'USD').toUpperCase(),
      interestRate: parseFloat(interestRate) || 0,
      description: description.trim(),
      dueDate: new Date(dueDate),
      repaymentFrequency: repaymentFrequency || 'monthly',
      notes: notes ? notes.trim() : '',
      status: 'pending',
      remainingBalance: amountInMinorUnits,
      totalRepaid: 0,
      timeline: [
        {
          action: 'created',
          performedBy: req.user._id,
          timestamp: new Date(),
          note: isBorrowed
            ? `Debt record created by ${req.user.fullName} owing to ${counterparty.fullName}.`
            : `Debt record created by ${req.user.fullName} owed by ${counterparty.fullName}.`,
        },
      ],
    });

    await loan.save();

    // Send Notification to Counterparty
    await sendNotification({
      recipient: counterparty._id,
      sender: req.user._id,
      type: 'loan_request',
      title: isBorrowed ? 'New Debt Acknowledgment' : 'New Debt / IOU Record',
      message: isBorrowed
        ? `${req.user.fullName} recorded that they owe you ${formatCurrency(amountInMinorUnits, loan.currency)} for: "${loan.description}".`
        : `${req.user.fullName} recorded that you owe them ${formatCurrency(amountInMinorUnits, loan.currency)} for: "${loan.description}".`,
      link: `/loans/${loan._id}`,
      metadata: { loanId: loan._id, amount: amountInMinorUnits },
    });

    const populatedLoan = await Loan.findById(loan._id)
      .populate('lender', 'fullName username avatar email')
      .populate('borrower', 'fullName username avatar email');

    return res.status(201).json({
      success: true,
      message: 'Your loan request has been sent.',
      data: {
        loan: populatedLoan,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Get My Loans (Lender / Borrower Filtered with Status Support)
 * GET /api/loans?role=all|lender|borrower&status=...&page=1&limit=10
 */
export const getMyLoans = async (req, res, next) => {
  try {
    const { role = 'all', status, page = 1, limit = 10 } = req.query;
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

    // Auto-check for overdue loans
    await Loan.updateMany(
      {
        ...roleFilter,
        status: 'active',
        remainingBalance: { $gt: 0 },
        dueDate: { $lt: new Date() },
      },
      {
        $set: { status: 'overdue' },
        $push: {
          timeline: {
            action: 'overdue',
            performedBy: req.user._id,
            timestamp: new Date(),
            note: 'Loan past due date marked as overdue.',
          },
        },
      }
    );

    const [loans, total] = await Promise.all([
      Loan.find(queryFilter)
        .populate('lender', 'fullName username avatar')
        .populate('borrower', 'fullName username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Loan.countDocuments(queryFilter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      data: {
        loans,
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

/**
 * 3. Get Loan by ID (Strict BOLA / IDOR Verification)
 * GET /api/loans/:id
 */
export const getLoanById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'We could not find this loan. It may have been removed or is unavailable.',
      });
    }

    const loan = await Loan.findById(id)
      .populate('lender', 'fullName username avatar email phoneNumber')
      .populate('borrower', 'fullName username avatar email phoneNumber')
      .populate('timeline.performedBy', 'fullName username avatar');

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'We could not find this loan. It may have been removed or is unavailable.',
      });
    }

    const isLender = loan.lender._id.equals(req.user._id);
    const isBorrower = loan.borrower._id.equals(req.user._id);

    if (!isLender && !isBorrower) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        loan,
        userRole: isLender ? 'lender' : 'borrower',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Borrower Accepts or Rejects Loan Request
 * POST /api/loans/:id/respond
 */
export const respondToLoanRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body;

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. You can either accept or reject this loan request.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'We could not find this loan. It may have been removed or is unavailable.',
      });
    }

    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'We could not find this loan. It may have been removed or is unavailable.',
      });
    }

    const isBorrower = loan.borrower.equals(req.user._id);
    const isLender = loan.lender.equals(req.user._id);
    const creatorId = loan.timeline?.[0]?.performedBy;

    // The respondent must be a participant who did NOT create this record
    const isRecipient = (isBorrower || isLender) && (!creatorId || !creatorId.equals(req.user._id));

    if (!isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient of this debt request can accept or decline it.',
      });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This loan request is already ${loan.status} and cannot be modified.`,
      });
    }

    const otherPartyId = isBorrower ? loan.lender : loan.borrower;

    if (action === 'accept') {
      loan.status = 'active';
      loan.timeline.push({
        action: 'accepted',
        performedBy: req.user._id,
        timestamp: new Date(),
        note: `Debt record confirmed by ${req.user.fullName}. Now active.`,
      });
      await loan.save();

      // Notify the creator
      await sendNotification({
        recipient: otherPartyId,
        sender: req.user._id,
        type: 'loan_accepted',
        title: 'Debt Record Confirmed',
        message: `${req.user.fullName} confirmed the debt record of ${formatCurrency(loan.amount, loan.currency)} for "${loan.description}".`,
        link: `/loans/${loan._id}`,
        metadata: { loanId: loan._id, status: 'active' },
      });

      return res.status(200).json({
        success: true,
        message: 'You have confirmed this debt record.',
        data: { loan },
      });
    } else {
      loan.status = 'rejected';
      loan.rejectionReason = rejectionReason ? rejectionReason.trim() : 'Declined by recipient.';
      loan.timeline.push({
        action: 'rejected',
        performedBy: req.user._id,
        timestamp: new Date(),
        note: `Debt record declined: ${loan.rejectionReason}`,
      });
      await loan.save();

      // Notify the creator
      await sendNotification({
        recipient: otherPartyId,
        sender: req.user._id,
        type: 'loan_rejected',
        title: 'Debt Record Declined',
        message: `${req.user.fullName} declined the debt record for "${loan.description}".`,
        link: `/loans/${loan._id}`,
        metadata: { loanId: loan._id, reason: loan.rejectionReason },
      });

      return res.status(200).json({
        success: true,
        message: 'You have declined this debt record.',
        data: { loan },
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Lender Cancels Pending Loan Request
 * POST /api/loans/:id/cancel
 */
export const cancelLoanRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'We could not find this loan. It may have been removed or is unavailable.',
      });
    }

    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'We could not find this loan. It may have been removed or is unavailable.',
      });
    }

    if (!loan.lender.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the lender who created this loan can cancel it.',
      });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Active or completed loans cannot be cancelled.',
      });
    }

    loan.status = 'cancelled';
    loan.cancellationReason = cancellationReason ? cancellationReason.trim() : 'Cancelled by lender.';
    loan.timeline.push({
      action: 'cancelled',
      performedBy: req.user._id,
      timestamp: new Date(),
      note: `Loan proposal cancelled by lender: ${loan.cancellationReason}`,
    });
    await loan.save();

    // Notify Borrower
    await sendNotification({
      recipient: loan.borrower,
      sender: req.user._id,
      type: 'loan_cancelled',
      title: 'Loan Proposal Withdrawn',
      message: `${req.user.fullName} has withdrawn the loan proposal for "${loan.description}".`,
      link: `/loans/${loan._id}`,
      metadata: { loanId: loan._id },
    });

    return res.status(200).json({
      success: true,
      message: 'The loan request has been cancelled.',
      data: { loan },
    });
  } catch (error) {
    next(error);
  }
};
