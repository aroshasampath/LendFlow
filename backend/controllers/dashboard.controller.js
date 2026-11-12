import mongoose from 'mongoose';
import { Loan } from '../models/Loan.model.js';
import { Repayment } from '../models/Repayment.model.js';

/**
 * 1. Comprehensive Financial Dashboard Analytics
 * GET /api/dashboard/summary
 */
export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Core Financial Aggregations
    const [
      lentStats,
      borrowedStats,
      activeLoansCount,
      completedLoansCount,
      overdueLoans,
      upcomingDueLoans,
      recentRepayments,
      recentLoans,
    ] = await Promise.all([
      // Total Lent & Outstanding Lent
      Loan.aggregate([
        {
          $match: {
            lender: userId,
            status: { $in: ['active', 'completed', 'overdue'] },
          },
        },
        {
          $group: {
            _id: null,
            totalLent: { $sum: '$amount' },
            outstandingLent: {
              $sum: {
                $cond: [{ $in: ['$status', ['active', 'overdue']] }, '$remainingBalance', 0],
              },
            },
          },
        },
      ]),

      // Total Borrowed & Outstanding Borrowed
      Loan.aggregate([
        {
          $match: {
            borrower: userId,
            status: { $in: ['active', 'completed', 'overdue'] },
          },
        },
        {
          $group: {
            _id: null,
            totalBorrowed: { $sum: '$amount' },
            outstandingBorrowed: {
              $sum: {
                $cond: [{ $in: ['$status', ['active', 'overdue']] }, '$remainingBalance', 0],
              },
            },
          },
        },
      ]),

      // Active Loans Count
      Loan.countDocuments({
        $or: [{ lender: userId }, { borrower: userId }],
        status: 'active',
      }),

      // Completed Loans Count
      Loan.countDocuments({
        $or: [{ lender: userId }, { borrower: userId }],
        status: 'completed',
      }),

      // Overdue Loans List
      Loan.find({
        $or: [{ lender: userId }, { borrower: userId }],
        status: 'overdue',
      })
        .populate('lender', 'fullName username avatar')
        .populate('borrower', 'fullName username avatar')
        .sort({ dueDate: 1 })
        .limit(5)
        .lean(),

      // Upcoming Due Dates (Active loans sorted by nearest dueDate)
      Loan.find({
        $or: [{ lender: userId }, { borrower: userId }],
        status: 'active',
        dueDate: { $gte: new Date() },
      })
        .populate('lender', 'fullName username avatar')
        .populate('borrower', 'fullName username avatar')
        .sort({ dueDate: 1 })
        .limit(5)
        .lean(),

      // Recent Repayments
      Repayment.find({
        $or: [{ lender: userId }, { borrower: userId }],
      })
        .populate('loan', 'description currency')
        .populate('borrower', 'fullName username')
        .populate('lender', 'fullName username')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Recent Loan Proposals / Agreements
      Loan.find({
        $or: [{ lender: userId }, { borrower: userId }],
      })
        .populate('lender', 'fullName username avatar')
        .populate('borrower', 'fullName username avatar')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const totalLent = lentStats[0]?.totalLent || 0;
    const outstandingLent = lentStats[0]?.outstandingLent || 0;
    const totalBorrowed = borrowedStats[0]?.totalBorrowed || 0;
    const outstandingBorrowed = borrowedStats[0]?.outstandingBorrowed || 0;

    // 2. Monthly Trends (Past 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [monthlyLending, monthlyBorrowing, monthlyRepayments] = await Promise.all([
      // Monthly Lending
      Loan.aggregate([
        {
          $match: {
            lender: userId,
            status: { $in: ['active', 'completed', 'overdue'] },
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Monthly Borrowing
      Loan.aggregate([
        {
          $match: {
            borrower: userId,
            status: { $in: ['active', 'completed', 'overdue'] },
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Monthly Repayments Confirmed
      Repayment.aggregate([
        {
          $match: {
            $or: [{ lender: userId }, { borrower: userId }],
            status: 'confirmed',
            confirmedAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$confirmedAt' } },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Build unified 6-month continuous chart data array
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;

      const lentObj = monthlyLending.find((m) => m._id === key);
      const borrowedObj = monthlyBorrowing.find((m) => m._id === key);
      const repayObj = monthlyRepayments.find((m) => m._id === key);

      chartData.push({
        monthKey: key,
        month: label,
        lent: lentObj ? lentObj.total / 100 : 0,
        borrowed: borrowedObj ? borrowedObj.total / 100 : 0,
        repaid: repayObj ? repayObj.total / 100 : 0,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        cards: {
          totalLent,
          totalBorrowed,
          outstandingLent,
          outstandingBorrowed,
          netBalance: outstandingLent - outstandingBorrowed,
          activeLoans: activeLoansCount,
          completedLoans: completedLoansCount,
          overdueLoansCount: overdueLoans.length,
        },
        charts: {
          trends: chartData,
        },
        overdueLoans,
        upcomingDueLoans,
        recentActivity: {
          loans: recentLoans,
          repayments: recentRepayments,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

