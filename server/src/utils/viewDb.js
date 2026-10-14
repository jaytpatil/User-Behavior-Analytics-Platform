import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Event from '../models/Event.js';
import { connectDB, disconnectDB } from '../config/db.js';

const viewDatabase = async () => {
  try {
    await connectDB();

    const totalEvents = await Event.countDocuments();
    const pageViews = await Event.countDocuments({ event_type: 'page_view' });
    const clicks = await Event.countDocuments({ event_type: 'click' });
    const distinctSessions = await Event.distinct('session_id');
    const distinctPages = await Event.distinct('page_url');

    console.log('\n==================================================');
    console.log('       CAUSALFUNNEL MONGODB INSPECTOR            ');
    console.log('==================================================');
    console.log(`Database Name:     ${mongoose.connection.name}`);
    console.log(`Collection Name:   ${Event.collection.name}`);
    console.log(`Total Events:      ${totalEvents}`);
    console.log(`  - Page Views:    ${pageViews}`);
    console.log(`  - Clicks:        ${clicks}`);
    console.log(`Total Sessions:    ${distinctSessions.length}`);
    console.log(`Distinct Pages:    ${distinctPages.length}`);
    console.log('--------------------------------------------------');

    if (totalEvents === 0) {
      console.log('No events in database yet. Run "npm run seed" to add demo data.');
    } else {
      console.log('\n--- LATEST 5 RECORDED EVENTS ---');
      const recentEvents = await Event.find()
        .sort({ timestamp: -1 })
        .limit(5)
        .lean();

      recentEvents.forEach((evt, idx) => {
        console.log(`\n[${idx + 1}] Event ID: ${evt.event_id}`);
        console.log(`    Session ID: ${evt.session_id}`);
        console.log(`    Type:       ${evt.event_type}`);
        console.log(`    Page URL:   ${evt.page_url}`);
        console.log(`    Timestamp:  ${new Date(evt.timestamp).toISOString()}`);
        if (evt.event_type === 'click') {
          console.log(`    Coordinates: (${evt.click_x}px, ${evt.click_y}px)`);
          console.log(`    Viewport:    ${evt.viewport_width}x${evt.viewport_height}`);
          console.log(`    Element:     <${evt.element_tag}> #${evt.element_id || 'none'}`);
        }
      });
    }

    console.log('\n==================================================\n');
  } catch (error) {
    console.error('Failed to inspect database:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

viewDatabase();
