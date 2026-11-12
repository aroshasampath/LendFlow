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
 * Response interceptor with intelligent, user-friendly error translation.
 * Maps network drops, rate limits, unauthorized states, and validation failures
 * into human-readable, non-technical messages.
 */
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let friendlyMessage = 'Something went wrong on our end. Please try again later.';

    if (!error.response) {
      // 1. Network Failure / Offline / CORS / Server Down
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        friendlyMessage = 'The request took too long to respond. Please check your connection and try again.';
      } else {
        friendlyMessage = 'Unable to connect to LendFlow. Please check your internet connection.';
      }
    } else {
      const { status, data } = error.response;
      const serverMessage = data?.message;

      // 2. Prioritize clean message from server if provided
      if (serverMessage && typeof serverMessage === 'string') {
        friendlyMessage = serverMessage;
      }
      // 3. Fallbacks based on standard HTTP status codes
      else if (status === 400) {
        friendlyMessage = 'Please check the information you entered and try again.';
      } else if (status === 401) {
        friendlyMessage = 'Your session has expired. Please log in again to continue.';
      } else if (status === 403) {
        friendlyMessage = 'You do not have permission to access or modify this resource.';
      } else if (status === 404) {
        friendlyMessage = 'The requested item or page could not be found.';
      } else if (status === 409) {
        friendlyMessage = 'A conflicting record already exists in the system.';
      } else if (status === 422) {
        friendlyMessage = 'Unable to process the submitted data. Please review the form fields.';
      } else if (status === 429) {
        friendlyMessage = 'Too many requests. For security reasons, please slow down and try again.';
      } else if (status >= 500) {
        friendlyMessage = 'We are experiencing temporary server difficulties. Please try again shortly.';
      }
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
