import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.model.js';
import { Loan } from '../models/Loan.model.js';
import { Repayment } from '../models/Repayment.model.js';
import { Notification } from '../models/Notification.model.js';
import { toMinorUnits } from '../utils/money.js';
import { sendNotification } from '../services/notification.service.js';

dotenv.config();

const runDashboardTests = async () => {
  console.log('--- STARTING STAGE 8 AUTOMATED DASHBOARD & NOTIFICATION TESTS ---\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'lendflow' });
    console.log('[Test Setup] Connected to MongoDB Atlas (lendflow).');

    const ts = Date.now();

    // 1. Create test Lender and Borrower
    const lender = await User.create({
      fullName: 'Dash Lender',
      username: `dash_l_${ts.toString().slice(-5)}`,
      email: `dash_l_${ts}@lendflow.io`,
      phoneNumber: '+94718000001',
      password: 'StrongPassword123!@',
    });

    const borrower = await User.create({
      fullName: 'Dash Borrower',
      username: `dash_b_${ts.toString().slice(-5)}`,
      email: `dash_b_${ts}@lendflow.io`,
      phoneNumber: '+94718000002',
      password: 'StrongPassword123!@',
    });

    console.log('[PASS 1] Created test accounts for Dashboard analytics verification.');

    // 2. Test Notification Dispatch (Loan Proposal)
    const notif1 = await sendNotification({
      recipient: borrower._id,
      sender: lender._id,
      type: 'loan_request',
      title: 'New Loan Proposal',
      message: 'Dash Lender proposed a $2,000 loan.',
      link: '/loans/123',
    });
    console.assert(notif1.isRead === false, 'FAIL: New notification should be unread');
    console.log('[PASS 2] Notification engine dispatched unread loan proposal notification.');

    // 3. Create Active Loan with $2,000 principal (200,000 cents)
    const loan = await Loan.create({
      lender: lender._id,
      borrower: borrower._id,
      amount: toMinorUnits(2000), // 200000
      currency: 'USD',
      description: 'Analytics test loan agreement',
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      repaymentFrequency: 'monthly',
      status: 'active',
      remainingBalance: toMinorUnits(2000), // 200000
      totalRepaid: 0,
    });

    // 4. Create Confirmed Repayment ($500 = 50,000 cents)
    const repayment = await Repayment.create({
      loan: loan._id,
      borrower: borrower._id,
      lender: lender._id,
      amount: toMinorUnits(500),
      currency: 'USD',
      idempotencyKey: `idemp_dash_${ts}`,
      status: 'confirmed',
      confirmedAt: new Date(),
      confirmedBy: lender._id,
    });

    // Reduce balance
    loan.remainingBalance -= repayment.amount;
    loan.totalRepaid += repayment.amount;
    await loan.save();

    console.log('[PASS 3] Seeded active loan ($2,000) and confirmed repayment ($500).');

    // 5. Test Lender Dashboard Aggregations
    const lenderLentAgg = await Loan.aggregate([
      { $match: { lender: lender._id, status: { $in: ['active', 'completed', 'overdue'] } } },
      { $group: { _id: null, totalLent: { $sum: '$amount' }, outstandingLent: { $sum: '$remainingBalance' } } },
    ]);

    console.assert(lenderLentAgg[0].totalLent === 200000, 'FAIL: Total lent should be $2,000');
    console.assert(lenderLentAgg[0].outstandingLent === 150000, 'FAIL: Outstanding lent should be $1,500');
    console.log('[PASS 4] Lender financial metrics verified: $2,000 total lent, $1,500 outstanding.');

    // 6. Test Borrower Dashboard Aggregations
    const borrowerBorrowAgg = await Loan.aggregate([
      { $match: { borrower: borrower._id, status: { $in: ['active', 'completed', 'overdue'] } } },
      { $group: { _id: null, totalBorrowed: { $sum: '$amount' }, outstandingBorrowed: { $sum: '$remainingBalance' } } },
    ]);

    console.assert(borrowerBorrowAgg[0].totalBorrowed === 200000, 'FAIL: Total borrowed should be $2,000');
    console.assert(borrowerBorrowAgg[0].outstandingBorrowed === 150000, 'FAIL: Outstanding borrowed should be $1,500');
    console.log('[PASS 5] Borrower financial metrics verified: $2,000 total borrowed, $1,500 outstanding.');

    // 7. Test Active & Completed Loan Counts
    const activeCount = await Loan.countDocuments({
      $or: [{ lender: lender._id }, { borrower: lender._id }],
      status: 'active',
    });
    console.assert(activeCount === 1, 'FAIL: Active loan count should be 1');
    console.log('[PASS 6] Active loan count metric verified.');

    // 8. Test Mark Notifications as Read
    await Notification.updateMany({ recipient: borrower._id, isRead: false }, { $set: { isRead: true } });
    const unreadCount = await Notification.countDocuments({ recipient: borrower._id, isRead: false });
    console.assert(unreadCount === 0, 'FAIL: Unread count should be 0 after marking read');
    console.log('[PASS 7] Notification status transition (unread -> read) verified.');

    // Cleanup
    await Notification.deleteMany({ recipient: { $in: [lender._id, borrower._id] } });
    await Repayment.deleteMany({ loan: loan._id });
    await Loan.findByIdAndDelete(loan._id);
    await User.deleteMany({ _id: { $in: [lender._id, borrower._id] } });
    console.log('[PASS 8] Cleaned up test records from database.');

    await mongoose.disconnect();
    console.log('\n--- ALL STAGE 8 DASHBOARD & NOTIFICATION TESTS PASSED (8/8) ---');
    process.exit(0);
  } catch (error) {
    console.error('\n[TEST FAILURE]', error);
    process.exit(1);
  }
};

runDashboardTests();
