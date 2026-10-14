import { Router } from 'express';
import { getOverviewStats } from '../controllers/statsController.js';

const router = Router();

// GET /api/stats/overview - High-level metrics for overview dashboard
router.get('/overview', getOverviewStats);

export default router;
