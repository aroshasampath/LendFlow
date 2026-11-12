import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { User } from '../models/User.model.js';
import { validateRegistration, validatePasswordChange } from '../validators/auth.validator.js';

// Helper: Set secure HttpOnly cookie for Refresh Token
const setRefreshTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProduction, // HTTPS in production
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth',
  });
};

// Helper: Generate and persist Refresh Token with rotation
const createAndStoreRefreshToken = async (user, req) => {
  const rawToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Remove expired tokens from user document to keep array clean
  user.refreshTokens = user.refreshTokens.filter((t) => t.expiresAt > new Date());

  user.refreshTokens.push({
    tokenHash,
    createdAt: new Date(),
    expiresAt,
    userAgent: req.headers['user-agent'] || '',
    ip: req.ip || '',
  });

  await user.save();
  return rawToken;
};

/**
 * 1. Register User
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { fullName, username, email, phoneNumber, password, confirmPassword } = req.body;

    // Validate inputs
    const validation = validateRegistration({
      fullName,
      username,
      email,
      phoneNumber,
      password,
      confirmPassword,
    });

    if (!validation.isValid) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    // Check if email or username is already taken
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { username: username.toLowerCase().trim() }],
    });

    if (existingUser) {
      const isEmailTaken = existingUser.email === email.toLowerCase().trim();
      return res.status(409).json({
        success: false,
        message: isEmailTaken
          ? 'This email address is already registered.'
          : 'This username is already taken. Please choose another.',
      });
    }

    // Create user
    const user = new User({
      fullName: fullName.trim(),
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      password,
    });

    // Create email verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save();

    // Generate Tokens
    const accessToken = user.generateAccessToken(false);
    const refreshToken = await createAndStoreRefreshToken(user, req);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({
      success: true,
      message: 'Your account has been created successfully.',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          mfaEnabled: user.mfa.enabled,
        },
        accessToken,
        // In development, provide simulated verification token
        ...(process.env.NODE_ENV !== 'production' && { _devEmailVerificationToken: verificationToken }),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Login User
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { loginIdentifier, password } = req.body;

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your email/username and password.',
      });
    }

    const cleanIdentifier = loginIdentifier.toLowerCase().trim();

    // Find user by email or username, explicitly selecting password and mfa secrets
    const user = await User.findOne({
      $or: [{ email: cleanIdentifier }, { username: cleanIdentifier }],
    }).select('+password +mfa.secret +refreshTokens');

    // Generic error protects against account enumeration
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email or password is incorrect. Please try again.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email or password is incorrect. Please try again.',
      });
    }

    // Check if MFA is enabled
    if (user.mfa.enabled) {
      const tempToken = jwt.sign(
        { userId: user._id, mfaPending: true },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '5m' }
      );

      return res.status(200).json({
        success: true,
        mfaRequired: true,
        tempToken,
        message: 'Please enter the 6-digit verification code from your authenticator app.',
      });
    }

    // Normal successful login
    const accessToken = user.generateAccessToken(true);
    const refreshToken = await createAndStoreRefreshToken(user, req);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: 'You have logged in successfully.',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          mfaEnabled: user.mfa.enabled,
        },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Validate MFA during Login
 * POST /api/auth/mfa/validate-login
 */
export const validateMfaLogin = async (req, res, next) => {
  try {
    const { tempToken, totpCode } = req.body;

    if (!tempToken || !totpCode) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_ACCESS_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Your verification session has expired. Please log in again.',
      });
    }

    const user = await User.findById(decoded.userId).select('+mfa.secret +refreshTokens');
    if (!user || !user.mfa.enabled) {
      return res.status(401).json({
        success: false,
        message: 'Unable to verify two-factor authentication.',
      });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.mfa.secret,
      encoding: 'base32',
      token: totpCode.trim(),
      window: 1, // Allow 30s clock drift
    });

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'The verification code you entered is invalid. Please check and try again.',
      });
    }

    const accessToken = user.generateAccessToken(true);
    const refreshToken = await createAndStoreRefreshToken(user, req);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Two-factor verification confirmed.',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          mfaEnabled: user.mfa.enabled,
        },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Refresh Access Token with Token Rotation
 * POST /api/auth/refresh-token
 */
