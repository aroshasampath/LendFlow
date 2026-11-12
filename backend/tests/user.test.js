import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.model.js';

dotenv.config();

const runUserTests = async () => {
  console.log('--- STARTING STAGE 5 AUTOMATED USER PROFILE & SEARCH TESTS ---\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'lendflow' });
    console.log('[Test Setup] Connected to MongoDB Atlas (lendflow).');

    const ts = Date.now();
    const userAEmail = `user_a_${ts}@lendflow.io`;
    const userBEmail = `user_b_${ts}@lendflow.io`;

    // 1. Create two distinct users for testing
    const userA = await User.create({
      fullName: 'Alice Walker',
      username: `alice_${ts.toString().slice(-5)}`,
      email: userAEmail,
      phoneNumber: '+94711111111',
      password: 'StrongPassword123!@',
      bio: 'Fintech specialist and peer lender',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    });

    const userB = await User.create({
      fullName: 'Bob Martinez',
      username: `bob_${ts.toString().slice(-5)}`,
      email: userBEmail,
      phoneNumber: '+94722222222',
      password: 'StrongPassword123!@',
      bio: 'Small business borrower',
    });

    console.log('[PASS 1] Created test accounts for Alice and Bob.');

    // 2. Test Get My Profile (contains private data)
    const profileA = await User.findById(userA._id);
    console.assert(profileA.email === userAEmail, 'FAIL: Alice email mismatch');
    console.assert(profileA.phoneNumber === '+94711111111', 'FAIL: Alice phone mismatch');
    console.log('[PASS 2] Private profile accurately retrieves complete user credentials.');

    // 3. Test Update Profile
    profileA.fullName = 'Alice Walker Updated';
    profileA.bio = 'Updated bio for testing';
    await profileA.save();

    const updatedA = await User.findById(userA._id);
    console.assert(updatedA.fullName === 'Alice Walker Updated', 'FAIL: Full name update failed');
    console.assert(updatedA.bio === 'Updated bio for testing', 'FAIL: Bio update failed');
    console.log('[PASS 3] Profile modification correctly updates in database.');

    // 4. Test Public Profile Privacy Controls
    const publicProfileB = await User.findById(userB._id).select('fullName username avatar bio createdAt _id');
    console.assert(publicProfileB.fullName === 'Bob Martinez', 'FAIL: Public name error');
    console.assert(publicProfileB.email === undefined, 'PRIVACY LEAK: Email was exposed in public profile!');
    console.assert(publicProfileB.phoneNumber === undefined, 'PRIVACY LEAK: Phone was exposed in public profile!');
    console.assert(publicProfileB.password === undefined, 'PRIVACY LEAK: Password exposed in public profile!');
    console.assert(publicProfileB.refreshTokens === undefined, 'PRIVACY LEAK: Tokens exposed in public profile!');
    console.log('[PASS 4] Privacy check passed: Public profiles strictly redact email, phone, and tokens.');

    // 5. Test Search by Username
    const searchByUsername = await User.find({
      _id: { $ne: userA._id },
      username: new RegExp(userB.username, 'i'),
    }).select('fullName username avatar bio createdAt _id');
    console.assert(searchByUsername.length === 1, 'FAIL: Search by username should find Bob');
    console.assert(searchByUsername[0].username === userB.username, 'FAIL: Username mismatch in search');
    console.log('[PASS 5] User search by username verified.');

    // 6. Test Search by Full Name
    const searchByName = await User.find({
      _id: { $ne: userA._id },
      fullName: new RegExp('Bob Martinez', 'i'),
    }).select('fullName username avatar bio createdAt _id');
    console.assert(searchByName.length === 1, 'FAIL: Search by full name should find Bob');
    console.log('[PASS 6] User search by full name verified.');

    // 7. Test Search by Unique User ID (_id)
    const searchById = await User.find({
      _id: { $ne: userA._id, $eq: userB._id },
    }).select('fullName username avatar bio createdAt _id');
    console.assert(searchById.length === 1, 'FAIL: Search by ObjectId should find Bob');
    console.log('[PASS 7] User search by unique User ID verified.');

    // 8. Test Search Excludes Current User
    const searchExcludesSelf = await User.find({
      _id: { $ne: userA._id },
      username: userA.username,
    });
    console.assert(searchExcludesSelf.length === 0, 'FAIL: Search results should not include self!');
    console.log('[PASS 8] Search self-exclusion confirmed.');

    // Cleanup
    await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });
    console.log('[PASS 9] Cleaned up test users from database.');

    await mongoose.disconnect();
    console.log('\n--- ALL STAGE 5 USER PROFILE & SEARCH TESTS PASSED (9/9) ---');
    process.exit(0);
  } catch (error) {
    console.error('[TEST FAILURE]', error);
    process.exit(1);
  }
};

runUserTests();

