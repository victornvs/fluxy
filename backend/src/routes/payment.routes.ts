import { Router } from 'express';
import {
  listPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
} from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, listPayments);
router.get('/:id', authMiddleware, getPayment);
router.post('/', authMiddleware, createPayment);
router.put('/:id', authMiddleware, updatePayment);
router.delete('/:id', authMiddleware, deletePayment);

export default router;
