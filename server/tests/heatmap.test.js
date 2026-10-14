import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Event from '../src/models/Event.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

beforeAll(async () => {
  process.env.USE_MEMORY_DB = 'true';
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  await Event.deleteMany({});
});

describe('Heatmap & Discovery APIs', () => {
  it('should fetch click coordinates for a given page URL', async () => {
    const targetUrl = 'http://localhost:5173/demo';
    const otherUrl = 'http://localhost:5173/demo/about';

    await Event.insertMany([
      {
        event_id: 'c1',
        session_id: 's1',
        event_type: 'click',
        page_url: targetUrl,
        click_x: 150,
        click_y: 250,
        viewport_width: 1440,
        viewport_height: 900,
        timestamp: new Date(),
      },
      {
        event_id: 'c2',
        session_id: 's2',
        event_type: 'click',
        page_url: targetUrl,
        click_x: 320,
        click_y: 450,
        viewport_width: 1440,
        viewport_height: 900,
        timestamp: new Date(),
      },
      {
        event_id: 'pv1',
        session_id: 's1',
        event_type: 'page_view', // should NOT be returned in heatmap
        page_url: targetUrl,
        timestamp: new Date(),
      },
      {
        event_id: 'c3',
        session_id: 's3',
        event_type: 'click',
        page_url: otherUrl, // different URL
        click_x: 50,
        click_y: 50,
        timestamp: new Date(),
      },
    ]);

    const res = await request(app).get(`/api/heatmap?url=${encodeURIComponent(targetUrl)}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total_clicks).toBe(2);
    expect(res.body.data.clicks.length).toBe(2);
    expect(res.body.data.clicks[0].click_x).toBeDefined();
    expect(res.body.data.clicks[0].click_y).toBeDefined();
  });

  it('should reject missing url parameter on GET /api/heatmap', async () => {
    const res = await request(app).get('/api/heatmap');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return distinct pages list on GET /api/pages', async () => {
    await Event.insertMany([
      {
        event_id: 'p1',
        session_id: 's1',
        event_type: 'click',
        page_url: 'http://localhost:5173/demo',
        click_x: 10,
        click_y: 10,
        timestamp: new Date(),
      },
      {
        event_id: 'p2',
        session_id: 's1',
        event_type: 'page_view',
        page_url: 'http://localhost:5173/demo/cart',
        timestamp: new Date(),
      },
    ]);

    const res = await request(app).get('/api/pages');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  it('should return health status on GET /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('healthy');
    expect(res.body.database.status).toBe('connected');
  });
});
