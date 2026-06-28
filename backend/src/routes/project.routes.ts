import { Router } from 'express';
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getPortfolioSummary,
} from '../controllers/project.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/portfolio/summary', authMiddleware, getPortfolioSummary);
router.get('/', authMiddleware, listProjects);
router.get('/:id', authMiddleware, getProject);
router.post('/', authMiddleware, createProject);
router.put('/:id', authMiddleware, updateProject);
router.delete('/:id', authMiddleware, deleteProject);

export default router;