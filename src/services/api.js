import axios from 'axios';
import axiosRetry from 'axios-retry';
import { API_BASE_URL } from '../utils/constants';
import { logger } from '../utils/logger';

const api = axios.create({ 
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Ensure cookies are sent with requests if CSRF protection requires it
  withCredentials: true,
  // Add a reasonable timeout (10 seconds)
  timeout: 10000
});

// Configure automatic retries for failed requests (e.g. network drops, 5xx errors)
axiosRetry(api, { 
  retries: 2, // Number of retries
  retryDelay: axiosRetry.exponentialDelay, // Exponential back-off
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ECONNABORTED';
  }
});

// Add a request interceptor for JWT
api.interceptors.request.use(
  (config) => {
    // SECURITY: Warn if HTTP is used in production
    if (import.meta.env.PROD && config.baseURL && config.baseURL.startsWith('http://')) {
      logger.warn('SECURITY WARNING: API request is being made over insecure HTTP. Ensure HTTPS is used in production.');
    }

    // Attempt to get token from localStorage, fallback to sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // --- Error Logging ---
    logger.error('API Error response:', error);

    // --- Format User-Friendly Error Messages ---
    let userMessage = 'We encountered an unexpected error. Please try again later.';

    // Check for Network Error or Timeout
    if (error.code === 'ECONNABORTED') {
      userMessage = 'The request timed out. Please check your internet connection and try again.';
    } else if (error.message === 'Network Error' && !error.response) {
      userMessage = 'We cannot connect to the server. Please verify your internet connection.';
    } else if (error.response) {
      const status = error.response.status;
      
      switch (status) {
        case 400:
          userMessage = error.response.data?.message || 'Invalid request. Please check your input.';
          break;
        case 401:
          // Check if error is 401 Unauthorized
          // DO NOT trigger logout flow if the 401 is from the login or signup route itself!
          if (!originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/auth/signup') && !originalRequest._retry) {
            originalRequest._retry = true;
            logger.warn("Unauthorized access - clearing tokens and logging out.");
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            // Dispatch a custom event to notify AuthContext to log user out
            window.dispatchEvent(new Event('auth:unauthorized'));
          }
          userMessage = originalRequest.url.includes('/auth/login') 
            ? error.response.data?.message || 'Invalid email or password.' 
            : 'Your session has expired. Please log in again.';
          break;
        case 403:
          userMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          userMessage = 'The requested resource could not be found.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          userMessage = 'Our servers are currently experiencing issues. We are working to fix them.';
          break;
        default:
          userMessage = error.response.data?.message || 'An error occurred while processing your request.';
      }
    }

    // Attach the user-friendly message to the error object so components can display it
    error.userMessage = userMessage;
    
    return Promise.reject(error);
  }
);

export default api;