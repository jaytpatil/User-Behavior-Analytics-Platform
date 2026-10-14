import Event from '../models/Event.js';

/**
 * Fetch high-level analytics overview metrics.
 */
export const fetchOverviewStats = async () => {
  const [counts] = await Event.aggregate([
    {
      $group: {
        _id: null,
        total_events: { $sum: 1 },
        page_views: {
          $sum: { $cond: [{ $eq: ['$event_type', 'page_view'] }, 1, 0] },
        },
        total_clicks: {
          $sum: { $cond: [{ $eq: ['$event_type', 'click'] }, 1, 0] },
        },
        unique_sessions_set: { $addToSet: '$session_id' },
        unique_pages_set: { $addToSet: '$page_url' },
      },
    },
    {
      $project: {
        _id: 0,
        total_events: 1,
        page_views: 1,
        total_clicks: 1,
        total_sessions: { $size: '$unique_sessions_set' },
        unique_pages: { $size: '$unique_pages_set' },
      },
    },
  ]);

  const defaultStats = {
    total_sessions: 0,
    total_events: 0,
    page_views: 0,
    total_clicks: 0,
    unique_pages: 0,
  };

  const overview = counts || defaultStats;

  // Recent 7 days or hourly activity distribution
  const activityDistribution = await Event.aggregate([
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d %H:00', date: '$timestamp' },
        },
        page_views: {
          $sum: { $cond: [{ $eq: ['$event_type', 'page_view'] }, 1, 0] },
        },
        clicks: {
          $sum: { $cond: [{ $eq: ['$event_type', 'click'] }, 1, 0] },
        },
        total: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 24 },
    {
      $project: {
        _id: 0,
        time_slot: '$_id',
        page_views: 1,
        clicks: 1,
        total: 1,
      },
    },
  ]);

  // Top pages summary
  const topPages = await Event.aggregate([
    {
      $group: {
        _id: '$page_url',
        views: { $sum: { $cond: [{ $eq: ['$event_type', 'page_view'] }, 1, 0] } },
        clicks: { $sum: { $cond: [{ $eq: ['$event_type', 'click'] }, 1, 0] } },
        total: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 5 },
    {
      $project: {
        _id: 0,
        url: '$_id',
        views: 1,
        clicks: 1,
        total: 1,
      },
    },
  ]);

  return {
    ...overview,
    activityDistribution,
    topPages,
  };
};
