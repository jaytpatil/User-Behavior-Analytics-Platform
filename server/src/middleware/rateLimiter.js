import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for event ingestion endpoint
 * Allows high throughput for user tracking while preventing DDoS abuse
 */
export const eventRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 event submissions per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many events submitted from this IP, please try again later.',
  },
});

/**
 * General API rate limiter for data retrieval
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many API requests from this IP, please try again later.',
  },
});
