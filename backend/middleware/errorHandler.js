/**
 * LendFlow Centralized Error Handler Middleware
 * Strict Zero-Leakage Policy:
 * Masks internal database structures, query errors, file paths, and stack traces.
 * Guarantees clean, user-friendly, and actionable feedback.
 */

export const errorHandler = (err, req, res, next) => {
  // Safe server-side error logging (redacting any tokens in URL)
  const safeUrl = req.originalUrl?.replace(/(token|password|secret)=([^&]+)/gi, '$1=[REDACTED]');
  console.error(`[LendFlow Server Error] ${req.method} ${safeUrl}:`, err.message);

  let statusCode = err.statusCode || err.status || 500;
  let message = 'Something went wrong on our end. Please try again shortly.';
  let validationErrors = null;

  // 1. Malformed JSON Body (SyntaxError from express.json)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'The submission payload is improperly formatted. Please verify your data and try again.';
  }
  // 2. Mongoose Schema Validation Errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    const extracted = Object.values(err.errors || {}).map((e) => e.message);
    validationErrors = extracted;
    message = extracted[0] || 'Please check the information you entered.';
  }
  // 3. MongoDB Duplicate Key (E11000)
  else if (err.code === 11000) {
    statusCode = 409;
    const duplicateKey = Object.keys(err.keyValue || {})[0];
    if (duplicateKey === 'email') {
      message = 'An account with this email address already exists. Please log in or use a different email.';
    } else if (duplicateKey === 'username') {
      message = 'This username is already taken. Please choose another username.';
    } else if (duplicateKey === 'idempotencyKey') {
      message = 'This transaction has already been submitted and processed.';
    } else {
      message = `This ${duplicateKey || 'record'} is already registered in our system.`;
    }
  }
  // 4. Mongoose Invalid ID (CastError)
  else if (err.name === 'CastError') {
    statusCode = 404;
    message = 'The requested item could not be found with that identifier.';
  }
  // 5. JWT Authentication Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Your session token is invalid. Please log in again to continue.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again to continue.';
  }
  // 6. Explicit 4xx Client Errors with Clean User Messages
  else if (statusCode < 500 && err.message) {
    message = err.message;
  }

  // Build client payload (Zero-leakage: no stack traces or raw tech dumps in production)
  const isDev = process.env.NODE_ENV === 'development';
  const responsePayload = {
    success: false,
    message,
    ...(validationErrors && validationErrors.length > 0 && { errors: validationErrors }),
    ...(isDev && { _devDebug: { name: err.name, message: err.message } }),
  };

  return res.status(statusCode).json(responsePayload);
};

/**
 * 404 Not Found Middleware for unmapped routes
 */
export const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    message: 'The requested resource or endpoint could not be found on this server.',
  });
};
