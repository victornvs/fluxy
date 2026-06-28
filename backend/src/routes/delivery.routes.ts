import { Router } from 'express';
import { listDeliveries, createDelivery, updateDelivery, deleteDelivery } from '../controllers/delivery.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, listDeliveries);
router.post('/', authMiddleware, createDelivery);
router.put('/:id', authMiddleware, updateDelivery);
router.delete('/:id', authMiddleware, deleteDelivery);

export default router;