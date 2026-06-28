import { Router } from 'express';
import {
  getDashboardSummary,
  getGrowthIndicators,
  getMonthlyHistory,
  getUpcomingPayments,
  getUpcomingDeliveries,
  getActiveClients,
  getFullDashboard,
} from '../controllers/business.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All business routes require authentication
router.get('/dashboard', authMiddleware, getFullDashboard);
router.get('/summary', authMiddleware, getDashboardSummary);
router.get('/growth', authMiddleware, getGrowthIndicators);
router.get('/history', authMiddleware, getMonthlyHistory);
router.get('/payments/upcoming', authMiddleware, getUpcomingPayments);
router.get('/deliveries/upcoming', authMiddleware, getUpcomingDeliveries);
router.get('/clients/active', authMiddleware, getActiveClients);

export default router;