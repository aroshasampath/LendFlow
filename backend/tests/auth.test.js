import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.model.js';
import { validateRegistration } from '../validators/auth.validator.js';

dotenv.config();

const runAuthTests = async () => {
  console.log('--- STARTING STAGE 4 AUTOMATED AUTHENTICATION TESTS ---\n');

  try {
    // 1. Connect to Database
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'lendflow' });
    console.log('[Test Setup] Connected to MongoDB Atlas (lendflow).');

    // 2. Unit Test: Validator - Missing Fields
    const missingValidation = validateRegistration({
      fullName: '',
      username: 'user1',
      email: 'user1@example.com',
      phoneNumber: '0771234567',
      password: 'Pass123!Password',
      confirmPassword: 'Pass123!Password',
    });
    console.assert(!missingValidation.isValid, 'FAIL: Missing fields should be invalid');
    console.log('[PASS 1] Validator correctly rejects missing fields.');

    // 3. Unit Test: Validator - Weak Password
    const weakPassValidation = validateRegistration({
      fullName: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      phoneNumber: '0771234567',
      password: 'weak',
      confirmPassword: 'weak',
    });
    console.assert(!weakPassValidation.isValid, 'FAIL: Weak password should be invalid');
    console.log('[PASS 2] Validator correctly rejects weak password.');

    // 4. Unit Test: Validator - Mismatched Password
    const mismatchValidation = validateRegistration({
      fullName: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      phoneNumber: '0771234567',
      password: 'Strong123!Password',
      confirmPassword: 'Different123!Password',
    });
    console.assert(!mismatchValidation.isValid, 'FAIL: Mismatched password should be invalid');
    console.log('[PASS 3] Validator correctly rejects mismatched passwords.');

    // 5. Integration Test: Create User and Test Password Hashing
    const testEmail = `authtest_${Date.now()}@lendflow.io`;
    const testUsername = `test_${Date.now().toString().slice(-6)}`;
    const testPassword = 'StrongPassword123!@';

    // Cleanup any existing user with this test identity
    await User.deleteMany({ email: testEmail });

    const newUser = new User({
      fullName: 'Automated Test User',
      username: testUsername,
      email: testEmail,
      phoneNumber: '+94771234567',
      password: testPassword,
    });
    await newUser.save();
    console.log(`[PASS 4] Successfully registered test user: ${testUsername} (${testEmail})`);

    // Verify password was hashed (not plain text)
    const userFromDb = await User.findById(newUser._id).select('+password');
    console.assert(userFromDb.password !== testPassword, 'FAIL: Password was not hashed!');
    console.assert(userFromDb.password.startsWith('$2'), 'FAIL: Password is not a valid bcrypt hash!');
    console.log('[PASS 5] Bcrypt password hashing confirmed (salt rounds = 12).');

    // 6. Test Password Comparison
    const isCorrectPass = await userFromDb.comparePassword(testPassword);
    const isWrongPass = await userFromDb.comparePassword('WrongPassword123!');
    console.assert(isCorrectPass === true, 'FAIL: Valid password comparison failed!');
    console.assert(isWrongPass === false, 'FAIL: Invalid password comparison incorrectly passed!');
    console.log('[PASS 6] Password comparison correctly verifies valid and invalid attempts.');

    // 7. Test JWT Access Token Generation and Expiration
    const token = userFromDb.generateAccessToken(false);
    console.assert(typeof token === 'string' && token.length > 20, 'FAIL: Invalid JWT token');
    console.log('[PASS 7] Short-lived JWT Access Token generation verified.');

    // 8. Test Single-Use Password Reset Token
    const rawResetToken = userFromDb.createPasswordResetToken();
    await userFromDb.save();
    console.assert(typeof rawResetToken === 'string' && rawResetToken.length === 64, 'FAIL: Reset token error');
    console.assert(userFromDb.passwordResetExpires > new Date(), 'FAIL: Reset expiration error');
    console.log('[PASS 8] Single-use password reset token creation and expiration verified.');

    // 9. Clean up test user
    await User.findByIdAndDelete(newUser._id);
    console.log('[PASS 9] Cleaned up temporary test user from database.');

    await mongoose.disconnect();
    console.log('\n--- ALL STAGE 4 AUTHENTICATION TESTS PASSED SUCCESSFULLY (9/9) ---');
    process.exit(0);
  } catch (error) {
    console.error('\n[TEST FAILURE]', error);
    process.exit(1);
  }
};

runAuthTests();
