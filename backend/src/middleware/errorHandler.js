import { apiResponse } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return apiResponse.error(res, err.message, 400, err.errors);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return apiResponse.unauthorized(res, 'Invalid token');
  }

  // Handle token expiration
  if (err.name === 'TokenExpiredError') {
    return apiResponse.unauthorized(res, 'Token expired');
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return apiResponse.notFound(res, 'Resource not found');
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    return apiResponse.error(res, 'Duplicate field value entered', 400);
  }

  // Handle other errors
  return apiResponse.error(
    res,
    err.message || 'Internal Server Error',
    err.statusCode || 500,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
};