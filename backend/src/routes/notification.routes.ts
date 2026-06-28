import { Router } from 'express';
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  sendTestWhatsApp,
  generateWeeklyReport,
  generateMonthlyReport,
} from '../controllers/notification.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, listNotifications);
router.put('/:id/read', authMiddleware, markAsRead);
router.put('/read-all', authMiddleware, markAllAsRead);
router.post('/test-whatsapp', authMiddleware, sendTestWhatsApp);
router.post('/weekly-report', authMiddleware, generateWeeklyReport);
router.post('/monthly-report', authMiddleware, generateMonthlyReport);

export default router;