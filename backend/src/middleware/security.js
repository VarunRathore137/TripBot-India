import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import config from '../config/app.js';

// Rate limiting middleware
export const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
  },
});

// Security middleware configuration
export const securityMiddleware = [
  // Basic security headers
  helmet(),
  
  // Prevent parameter pollution
  (req, res, next) => {
    if (req.query) {
      req.query = Object.fromEntries(
        Object.entries(req.query).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
      );
    }
    next();
  },

  // Request size limits
  (req, res, next) => {
    if (req.headers['content-length'] && parseInt(req.headers['content-length']) > 10 * 1024 * 1024) { // 10MB
      return res.status(413).json({
        status: 'error',
        message: 'Request entity too large',
      });
    }
    next();
  },

  // Validate content type for POST/PUT/PATCH requests
  (req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.is('application/json')) {
      return res.status(415).json({
        status: 'error',
        message: 'Unsupported media type. Please send JSON data.',
      });
    }
    next();
  },
];