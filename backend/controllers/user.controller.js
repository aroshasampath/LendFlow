import mongoose from 'mongoose';
import { User } from '../models/User.model.js';

/**
 * Helper to escape special regex characters for safe search queries
 */
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

/**
 * 1. Get Authenticated User Profile
 * GET /api/users/me
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          bio: user.bio,
          avatar: user.avatar,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          mfaEnabled: user.mfa.enabled,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Update Authenticated User Profile
 * PUT /api/users/me
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const { fullName, phoneNumber, bio, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    // Validate inputs
    if (fullName !== undefined) {
      if (!fullName.trim() || fullName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Full name must be at least 2 characters long.',
        });
      }
      user.fullName = fullName.trim();
    }

    if (phoneNumber !== undefined) {
      if (!/^\+?[0-9\s\-()]{7,20}$/.test(phoneNumber.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid phone number.',
        });
      }
      user.phoneNumber = phoneNumber.trim();
    }

    if (bio !== undefined) {
      if (bio.length > 500) {
        return res.status(400).json({
          success: false,
          message: 'Bio cannot exceed 500 characters.',
        });
      }
      user.bio = bio.trim();
    }

    if (avatar !== undefined) {
      user.avatar = avatar.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Your profile has been updated successfully.',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          bio: user.bio,
          avatar: user.avatar,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          mfaEnabled: user.mfa.enabled,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Search Users (Privacy-Preserving)
 * GET /api/users/search?q=...&page=1&limit=10
 */
export const searchUsers = async (req, res, next) => {
  try {
    const query = req.query.q ? req.query.q.trim() : '';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(25, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    if (!query) {
      return res.status(200).json({
        success: true,
        data: {
          users: [],
          pagination: { total: 0, page, totalPages: 0, hasMore: false },
        },
      });
    }

    const searchConditions = [];

    // 1. Check if query is a valid MongoDB ObjectId (for searching by unique User ID)
    if (mongoose.Types.ObjectId.isValid(query)) {
      searchConditions.push({ _id: new mongoose.Types.ObjectId(query) });
    }

    // 2. Search by Username or Full Name (case-insensitive safe regex)
    const safeRegex = new RegExp(escapeRegex(query), 'i');
    searchConditions.push({ username: safeRegex });
    searchConditions.push({ fullName: safeRegex });

    // Exclude current authenticated user from search results
    const filter = {
      _id: { $ne: req.user._id },
      $or: searchConditions,
    };

    // Strictly select public non-sensitive fields
    const publicFields = 'fullName username avatar bio createdAt _id';

    const [users, total] = await Promise.all([
      User.find(filter).select(publicFields).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          totalPages,
          hasMore: page < totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Get Public User Profile (Privacy-Preserving)
 * GET /api/users/profile/:identifier
 */
export const getPublicProfile = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'User identifier is required.',
      });
    }

    let filter = {};
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      filter = { _id: identifier };
    } else {
      filter = { username: identifier.toLowerCase().trim() };
    }

    // Strictly project public fields. NEVER expose email, phone, passwords, or tokens.
    const user = await User.findOne(filter).select('fullName username avatar bio createdAt _id');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'We could not find this user profile.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          avatar: user.avatar,
          bio: user.bio,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
