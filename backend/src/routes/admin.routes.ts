import { Router } from 'express';
import { listUsers, createUser, deleteUser, resetUserData } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/users', authMiddleware, listUsers);
router.post('/users', authMiddleware, createUser);
router.delete('/users/:id', authMiddleware, deleteUser);
router.post('/users/:id/reset', authMiddleware, resetUserData);

export default router;