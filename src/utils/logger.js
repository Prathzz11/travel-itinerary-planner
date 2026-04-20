/**
 * A simple logging utility that only outputs to the console in development mode.
 * In production, it silences logs to prevent sensitive data leaks in the console.
 * Future enhancement: Integrate with Sentry, LogRocket, or Datadog for production monitoring.
 */

const isDev = import.meta.env.DEV;

export const logger = {
  info: (...args) => {
    if (isDev) {
      console.log('[INFO]', ...args);
    }
  },
  
  warn: (...args) => {
    if (isDev) {
      console.warn('[WARN]', ...args);
    }
  },
  
  error: (message, errorObj = null) => {
    if (isDev) {
      if (errorObj) {
        console.error(`[ERROR] ${message}`, errorObj);
      } else {
        console.error(`[ERROR] ${message}`);
      }
    } else {
      // In production, we could send this to an error monitoring service
      // Sentry.captureException(errorObj || message);
    }
  },

  debug: (...args) => {
    if (isDev) {
      console.debug('[DEBUG]', ...args);
    }
  }
};
