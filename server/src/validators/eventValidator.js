/**
 * Validates tracking event payload before database ingestion.
 * Returns an object { isValid: boolean, errors: string[] }
 */
export const validateEventPayload = (data) => {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a JSON object'] };
  }

  const {
    event_id,
    session_id,
    event_type,
    page_url,
    timestamp,
    click_x,
    click_y,
    viewport_width,
    viewport_height,
  } = data;

  // 1. event_id validation
  if (!event_id || typeof event_id !== 'string' || !event_id.trim()) {
    errors.push('event_id is required and must be a non-empty string');
  }

  // 2. session_id validation
  if (!session_id || typeof session_id !== 'string' || !session_id.trim()) {
    errors.push('session_id is required and must be a non-empty string');
  }

  // 3. event_type validation
  const allowedEventTypes = ['page_view', 'click'];
  if (!event_type || !allowedEventTypes.includes(event_type)) {
    errors.push(`event_type is required and must be one of: ${allowedEventTypes.join(', ')}`);
  }

  // 4. page_url validation
  if (!page_url || typeof page_url !== 'string' || !page_url.trim()) {
    errors.push('page_url is required and must be a valid URL string');
  } else {
    try {
      new URL(page_url);
    } catch {
      errors.push('page_url must be a valid absolute URL (e.g. http://localhost:5173/demo)');
    }
  }

  // 5. timestamp validation
  if (!timestamp) {
    errors.push('timestamp is required');
  } else {
    const parsedDate = new Date(timestamp);
    if (isNaN(parsedDate.getTime())) {
      errors.push('timestamp must be a valid ISO 8601 date string');
    }
  }

  // 6. click event specific validations
  if (event_type === 'click') {
    if (click_x === undefined || click_x === null || typeof click_x !== 'number' || isNaN(click_x) || click_x < 0) {
      errors.push('click_x is required for click events and must be a non-negative number');
    }
    if (click_y === undefined || click_y === null || typeof click_y !== 'number' || isNaN(click_y) || click_y < 0) {
      errors.push('click_y is required for click events and must be a non-negative number');
    }
  }

  // 7. viewport dimensions if provided
  if (viewport_width !== undefined && viewport_width !== null) {
    if (typeof viewport_width !== 'number' || isNaN(viewport_width) || viewport_width < 0) {
      errors.push('viewport_width must be a non-negative number');
    }
  }

  if (viewport_height !== undefined && viewport_height !== null) {
    if (typeof viewport_height !== 'number' || isNaN(viewport_height) || viewport_height < 0) {
      errors.push('viewport_height must be a non-negative number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
