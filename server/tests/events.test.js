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

describe('POST /api/events', () => {
  it('should successfully ingest a valid page_view event', async () => {
    const payload = {
      event_id: 'evt_pv_101',
      session_id: 'sess_user_1',
      event_type: 'page_view',
      page_url: 'http://localhost:5173/demo',
      timestamp: new Date().toISOString(),
      page_title: 'Demo Store',
      referrer: 'https://google.com',
    };

    const res = await request(app).post('/api/events').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.event_id).toBe('evt_pv_101');

    const saved = await Event.findOne({ event_id: 'evt_pv_101' });
    expect(saved).not.toBeNull();
    expect(saved.event_type).toBe('page_view');
  });

  it('should successfully ingest a valid click event with coordinates', async () => {
    const payload = {
      event_id: 'evt_ck_201',
      session_id: 'sess_user_1',
      event_type: 'click',
      page_url: 'http://localhost:5173/demo',
      timestamp: new Date().toISOString(),
      click_x: 240,
      click_y: 180,
      viewport_width: 1440,
      viewport_height: 900,
      element_tag: 'BUTTON',
      element_id: 'btn-add-cart',
    };

    const res = await request(app).post('/api/events').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.event_type).toBe('click');

    const saved = await Event.findOne({ event_id: 'evt_ck_201' });
    expect(saved.click_x).toBe(240);
    expect(saved.click_y).toBe(180);
    expect(saved.element_tag).toBe('BUTTON');
  });

  it('should reject an unsupported event_type', async () => {
    const payload = {
      event_id: 'evt_bad_01',
      session_id: 'sess_user_1',
      event_type: 'hover', // unsupported
      page_url: 'http://localhost:5173/demo',
      timestamp: new Date().toISOString(),
    };

    const res = await request(app).post('/api/events').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.some((e) => e.includes('event_type'))).toBe(true);
  });

  it('should reject a click event with missing click coordinates', async () => {
    const payload = {
      event_id: 'evt_bad_02',
      session_id: 'sess_user_1',
      event_type: 'click',
      page_url: 'http://localhost:5173/demo',
      timestamp: new Date().toISOString(),
      // missing click_x and click_y
    };

    const res = await request(app).post('/api/events').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.some((e) => e.includes('click_x'))).toBe(true);
  });

  it('should reject invalid or non-absolute page_url', async () => {
    const payload = {
      event_id: 'evt_bad_03',
      session_id: 'sess_user_1',
      event_type: 'page_view',
      page_url: 'not-a-valid-url',
      timestamp: new Date().toISOString(),
    };

    const res = await request(app).post('/api/events').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.some((e) => e.includes('page_url'))).toBe(true);
  });

  it('should return 409 Conflict when submitting duplicate event_id', async () => {
    const payload = {
      event_id: 'evt_duplicate_test',
      session_id: 'sess_user_dup',
      event_type: 'page_view',
      page_url: 'http://localhost:5173/demo',
      timestamp: new Date().toISOString(),
    };

    // First submission
    const res1 = await request(app).post('/api/events').send(payload);
    expect(res1.status).toBe(201);

    // Duplicate submission
    const res2 = await request(app).post('/api/events').send(payload);
    expect(res2.status).toBe(409);
    expect(res2.body.success).toBe(false);
    expect(res2.body.error).toBe('DUPLICATE_EVENT_ID');
  });
});
