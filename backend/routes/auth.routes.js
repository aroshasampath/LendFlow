import express from 'express';
import {
  register,
  login,
  validateMfaLogin,
  refreshToken,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  setupMfa,
  verifyAndEnableMfa,
  disableMfa,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public authentication routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/mfa/validate-login', authLimiter, validateMfaLogin);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);
router.post('/verify-email', verifyEmail);

// Protected routes (require authenticated session)
router.get('/me', requireAuth, getMe);
router.post('/change-password', requireAuth, changePassword);
router.post('/mfa/setup', requireAuth, setupMfa);
router.post('/mfa/enable', requireAuth, verifyAndEnableMfa);
router.post('/mfa/disable', requireAuth, disableMfa);

export default router;
