import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  searchUsers,
  getPublicProfile,
} from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All user routes require an active authenticated session
router.use(requireAuth);

router.get('/me', getMyProfile);
router.put('/me', updateMyProfile);
router.get('/search', searchUsers);
router.get('/profile/:identifier', getPublicProfile);

export default router;

