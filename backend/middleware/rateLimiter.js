import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication routes (Login & Registration)
 * Max 15 attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please wait a moment and try again later.',
  },
});

/**
 * Rate limiter for sensitive password reset requests
 * Max 5 attempts per 60 minutes per IP
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset requests. Please wait a while before requesting again.',
  },
});

