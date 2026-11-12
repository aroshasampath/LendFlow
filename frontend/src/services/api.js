import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Pre-configured Axios instance for LendFlow API
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Response interceptor for consistent, user-friendly error translation.
 * Maps network and server failures into plain, simple English.
 */
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let friendlyMessage = 'Something went wrong on our side. Please try again later.';

    if (!error.response) {
      // Network error, CORS failure, or server unreachable
      friendlyMessage = 'Unable to connect. Please check your internet connection and try again.';
    } else if (error.response.status === 401) {
      friendlyMessage = 'Your session has expired. Please log in again.';
    } else if (error.response.status === 403) {
      friendlyMessage = 'You do not have permission to perform this action.';
    } else if (error.response.status === 404) {
      friendlyMessage = error.response.data?.message || 'The requested resource could not be found.';
    } else if (error.response.status === 429) {
      friendlyMessage = 'Too many requests. Please wait a moment and try again.';
    } else if (error.response.data?.message) {
      // Sanitized message from backend
      friendlyMessage = error.response.data.message;
    }

    return Promise.reject(new Error(friendlyMessage));
  }
);

/**
 * Health check service
 */
export const fetchSystemHealth = async () => {
  return await api.get('/health');
};
