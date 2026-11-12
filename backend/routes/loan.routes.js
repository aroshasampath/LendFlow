import express from 'express';
import {
  createLoan,
  getMyLoans,
  getLoanById,
  respondToLoanRequest,
  cancelLoanRequest,
} from '../controllers/loan.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All loan endpoints require an active authenticated user session
router.use(requireAuth);

router.post('/', createLoan);
router.get('/', getMyLoans);
router.get('/:id', getLoanById);
router.post('/:id/respond', respondToLoanRequest);
router.post('/:id/cancel', cancelLoanRequest);

export default router;
