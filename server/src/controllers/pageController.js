import { fetchDistinctPages } from '../services/pageService.js';

/**
 * Fetch distinct page URLs that have recorded events.
 * GET /api/pages
 */
export const getPages = async (req, res, next) => {
  try {
    const pages = await fetchDistinctPages();
    return res.status(200).json({
      success: true,
      data: pages,
    });
  } catch (error) {
    next(error);
  }
};
