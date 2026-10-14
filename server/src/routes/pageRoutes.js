import { Router } from 'express';
import { getPages } from '../controllers/pageController.js';

const router = Router();

// GET /api/pages - List distinct pages with event counts
router.get('/', getPages);

export default router;
