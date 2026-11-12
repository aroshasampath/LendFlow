import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';

export const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization Bearer header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // 3. Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Your account could not be found or has been deactivated.',
      });
    }

    // 4. Verify MFA if enabled on user account
    if (user.mfa.enabled && !decoded.mfaVerified) {
      return res.status(403).json({
        success: false,
        mfaRequired: true,
        message: 'Two-factor authentication verification is required.',
      });
    }

    // 5. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Something went wrong on our side. Please try again later.',
    });
  }
};
