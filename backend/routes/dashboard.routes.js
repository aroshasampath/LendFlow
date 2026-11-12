import express from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/summary', getDashboardSummary);

export default router;
