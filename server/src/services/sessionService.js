import Event from '../models/Event.js';

/**
 * Fetch aggregated sessions with pagination and search.
 */
export const fetchSessions = async ({ page = 1, limit = 10, search = '' }) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const matchStage = {};
  if (search && search.trim()) {
    matchStage.session_id = { $regex: search.trim(), $options: 'i' };
  }

  const pipeline = [
    ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
    {
      $group: {
        _id: '$session_id',
        first_event_at: { $min: '$timestamp' },
        last_event_at: { $max: '$timestamp' },
        total_events: { $sum: 1 },
        page_views: {
          $sum: { $cond: [{ $eq: ['$event_type', 'page_view'] }, 1, 0] },
        },
        total_clicks: {
          $sum: { $cond: [{ $eq: ['$event_type', 'click'] }, 1, 0] },
        },
        pages_set: { $addToSet: '$page_url' },
      },
    },
    {
      $project: {
        _id: 0,
        session_id: '$_id',
        first_event_at: 1,
        last_event_at: 1,
        total_events: 1,
        page_views: 1,
        total_clicks: 1,
        unique_pages: { $size: '$pages_set' },
      },
    },
    {
      $sort: { last_event_at: -1 },
    },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: skip }, { $limit: limitNum }],
      },
    },
  ];

  const [result] = await Event.aggregate(pipeline);

  const total = result.metadata[0] ? result.metadata[0].total : 0;
  const sessions = result.data.map((s) => ({
    ...s,
    duration_seconds: Math.round(
      (new Date(s.last_event_at).getTime() - new Date(s.first_event_at).getTime()) / 1000
    ),
  }));

  return {
    sessions,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * Fetch all events for a specific session ordered chronologically.
 */
export const fetchSessionEvents = async (sessionId, { page = 1, limit = 100 }) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(500, parseInt(limit, 10) || 100));
  const skip = (pageNum - 1) * limitNum;

  // Check if any events exist for this session
  const total = await Event.countDocuments({ session_id: sessionId });

  if (total === 0) {
    return null;
  }

  const events = await Event.find({ session_id: sessionId })
    .sort({ timestamp: 1, _id: 1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  // Compute summary for this session
  const summaryPipeline = [
    { $match: { session_id: sessionId } },
    {
      $group: {
        _id: '$session_id',
        first_event_at: { $min: '$timestamp' },
        last_event_at: { $max: '$timestamp' },
        total_events: { $sum: 1 },
        page_views: {
          $sum: { $cond: [{ $eq: ['$event_type', 'page_view'] }, 1, 0] },
        },
        total_clicks: {
          $sum: { $cond: [{ $eq: ['$event_type', 'click'] }, 1, 0] },
        },
        pages_set: { $addToSet: '$page_url' },
      },
    },
    {
      $project: {
        _id: 0,
        session_id: '$_id',
        first_event_at: 1,
        last_event_at: 1,
        total_events: 1,
        page_views: 1,
        total_clicks: 1,
        unique_pages: { $size: '$pages_set' },
      },
    },
  ];

  const [summary] = await Event.aggregate(summaryPipeline);
  if (summary) {
    summary.duration_seconds = Math.round(
      (new Date(summary.last_event_at).getTime() - new Date(summary.first_event_at).getTime()) / 1000
    );
  }

  return {
    session_id: sessionId,
    summary,
    events,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};
