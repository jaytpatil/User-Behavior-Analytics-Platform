import { fetchSessions, fetchSessionEvents } from '../services/sessionService.js';

/**
 * Fetch all sessions with aggregation statistics.
 * GET /api/sessions
 */
export const getSessions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const result = await fetchSessions({ page, limit, search });

    return res.status(200).json({
      success: true,
      data: result.sessions,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch chronological events for a single session.
 * GET /api/sessions/:sessionId/events
 */
export const getSessionDetails = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { page = 1, limit = 100 } = req.query;

    if (!sessionId || !sessionId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing sessionId parameter',
      });
    }

    const sessionData = await fetchSessionEvents(sessionId.trim(), { page, limit });

    if (!sessionData) {
      return res.status(404).json({
        success: false,
        message: `No events found for session ID '${sessionId}'`,
      });
    }

    return res.status(200).json({
      success: true,
      data: sessionData.events,
      summary: sessionData.summary,
      pagination: sessionData.pagination,
    });
  } catch (error) {
    next(error);
  }
};
