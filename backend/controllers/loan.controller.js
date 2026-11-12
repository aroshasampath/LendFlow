import mongoose from 'mongoose';
import { Loan } from '../models/Loan.model.js';
import { User } from '../models/User.model.js';
import { toMinorUnits, toMajorUnits } from '../utils/money.js';
import { validateLoanCreation } from '../validators/loan.validator.js';

/**
 * 1. Create a New Loan Request
 * POST /api/loans
 */
export const createLoan = async (req, res, next) => {
  try {
    const {
      borrowerIdentifier,
      amount,
      currency,
      interestRate,
      description,
      dueDate,
      repaymentFrequency,
      notes,
    } = req.body;

    // Input Validation
    const validation = validateLoanCreation({
      borrowerIdentifier,
      amount,
      currency,
      dueDate,
      repaymentFrequency,
      description,
    });

    if (!validation.isValid) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    // Resolve Borrower by Username, Email, or ObjectId
    let borrowerFilter = {};
    if (mongoose.Types.ObjectId.isValid(borrowerIdentifier)) {
      borrowerFilter = { _id: borrowerIdentifier };
    } else {
      const cleanIdent = borrowerIdentifier.toLowerCase().trim();
      borrowerFilter = {
        $or: [{ username: cleanIdent }, { email: cleanIdent }],
      };
    }

    const borrower = await User.findOne(borrowerFilter);
    if (!borrower) {
      return res.status(404).json({
        success: false,
        message: 'The specified borrower could not be found. Please check the username or email.',
      });
    }

    // Anti Self-Lending Rule
    if (borrower._id.equals(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot create a loan agreement with yourself as the borrower.',
      });
    }

    // Convert amount to integer minor units (prevents floating point error)
    const amountInMinorUnits = toMinorUnits(amount);

    const loan = new Loan({
      lender: req.user._id,
      borrower: borrower._id,
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
          note: `Loan proposal created by lender for ${borrower.fullName}.`,
        },
      ],
    });

    await loan.save();

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

    // Filter by role
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

    // Filter by status if provided
    let statusFilter = {};
    if (status && status !== 'all') {
      statusFilter = { status };
    }

    const queryFilter = { ...roleFilter, ...statusFilter };

    // Auto-check for overdue loans (dueDate < now and status === 'active' and remainingBalance > 0)
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

    // BOLA / IDOR Security Enforcement:
    // Only the Lender or Borrower is authorized to view loan specifics
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

    // BOLA Check: Only the designated Borrower can respond
    if (!loan.borrower.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the intended borrower can accept or reject this loan request.',
      });
    }

    // State Machine Check: Can only act on pending requests
    if (loan.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This loan request is already ${loan.status} and cannot be modified.`,
      });
    }

    if (action === 'accept') {
      loan.status = 'active';
      loan.timeline.push({
        action: 'accepted',
        performedBy: req.user._id,
        timestamp: new Date(),
        note: 'Loan proposal accepted by borrower. Agreement is now active.',
      });
      await loan.save();

      return res.status(200).json({
        success: true,
        message: 'You have accepted the loan agreement.',
        data: { loan },
      });
    } else {
      loan.status = 'rejected';
      loan.rejectionReason = rejectionReason ? rejectionReason.trim() : 'Declined by borrower.';
      loan.timeline.push({
        action: 'rejected',
        performedBy: req.user._id,
        timestamp: new Date(),
        note: `Loan proposal rejected by borrower: ${loan.rejectionReason}`,
      });
      await loan.save();

      return res.status(200).json({
        success: true,
        message: 'You have rejected the loan agreement.',
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

    // BOLA Check: Only the Lender can cancel their pending request
    if (!loan.lender.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the lender who created this loan can cancel it.',
      });
    }

    // State Machine Check: Cannot cancel active or completed loans
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

    return res.status(200).json({
      success: true,
      message: 'The loan request has been cancelled.',
      data: { loan },
    });
  } catch (error) {
    next(error);
  }
};
