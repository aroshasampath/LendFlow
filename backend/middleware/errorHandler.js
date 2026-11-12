/**
 * Centralized error handling middleware.
 * Maps technical errors into clean, friendly user-facing messages.
 */
export const errorHandler = (err, req, res, next) => {
  // Safe backend console logging for debugging
  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err.message);

  let statusCode = err.statusCode || err.status || 500;
  let message = 'Something went wrong on our side. Please try again later.';

  // Map known technical error types to clean user messages
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Please check the information you entered.';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'This information is already registered. Please check and try again.';
  } else if (err.name === 'CastError') {
    statusCode = 404;
    message = 'The requested resource could not be found.';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired or is invalid. Please log in again.';
  } else if (statusCode < 500 && err.message) {
    message = err.message;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { _devDetails: err.message }),
  });
};

export const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    message: 'The requested resource could not be found.',
  });
};

