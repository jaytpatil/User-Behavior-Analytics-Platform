import { validateEventPayload } from '../validators/eventValidator.js';

/**
 * Middleware to validate event tracking payload
 */
export const validateEvent = (req, res, next) => {
  const { isValid, errors } = validateEventPayload(req.body);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  next();
};
