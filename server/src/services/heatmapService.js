import Event from '../models/Event.js';

/**
 * Fetch click coordinates and metadata for a specific page URL.
 */
export const fetchHeatmapData = async ({ url, limit = 2000 }) => {
  if (!url || typeof url !== 'string') {
    throw new Error('A valid page URL query parameter is required');
  }

  // Decode URL in case it's URL-encoded
  const decodedUrl = decodeURIComponent(url.trim());

  const limitNum = Math.max(1, Math.min(5000, parseInt(limit, 10) || 2000));

  // Query events matching this page URL and event_type = click
  const query = {
    page_url: decodedUrl,
    event_type: 'click',
  };

  const totalClicks = await Event.countDocuments(query);

  const clicks = await Event.find(query)
    .select('click_x click_y viewport_width viewport_height timestamp session_id element_tag element_id')
    .sort({ timestamp: -1 })
    .limit(limitNum)
    .lean();

  // Aggregate viewport dimensions to help front-end normalize accurately
  const viewportAgg = await Event.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          width: '$viewport_width',
          height: '$viewport_height',
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const viewports = viewportAgg.map((v) => ({
    width: v._id.width || 1440,
    height: v._id.height || 900,
    count: v.count,
  }));

  return {
    page_url: decodedUrl,
    total_clicks: totalClicks,
    returned_clicks: clicks.length,
    viewports,
    clicks,
  };
};
