/**
 * Standard API response helper for consistent client communication.
 */
export const sendSuccess = (res, message = 'Operation successful', data = null, statusCode = 200) => {
  const payload = {
    success: true,
    message,
    ...(data !== null && { data }),
  };
  return res.status(statusCode).json(payload);
};

export const sendError = (res, message = 'An unexpected error occurred', statusCode = 500, errors = null) => {
  const payload = {
    success: false,
    message,
    ...(errors !== null && { errors }),
  };
  return res.status(statusCode).json(payload);
};

