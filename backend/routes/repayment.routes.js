import express from 'express';
import {
  submitRepayment,
  confirmRepayment,
  rejectRepayment,
  getLoanRepayments,
  getMyRepayments,
} from '../controllers/repayment.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All repayment operations require active user session
router.use(requireAuth);

router.post('/', submitRepayment);
router.post('/:id/confirm', confirmRepayment);
router.post('/:id/reject', rejectRepayment);
router.get('/loan/:loanId', getLoanRepayments);
router.get('/', getMyRepayments);

export default router;
