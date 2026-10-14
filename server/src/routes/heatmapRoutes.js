import { Router } from 'express';
import { getHeatmap } from '../controllers/heatmapController.js';

const router = Router();

// GET /api/heatmap?url=<encoded-url>
router.get('/', getHeatmap);

export default router;
