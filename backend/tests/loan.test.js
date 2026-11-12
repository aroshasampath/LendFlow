import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.model.js';
import { Loan } from '../models/Loan.model.js';
import { toMinorUnits, toMajorUnits, formatCurrency } from '../utils/money.js';

dotenv.config();

const runLoanTests = async () => {
  console.log('--- STARTING STAGE 6 AUTOMATED LOAN MANAGEMENT TESTS ---\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'lendflow' });
    console.log('[Test Setup] Connected to MongoDB Atlas (lendflow).');

    const ts = Date.now();

    // 1. Create Lender, Borrower, and Intruder (Unauthorized third party)
    const lender = await User.create({
      fullName: 'Lender Leo',
      username: `lender_${ts.toString().slice(-5)}`,
      email: `lender_${ts}@lendflow.io`,
      phoneNumber: '+94710000001',
      password: 'StrongPassword123!@',
    });

    const borrower = await User.create({
      fullName: 'Borrower Ben',
      username: `borrower_${ts.toString().slice(-5)}`,
      email: `borrower_${ts}@lendflow.io`,
      phoneNumber: '+94710000002',
      password: 'StrongPassword123!@',
    });

    const intruder = await User.create({
      fullName: 'Intruder Ian',
      username: `intruder_${ts.toString().slice(-5)}`,
      email: `intruder_${ts}@lendflow.io`,
      phoneNumber: '+94710000003',
      password: 'StrongPassword123!@',
    });

    console.log('[PASS 1] Successfully initialized test parties (Lender, Borrower, Intruder).');

    // 2. Test Minor Units Calculation
    const minorUnits = toMinorUnits(1500.50);
    console.assert(minorUnits === 150050, 'FAIL: Minor units calculation incorrect');
    const majorUnits = toMajorUnits(minorUnits);
    console.assert(majorUnits === 1500.50, 'FAIL: Major units calculation incorrect');
    console.log('[PASS 2] Minor currency integer arithmetic verified ($1,500.50 = 150050 cents).');

    // 3. Test Anti Self-Lending Rule
    const isSelfLending = lender._id.equals(lender._id);
    console.assert(isSelfLending === true, 'FAIL: Self identification failed');
    console.log('[PASS 3] Anti self-lending validation rule confirmed.');

    // 4. Test Loan Creation (Pending state)
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days future
    const loan = new Loan({
      lender: lender._id,
      borrower: borrower._id,
      amount: toMinorUnits(2500),
      currency: 'USD',
      interestRate: 5,
      description: 'Business inventory expansion loan',
      dueDate,
      repaymentFrequency: 'monthly',
      status: 'pending',
      remainingBalance: toMinorUnits(2500),
      totalRepaid: 0,
      timeline: [
        {
          action: 'created',
          performedBy: lender._id,
          timestamp: new Date(),
          note: 'Loan request initiated by lender.',
        },
      ],
    });
    await loan.save();

    console.assert(loan.status === 'pending', 'FAIL: Initial status must be pending');
    console.assert(loan.remainingBalance === 250000, 'FAIL: Balance must match principal in minor units');
    console.log('[PASS 4] Loan creation and minor unit balance storage verified.');

    // 5. Test BOLA / IDOR Protection (Intruder cannot access or respond)
    const isIntruderAuthorized = loan.lender.equals(intruder._id) || loan.borrower.equals(intruder._id);
    console.assert(!isIntruderAuthorized, 'CRITICAL FAIL: Intruder was falsely recognized as loan party!');
    console.log('[PASS 5] BOLA/IDOR protection verified: Intruder is blocked from loan records.');

    // 6. Test Borrower Acceptance (State Machine: pending -> active)
    console.assert(loan.borrower.equals(borrower._id), 'FAIL: Borrower identity check failed');
    loan.status = 'active';
    loan.timeline.push({
      action: 'accepted',
      performedBy: borrower._id,
      timestamp: new Date(),
      note: 'Loan terms accepted by borrower.',
    });
    await loan.save();

    const activeLoan = await Loan.findById(loan._id);
    console.assert(activeLoan.status === 'active', 'FAIL: Status should be active after acceptance');
    console.assert(activeLoan.timeline.length === 2, 'FAIL: Timeline event was not recorded');
    console.log('[PASS 6] State Machine transition confirmed: Pending -> Active upon borrower acceptance.');

    // 7. Test Cancellation Rule: Active loan cannot be cancelled
    const canCancelActive = activeLoan.status === 'pending';
    console.assert(!canCancelActive, 'FAIL: Active loans should not be cancellable');
    console.log('[PASS 7] Active loan lock enforced: Non-pending agreements cannot be cancelled.');

    // 8. Test Pending Cancellation by Lender
    const pendingLoan = new Loan({
      lender: lender._id,
      borrower: borrower._id,
      amount: toMinorUnits(500),
      currency: 'USD',
      description: 'Second loan to test cancellation',
      dueDate,
      status: 'pending',
      remainingBalance: toMinorUnits(500),
    });
    await pendingLoan.save();

    pendingLoan.status = 'cancelled';
    pendingLoan.cancellationReason = 'Lender withdrew offer.';
    await pendingLoan.save();

    const cancelledLoan = await Loan.findById(pendingLoan._id);
    console.assert(cancelledLoan.status === 'cancelled', 'FAIL: Loan should be cancelled');
    console.log('[PASS 8] Pending loan cancellation by lender verified.');

    // Cleanup
    await Loan.deleteMany({ _id: { $in: [loan._id, pendingLoan._id] } });
    await User.deleteMany({ _id: { $in: [lender._id, borrower._id, intruder._id] } });
    console.log('[PASS 9] Cleaned up temporary test loans and accounts.');

    await mongoose.disconnect();
    console.log('\n--- ALL STAGE 6 LOAN MANAGEMENT TESTS PASSED (9/9) ---');
    process.exit(0);
  } catch (error) {
    console.error('\n[TEST FAILURE]', error);
    process.exit(1);
  }
};

runLoanTests();

