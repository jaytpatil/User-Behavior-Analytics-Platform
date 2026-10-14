import Event from '../models/Event.js';

/**
 * Ingest and store a tracking event.
 */
export const recordEvent = async (eventData) => {
  const event = new Event({
    event_id: eventData.event_id,
    session_id: eventData.session_id,
    event_type: eventData.event_type,
    page_url: eventData.page_url,
    timestamp: new Date(eventData.timestamp),
    click_x: eventData.click_x,
    click_y: eventData.click_y,
    viewport_width: eventData.viewport_width,
    viewport_height: eventData.viewport_height,
    page_title: eventData.page_title || '',
    referrer: eventData.referrer || '',
    element_tag: eventData.element_tag || '',
    element_id: eventData.element_id || null,
  });

  return await event.save();
};
