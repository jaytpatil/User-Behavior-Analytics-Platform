import { Router } from 'express';
import { postEvent } from '../controllers/eventController.js';
import { validateEvent } from '../middleware/validate.js';
import { eventRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Ingest tracking events
router.post('/', eventRateLimiter, validateEvent, postEvent);

export default router;
