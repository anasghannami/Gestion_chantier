import { Router } from 'express';
import { getKpis } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/kpi', getKpis);

export default router;
