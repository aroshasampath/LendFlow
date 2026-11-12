import assert from 'assert';
import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import app from '../server.js';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler.js';

dotenv.config();

console.log('--- STARTING STAGE 10 AUTOMATED ERROR HANDLING TESTS ---');

async function runTests() {
  await connectDB();
  console.log('[Test Setup] Connected to MongoDB Atlas for error simulation.');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Non-existent route (404 Not Found Handler)
    {
      const res = await fetch(`${baseUrl}/api/non-existent-endpoint-xyz`);
      const body = await res.json();
      assert.strictEqual(res.status, 404, 'Non-existent route should return 404');
      assert.strictEqual(body.success, false, 'success should be false');
      assert.ok(
        body.message.includes('could not be found'),
        'Friendly message for 404 expected'
      );
      console.log('[PASS 1] 404 Not Found handler returns sanitized JSON with zero technical leakage.');
    }

    // 2. Invalid ObjectId (CastError handling)
    {
      const res = await fetch(`${baseUrl}/api/loans/not_a_valid_mongo_id`);
      const body = await res.json();
      // Should return 401 (unauthorized because no token) or 404 (if unauthed allowed)
      assert.ok(
        res.status === 401 || res.status === 404 || res.status === 400,
        'Should return 401/404/400 without 500 crash'
      );
      assert.strictEqual(body.success, false);
      assert.ok(!JSON.stringify(body).includes('CastError'), 'Must not leak CastError name to client');
      console.log('[PASS 2] Invalid ID query handled cleanly without raw CastError leak.');
    }

    // 3. Centralized errorHandler directly: Mongoose CastError mapping
    {
      const fakeReq = { method: 'GET', originalUrl: '/api/loans/507f1f77bcf86cd799439011' };
      let capturedStatus = 0;
      let capturedJson = null;
      const fakeRes = {
        status: (code) => {
          capturedStatus = code;
          return fakeRes;
        },
        json: (payload) => {
          capturedJson = payload;
          return fakeRes;
        },
      };

      const castError = new Error('Cast to ObjectId failed for value "invalid" at path "_id" for model "Loan"');
      castError.name = 'CastError';

      errorHandler(castError, fakeReq, fakeRes, () => {});

      assert.strictEqual(capturedStatus, 404, 'CastError should be mapped to 404');
      assert.strictEqual(capturedJson.success, false);
      assert.strictEqual(
        capturedJson.message,
        'The requested item could not be found with that identifier.'
      );
      assert.ok(!JSON.stringify(capturedJson).includes('Cast to ObjectId failed'), 'No internal Mongoose dump');
      console.log('[PASS 3] CastError correctly mapped to user-friendly 404 with friendly explanation.');
    }

    // 4. Centralized errorHandler: Duplicate Key (E11000) for email
    {
      const fakeReq = { method: 'POST', originalUrl: '/api/auth/register' };
      let capturedStatus = 0;
      let capturedJson = null;
      const fakeRes = {
        status: (code) => {
          capturedStatus = code;
          return fakeRes;
        },
        json: (payload) => {
          capturedJson = payload;
          return fakeRes;
        },
      };

      const duplicateEmailError = new Error('E11000 duplicate key error collection: lendflow.users index: email_1 dup key');
      duplicateEmailError.code = 11000;
      duplicateEmailError.keyValue = { email: 'existing@lendflow.io' };

      errorHandler(duplicateEmailError, fakeReq, fakeRes, () => {});

      assert.strictEqual(capturedStatus, 409, 'Duplicate key should be mapped to 409');
      assert.strictEqual(capturedJson.success, false);
      assert.ok(
        capturedJson.message.includes('email address already exists'),
        'Duplicate email error message should advise user friendly action'
      );
      assert.ok(!JSON.stringify(capturedJson).includes('E11000'), 'Must not leak E11000 code in message');
      console.log('[PASS 4] Duplicate email error mapped to actionable 409 conflict message.');
    }

    // 5. Centralized errorHandler: Duplicate Key (E11000) for username
    {
      const fakeReq = { method: 'POST', originalUrl: '/api/auth/register' };
      let capturedStatus = 0;
      let capturedJson = null;
      const fakeRes = {
        status: (code) => {
          capturedStatus = code;
          return fakeRes;
        },
        json: (payload) => {
          capturedJson = payload;
          return fakeRes;
        },
      };

      const duplicateUsernameError = new Error('E11000 duplicate key error collection: lendflow.users index: username_1 dup key');
      duplicateUsernameError.code = 11000;
      duplicateUsernameError.keyValue = { username: 'testuser' };

      errorHandler(duplicateUsernameError, fakeReq, fakeRes, () => {});

      assert.strictEqual(capturedStatus, 409);
      assert.strictEqual(
        capturedJson.message,
        'This username is already taken. Please choose another username.'
      );
      console.log('[PASS 5] Duplicate username error mapped to clean, user-friendly 409 response.');
    }

    // 6. Centralized errorHandler: JWT Token Expired / Invalid
    {
      const fakeReq = { method: 'GET', originalUrl: '/api/loans' };
      let capturedStatus = 0;
      let capturedJson = null;
      const fakeRes = {
        status: (code) => {
          capturedStatus = code;
          return fakeRes;
        },
        json: (payload) => {
          capturedJson = payload;
          return fakeRes;
        },
      };

      const jwtExpiredError = new Error('jwt expired');
      jwtExpiredError.name = 'TokenExpiredError';

      errorHandler(jwtExpiredError, fakeReq, fakeRes, () => {});

      assert.strictEqual(capturedStatus, 401);
      assert.strictEqual(
        capturedJson.message,
        'Your session has expired. Please log in again to continue.'
      );
      console.log('[PASS 6] JWT TokenExpiredError correctly mapped to user-friendly 401 prompt.');
    }

    // 7. Centralized errorHandler: Mongoose Schema ValidationError
    {
      const fakeReq = { method: 'POST', originalUrl: '/api/loans' };
      let capturedStatus = 0;
      let capturedJson = null;
      const fakeRes = {
        status: (code) => {
          capturedStatus = code;
          return fakeRes;
        },
        json: (payload) => {
          capturedJson = payload;
          return fakeRes;
        },
      };

      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      validationError.errors = {
        amount: { message: 'Loan amount must be at least $1.00.' },
        dueDate: { message: 'Due date must be in the future.' },
      };

      errorHandler(validationError, fakeReq, fakeRes, () => {});

      assert.strictEqual(capturedStatus, 400);
      assert.strictEqual(capturedJson.message, 'Loan amount must be at least $1.00.');
      assert.deepStrictEqual(capturedJson.errors, [
        'Loan amount must be at least $1.00.',
        'Due date must be in the future.',
      ]);
      console.log('[PASS 7] Mongoose ValidationError neatly extracted into friendly messages array.');
    }

    // 8. Centralized errorHandler: Zero-Leakage Policy in Production Mode
    {
      const oldEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const fakeReq = { method: 'GET', originalUrl: '/api/internal/test?token=SECRET_12345' };
      let capturedStatus = 0;
      let capturedJson = null;
      const fakeRes = {
        status: (code) => {
          capturedStatus = code;
          return fakeRes;
        },
        json: (payload) => {
          capturedJson = payload;
          return fakeRes;
        },
      };

      const internalError = new Error('Database connection failed: FATAL at /var/www/internal.js:45');

      errorHandler(internalError, fakeReq, fakeRes, () => {});

      assert.strictEqual(capturedStatus, 500);
      assert.strictEqual(
        capturedJson.message,
        'Something went wrong on our end. Please try again shortly.'
      );
      assert.strictEqual(capturedJson._devDebug, undefined, 'Must not leak _devDebug in production');
      assert.strictEqual(capturedJson.stack, undefined, 'Must not leak stack traces');

      process.env.NODE_ENV = oldEnv;
      console.log('[PASS 8] Production Zero-Leakage verified: Internal 500 errors stripped of stack traces and internal paths.');
    }

    console.log('\n--- ALL STAGE 10 ERROR HANDLING TESTS PASSED (8/8) ---');
  } finally {
    server.close();
    await mongoose.connection.close();
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
