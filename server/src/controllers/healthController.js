import { isDbConnected } from '../config/db.js';

/**
 * Health check endpoint providing service & database status without leaking secrets.
 * GET /api/health
 */
export const getHealth = (req, res) => {
  const connected = isDbConnected();

  res.status(connected ? 200 : 503).json({
    success: connected,
    status: connected ? 'healthy' : 'degraded',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: connected ? 'connected' : 'disconnected',
    },
    version: '1.0.0',
  });
};
