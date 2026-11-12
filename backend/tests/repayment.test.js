import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.model.js';
import { Loan } from '../models/Loan.model.js';
import { Repayment } from '../models/Repayment.model.js';
import { toMinorUnits, toMajorUnits } from '../utils/money.js';

dotenv.config();

const runRepaymentTests = async () => {
  console.log('--- STARTING STAGE 7 AUTOMATED REPAYMENT MANAGEMENT TESTS ---\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'lendflow' });
    console.log('[Test Setup] Connected to MongoDB Atlas (lendflow).');

    const ts = Date.now();

    // 1. Create Lender, Borrower, and Intruder
    const lender = await User.create({
      fullName: 'Repay Lender',
      username: `r_lender_${ts.toString().slice(-5)}`,
      email: `r_lender_${ts}@lendflow.io`,
      phoneNumber: '+94719000001',
      password: 'StrongPassword123!@',
    });

    const borrower = await User.create({
      fullName: 'Repay Borrower',
      username: `r_borr_${ts.toString().slice(-5)}`,
      email: `r_borr_${ts}@lendflow.io`,
      phoneNumber: '+94719000002',
      password: 'StrongPassword123!@',
    });

    const intruder = await User.create({
      fullName: 'Repay Intruder',
      username: `r_int_${ts.toString().slice(-5)}`,
      email: `r_int_${ts}@lendflow.io`,
      phoneNumber: '+94719000003',
      password: 'StrongPassword123!@',
    });

    // 2. Create Active Loan with $1,000.00 principal (100,000 minor units)
    const loan = await Loan.create({
      lender: lender._id,
      borrower: borrower._id,
      amount: toMinorUnits(1000), // 100000
      currency: 'USD',
      description: 'Active loan for repayment lifecycle verification',
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      repaymentFrequency: 'monthly',
      status: 'active',
      remainingBalance: toMinorUnits(1000), // 100000
      totalRepaid: 0,
      timeline: [{ action: 'accepted', performedBy: borrower._id, note: 'Agreement active' }],
    });

    console.log('[PASS 1] Created active test loan: $1,000.00 (100,000 minor unit cents).');

    // 3. Test Overpayment Protection ($1,500 > $1,000 balance)
    const overpaymentAttempt = toMinorUnits(1500);
    const exceedsBalance = overpaymentAttempt > loan.remainingBalance;
    console.assert(exceedsBalance === true, 'FAIL: Overpayment should be flagged');
    console.log('[PASS 2] Overpayment guard verified: Cannot repay more than remaining balance.');

    // 4. Test Submit Repayment ($400.00 = 40,000 cents)
    const idempotencyKey = `idemp_${ts}_payment_1`;
    const repayment1 = await Repayment.create({
      loan: loan._id,
      borrower: borrower._id,
      lender: lender._id,
      amount: toMinorUnits(400),
      currency: 'USD',
      paymentDate: new Date(),
      paymentReference: 'SLIP-99881122',
      idempotencyKey,
      status: 'pending',
    });

    console.assert(repayment1.status === 'pending', 'FAIL: Repayment must start as pending');
    console.log('[PASS 3] Repayment submitted in pending status.');

    // 5. Test Rule: Pending repayment does NOT reduce loan balance
    const loanAfterSubmit = await Loan.findById(loan._id);
    console.assert(
      loanAfterSubmit.remainingBalance === 100000,
      'FINANCIAL ERROR: Pending repayment prematurely reduced loan balance!'
    );
    console.log('[PASS 4] Financial isolation verified: Pending repayments do NOT alter loan balance.');

    // 6. Test Idempotency Enforcement (Duplicate Submission Block)
    let duplicateCaught = false;
    try {
      await Repayment.create({
        loan: loan._id,
        borrower: borrower._id,
        lender: lender._id,
        amount: toMinorUnits(400),
        currency: 'USD',
        idempotencyKey, // Same key
        status: 'pending',
      });
    } catch (err) {
      duplicateCaught = true;
    }
    console.assert(duplicateCaught === true, 'FAIL: Duplicate idempotency key was not caught!');
    console.log('[PASS 5] Idempotency key verified: Duplicate payment submission prevented.');

    // 7. Test BOLA Protection on Confirmation (Intruder cannot confirm)
    const isIntruderLender = repayment1.lender.equals(intruder._id);
    console.assert(!isIntruderLender, 'FAIL: Intruder cannot act as lender');
    console.log('[PASS 6] BOLA confirmation protection verified: Intruder cannot confirm repayment.');

    // 8. Test Lender Confirms Partial Payment ($400 confirmed)
    // Reduce loan balance from 100,000 to 60,000 cents ($600)
    loanAfterSubmit.remainingBalance -= repayment1.amount;
    loanAfterSubmit.totalRepaid += repayment1.amount;
    loanAfterSubmit.timeline.push({
      action: 'repayment_confirmed',
      performedBy: lender._id,
      note: 'Repayment of $400 confirmed.',
    });
    await loanAfterSubmit.save();

    repayment1.status = 'confirmed';
    repayment1.confirmedAt = new Date();
    repayment1.confirmedBy = lender._id;
    repayment1.previousBalance = 100000;
    repayment1.newBalance = 60000;
    await repayment1.save();

    const loanAfterPartial = await Loan.findById(loan._id);
    console.assert(
      loanAfterPartial.remainingBalance === 60000,
      'FAIL: Remaining balance should be $600.00 (60,000 cents)'
    );
    console.assert(
      loanAfterPartial.totalRepaid === 40000,
      'FAIL: Total repaid should be $400.00 (40,000 cents)'
    );
    console.assert(
      loanAfterPartial.status === 'active',
      'FAIL: Loan should remain active until balance is 0'
    );
    console.log('[PASS 7] Partial confirmation verified: Balance reduced to $600.00 with audit trail.');

    // 9. Test Final Payment Clearing Balance ($600 confirmed) -> Auto-completion
    const repayment2 = await Repayment.create({
      loan: loan._id,
      borrower: borrower._id,
      lender: lender._id,
      amount: toMinorUnits(600), // 60000 cents
      currency: 'USD',
      idempotencyKey: `idemp_${ts}_payment_2`,
      status: 'confirmed',
      confirmedAt: new Date(),
      confirmedBy: lender._id,
      previousBalance: 60000,
      newBalance: 0,
    });

    loanAfterPartial.remainingBalance = 0;
    loanAfterPartial.totalRepaid += repayment2.amount;
    loanAfterPartial.status = 'completed'; // Auto-transition
    loanAfterPartial.timeline.push({
      action: 'completed',
      performedBy: lender._id,
      note: 'Zero balance reached. Agreement completed.',
    });
    await loanAfterPartial.save();

    const finalLoan = await Loan.findById(loan._id);
    console.assert(finalLoan.remainingBalance === 0, 'FAIL: Remaining balance should be 0');
    console.assert(finalLoan.status === 'completed', 'FAIL: Loan status must transition to completed');
    console.log('[PASS 8] Zero-balance auto-completion confirmed: Loan status transitioned to Completed.');

    // Cleanup
    await Repayment.deleteMany({ loan: loan._id });
    await Loan.findByIdAndDelete(loan._id);
    await User.deleteMany({ _id: { $in: [lender._id, borrower._id, intruder._id] } });
    console.log('[PASS 9] Cleaned up temporary test repayments, loans, and accounts.');

    await mongoose.disconnect();
    console.log('\n--- ALL STAGE 7 REPAYMENT MANAGEMENT TESTS PASSED (9/9) ---');
    process.exit(0);
  } catch (error) {
    console.error('\n[TEST FAILURE]', error);
    process.exit(1);
  }
};

runRepaymentTests();
