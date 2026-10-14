import { Router } from 'express';
import { getSessions, getSessionDetails } from '../controllers/sessionController.js';

const router = Router();

// GET /api/sessions - List aggregated sessions
router.get('/', getSessions);

// GET /api/sessions/:sessionId/events - Fetch chronological events for a session
router.get('/:sessionId/events', getSessionDetails);

export default router;
