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

describe('Session APIs', () => {
  it('should correctly aggregate sessions from raw events', async () => {
    const t1 = new Date('2026-10-14T10:00:00Z');
    const t2 = new Date('2026-10-14T10:05:00Z');
    const t3 = new Date('2026-10-14T10:10:00Z');

    await Event.insertMany([
      {
        event_id: 'e1',
        session_id: 'session_alpha',
        event_type: 'page_view',
        page_url: 'http://localhost:5173/demo',
        timestamp: t1,
      },
      {
        event_id: 'e2',
        session_id: 'session_alpha',
        event_type: 'click',
        page_url: 'http://localhost:5173/demo',
        click_x: 100,
        click_y: 200,
        timestamp: t2,
      },
      {
        event_id: 'e3',
        session_id: 'session_alpha',
        event_type: 'page_view',
        page_url: 'http://localhost:5173/demo/cart',
        timestamp: t3,
      },
      {
        event_id: 'e4',
        session_id: 'session_beta',
        event_type: 'page_view',
        page_url: 'http://localhost:5173/demo',
        timestamp: t1,
      },
    ]);

    const res = await request(app).get('/api/sessions');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);

    const alpha = res.body.data.find((s) => s.session_id === 'session_alpha');
    expect(alpha).toBeDefined();
    expect(alpha.total_events).toBe(3);
    expect(alpha.page_views).toBe(2);
    expect(alpha.total_clicks).toBe(1);
    expect(alpha.unique_pages).toBe(2);
    expect(alpha.duration_seconds).toBe(600); // 10 minutes
  });

  it('should retrieve chronological events for a specific session', async () => {
    const t1 = new Date('2026-10-14T12:00:00Z');
    const t2 = new Date('2026-10-14T12:02:00Z');

    await Event.insertMany([
      {
        event_id: 'ev_later',
        session_id: 'session_ordered',
        event_type: 'click',
        page_url: 'http://localhost:5173/demo',
        click_x: 50,
        click_y: 60,
        timestamp: t2,
      },
      {
        event_id: 'ev_earlier',
        session_id: 'session_ordered',
        event_type: 'page_view',
        page_url: 'http://localhost:5173/demo',
        timestamp: t1,
      },
    ]);

    const res = await request(app).get('/api/sessions/session_ordered/events');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    // Chronological order: earlier event first
    expect(res.body.data[0].event_id).toBe('ev_earlier');
    expect(res.body.data[1].event_id).toBe('ev_later');
    expect(res.body.summary.total_events).toBe(2);
  });

  it('should return 404 for an unknown session ID', async () => {
    const res = await request(app).get('/api/sessions/non_existent_session_id/events');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