export const refreshToken = async (req, res, next) => {
  try {
    const rawToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!rawToken) {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Find user containing this hashed token
    const user = await User.findOne({
      'refreshTokens.tokenHash': tokenHash,
    }).select('+refreshTokens');

    // Compromise detection: If token isn't found, check if it was reused
    if (!user) {
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
    }

    // Check expiration of the matching token
    const tokenRecord = user.refreshTokens.find((t) => t.tokenHash === tokenHash);
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      // Remove expired token
      user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== tokenHash);
      await user.save();
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
    }

    // ROTATION: Remove used token and issue a fresh one
    user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== tokenHash);

    const newAccessToken = user.generateAccessToken(true);
    const newRefreshToken = await createAndStoreRefreshToken(user, req);
    setRefreshTokenCookie(res, newRefreshToken);

    return res.status(200).json({
      success: true,
      message: 'Session refreshed successfully.',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Logout User
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    const rawToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (rawToken) {
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      await User.updateOne(
        { 'refreshTokens.tokenHash': tokenHash },
        { $pull: { refreshTokens: { tokenHash } } }
      );
    }

    res.clearCookie('refreshToken', { path: '/api/auth' });

    return res.status(200).json({
      success: true,
      message: 'You have been logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Get Current Authenticated Profile
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        username: req.user.username,
        email: req.user.email,
        phoneNumber: req.user.phoneNumber,
        role: req.user.role,
        avatar: req.user.avatar,
        bio: req.user.bio,
        isEmailVerified: req.user.isEmailVerified,
        mfaEnabled: req.user.mfa.enabled,
        createdAt: req.user.createdAt,
      },
    },
  });
};

/**
 * 7. Forgot Password
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your registered email address.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    let resetToken = null;
    if (user) {
      resetToken = user.createPasswordResetToken();
      await user.save();
    }

    // Generic response prevents account enumeration
    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email address, a password reset link has been sent.',
      ...(process.env.NODE_ENV !== 'production' && resetToken && { _devPasswordResetToken: resetToken }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 8. Reset Password
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword, confirmNewPassword } = req.body;

    if (!token || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required fields.',
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match. Please verify and try again.',
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=~`[\]{}|\\:;"'<>,.?/]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          'Please choose a stronger password. It must be at least 8 characters long and contain an uppercase letter, lowercase letter, number, and special character.',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+password +refreshTokens');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'The password reset link is invalid or has expired. Please request a new one.',
      });
    }

    // Set new password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // Revoke all sessions across devices for security
    user.refreshTokens = [];
    await user.save();

    res.clearCookie('refreshToken', { path: '/api/auth' });

    return res.status(200).json({
      success: true,
      message: 'Your password has been reset successfully. Please log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 9. Change Password (Authenticated)
 * POST /api/auth/change-password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    const validation = validatePasswordChange({
      currentPassword,
      newPassword,
      confirmNewPassword,
    });

    if (!validation.isValid) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    const user = await User.findById(req.user._id).select('+password +refreshTokens');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Your current password was entered incorrectly.',
      });
    }

    user.password = newPassword;
    // Clear other sessions for security
    user.refreshTokens = [];
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Your password has been changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 10. Verify Email Address
 * POST /api/auth/verify-email
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required.',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'The email verification link is invalid or has expired.',
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Your email address has been verified successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 11. Setup Two-Factor Authentication (TOTP)
 * POST /api/auth/mfa/setup
 */
export const setupMfa = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+mfa.secret');

    const secret = speakeasy.generateSecret({
      name: `LendFlow (${user.email})`,
      issuer: 'LendFlow',
    });

    // Store secret temporarily until user verifies first code
    user.mfa.secret = secret.base32;
    await user.save();

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    return res.status(200).json({
      success: true,
      message: 'Scan this QR code with your authenticator app (e.g. Google Authenticator).',
      data: {
        qrCode: qrCodeDataUrl,
        secretKey: secret.base32,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 12. Verify & Enable MFA
 * POST /api/auth/mfa/enable
 */
export const verifyAndEnableMfa = async (req, res, next) => {
  try {
    const { totpCode } = req.body;

    if (!totpCode) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the 6-digit code from your authenticator app.',
      });
    }

    const user = await User.findById(req.user._id).select('+mfa.secret +mfa.backupCodes');

    if (!user.mfa.secret) {
      return res.status(400).json({
        success: false,
        message: 'Please initiate two-factor setup before verifying.',
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfa.secret,
      encoding: 'base32',
      token: totpCode.trim(),
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'The code you entered is invalid. Please check your app and try again.',
      });
    }

    // Generate 5 emergency backup recovery codes
    const backupCodes = Array.from({ length: 5 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    user.mfa.enabled = true;
    user.mfa.backupCodes = backupCodes;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Two-factor authentication has been enabled successfully.',
      data: {
        backupCodes,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 13. Disable MFA
 * POST /api/auth/mfa/disable
 */
export const disableMfa = async (req, res, next) => {
  try {
    const { password, totpCode } = req.body;

    if (!password || !totpCode) {
      return res.status(400).json({
        success: false,
        message: 'Both your password and authenticator code are required to disable two-factor authentication.',
      });
    }

    const user = await User.findById(req.user._id).select('+password +mfa.secret');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Your password was entered incorrectly.',
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfa.secret,
      encoding: 'base32',
      token: totpCode.trim(),
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'The verification code you entered is invalid.',
      });
    }

    user.mfa.enabled = false;
    user.mfa.secret = undefined;
    user.mfa.backupCodes = [];
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Two-factor authentication has been disabled.',
    });
  } catch (error) {
    next(error);
  }
};

