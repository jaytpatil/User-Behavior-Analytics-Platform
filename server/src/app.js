import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import eventRoutes from './routes/eventRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import heatmapRoutes from './routes/heatmapRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalApiLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security headers with Helmet (allow cross-origin embedding of tracker.js)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration: Allow client application and any demo origin
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5000']
  : '*';

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, tracker script tags)
      if (!origin) return callback(null, true);
      if (allowedOrigins === '*' || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for local hiring assignment demo
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing with size limits
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Serve tracking SDK script directly at /tracker.js
app.use('/tracker.js', (req, res) => {
  const trackerPath = path.resolve(__dirname, '../public/tracker.js');
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.sendFile(trackerPath);
});

// Also serve public directory statically
app.use(express.static(path.resolve(__dirname, '../public')));

// Mount API routes
app.use('/api/events', eventRoutes);
app.use('/api/sessions', generalApiLimiter, sessionRoutes);
app.use('/api/heatmap', generalApiLimiter, heatmapRoutes);
app.use('/api/pages', generalApiLimiter, pageRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/stats', generalApiLimiter, statsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'CausalFunnel Analytics API',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: [
      'POST /api/events',
      'GET /api/sessions',
      'GET /api/sessions/:sessionId/events',
      'GET /api/heatmap?url=<encoded-url>',
      'GET /api/pages',
      'GET /api/stats/overview',
      'GET /api/health',
      'GET /tracker.js',
    ],
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    error: 'NOT_FOUND',
  });
});

// Centralized error handling
app.use(errorHandler);

export default app;
