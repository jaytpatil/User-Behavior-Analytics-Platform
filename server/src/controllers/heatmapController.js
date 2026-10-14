import { fetchHeatmapData } from '../services/heatmapService.js';

/**
 * Fetch click coordinates for a specific page URL.
 * GET /api/heatmap?url=<encoded-page-url>
 */
export const getHeatmap = async (req, res, next) => {
  try {
    const { url, limit = 2000 } = req.query;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'url' is required (e.g. /api/heatmap?url=http%3A%2F%2Flocalhost%3A5173%2Fdemo)",
      });
    }

    const data = await fetchHeatmapData({ url, limit });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
