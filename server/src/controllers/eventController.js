import { recordEvent } from '../services/eventService.js';

/**
 * Handle incoming tracking events (page_view, click).
 * POST /api/events
 */
export const postEvent = async (req, res, next) => {
  try {
    const savedEvent = await recordEvent(req.body);

    return res.status(201).json({
      success: true,
      message: 'Event recorded successfully',
      data: {
        event_id: savedEvent.event_id,
        session_id: savedEvent.session_id,
        event_type: savedEvent.event_type,
        page_url: savedEvent.page_url,
        timestamp: savedEvent.timestamp,
      },
    });
  } catch (error) {
    // If it's a duplicate event_id error, return 409 Conflict with descriptive message
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: `Duplicate event_id '${req.body.event_id}'. Event has already been processed.`,
        error: 'DUPLICATE_EVENT_ID',
      });
    }
    next(error);
  }
};
