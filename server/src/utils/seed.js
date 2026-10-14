import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Event from '../models/Event.js';
import { connectDB, disconnectDB } from '../config/db.js';

const DEMO_PAGES = [
  'http://localhost:5173/demo',
  'http://localhost:5173/demo/products',
  'http://localhost:5173/demo/product/1',
  'http://localhost:5173/demo/cart',
  'http://localhost:5173/demo/checkout',
];

const BUTTON_TARGETS = [
  { tag: 'BUTTON', id: 'btn-hero-shop-now', x: 280, y: 320 },
  { tag: 'BUTTON', id: 'btn-add-cart-1', x: 260, y: 580 },
  { tag: 'BUTTON', id: 'btn-add-cart-2', x: 580, y: 580 },
  { tag: 'BUTTON', id: 'btn-add-cart-3', x: 900, y: 580 },
  { tag: 'A', id: 'nav-products', x: 450, y: 28 },
  { tag: 'A', id: 'nav-cart', x: 550, y: 28 },
  { tag: 'BUTTON', id: 'btn-checkout', x: 720, y: 640 },
  { tag: 'DIV', id: 'card-prod-1', x: 240, y: 460 },
  { tag: 'BUTTON', id: 'btn-filter-category', x: 180, y: 160 },
];

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 1280, height: 800 },
];

export const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing existing events...');
    await Event.deleteMany({});

    console.log('Generating realistic demo sessions and events...');
    const events = [];
    const now = Date.now();

    // Generate 15 distinct user sessions
    for (let s = 1; s <= 15; s++) {
      const sessionId = `sess_${s.toString().padStart(3, '0')}_${Math.random().toString(36).substring(2, 9)}`;
      const viewport = VIEWPORTS[s % VIEWPORTS.length];

      // Session starts somewhere in the past 24 hours
      const sessionStartTime = now - (16 - s) * 90 * 60 * 1000;
      let currentTime = sessionStartTime;

      // 1 to 4 pages visited in this session
      const pagesToVisit = DEMO_PAGES.slice(0, 1 + (s % 5));

      for (let p = 0; p < pagesToVisit.length; p++) {
        const pageUrl = pagesToVisit[p];

        // 1. Page view event
        events.push({
          event_id: `evt_pv_${s}_${p}_${Math.random().toString(36).substring(2, 8)}`,
          session_id: sessionId,
          event_type: 'page_view',
          page_url: pageUrl,
          timestamp: new Date(currentTime),
          viewport_width: viewport.width,
          viewport_height: viewport.height,
          page_title: `Demo Store - ${pageUrl.split('/').pop() || 'Home'}`,
          referrer: p === 0 ? 'https://google.com' : pagesToVisit[p - 1],
        });

        // 2. Several clicks on this page (2 to 6 clicks)
        const numClicks = 2 + (s % 5);
        for (let c = 0; c < numClicks; c++) {
          currentTime += 3000 + Math.floor(Math.random() * 8000); // 3-11 seconds later
          const target = BUTTON_TARGETS[(s + p + c) % BUTTON_TARGETS.length];

          // Add realistic jitter around the button position
          const jitterX = Math.floor(Math.random() * 40) - 20;
          const jitterY = Math.floor(Math.random() * 20) - 10;

          events.push({
            event_id: `evt_ck_${s}_${p}_${c}_${Math.random().toString(36).substring(2, 8)}`,
            session_id: sessionId,
            event_type: 'click',
            page_url: pageUrl,
            timestamp: new Date(currentTime),
            click_x: Math.max(10, target.x + jitterX),
            click_y: Math.max(10, target.y + jitterY),
            viewport_width: viewport.width,
            viewport_height: viewport.height,
            element_tag: target.tag,
            element_id: target.id,
          });
        }

        currentTime += 10000 + Math.floor(Math.random() * 15000); // delay before next page
      }
    }

    await Event.insertMany(events);
    console.log(`Successfully seeded ${events.length} events across 15 sessions!`);
    return events.length;
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
};

// If run directly via node src/utils/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(() => disconnectDB())
    .then(() => {
      console.log('Seeding finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
