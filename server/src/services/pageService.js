import Event from '../models/Event.js';

/**
 * Fetch distinct pages that have recorded events with summary metrics.
 */
export const fetchDistinctPages = async () => {
  const pages = await Event.aggregate([
    {
      $group: {
        _id: '$page_url',
        total_events: { $sum: 1 },
        page_views: {
          $sum: { $cond: [{ $eq: ['$event_type', 'page_view'] }, 1, 0] },
        },
        total_clicks: {
          $sum: { $cond: [{ $eq: ['$event_type', 'click'] }, 1, 0] },
        },
        last_event_at: { $max: '$timestamp' },
      },
    },
    {
      $project: {
        _id: 0,
        url: '$_id',
        total_events: 1,
        page_views: 1,
        total_clicks: 1,
        last_event_at: 1,
      },
    },
    {
      $sort: { total_clicks: -1, total_events: -1 },
    },
  ]);

  return pages;
};
