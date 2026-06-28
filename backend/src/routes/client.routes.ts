import { Router } from 'express';
import {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/client.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, listClients);
router.get('/:id', authMiddleware, getClient);
router.post('/', authMiddleware, createClient);
router.put('/:id', authMiddleware, updateClient);
router.delete('/:id', authMiddleware, deleteClient);

export default router;