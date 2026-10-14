import { fetchOverviewStats } from '../services/statsService.js';

/**
 * Fetch high-level analytics overview numbers and distributions.
 * GET /api/stats/overview
 */
export const getOverviewStats = async (req, res, next) => {
  try {
    const stats = await fetchOverviewStats();
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
