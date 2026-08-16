/**
 * Centralized logging helper to send client-side errors and warnings
 * to the background Express server. This is especially useful for debugging
 * production issues within the Electron binary execution.
 */
export const logger = {
  error: async (message: string, error?: any) => {
    console.error(`[Client Logger Error]: ${message}`, error);
    try {
      const errorPayload = error instanceof Error 
        ? { name: error.name, message: error.message, stack: error.stack }
        : error;

      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          level: 'error',
          message,
          error: errorPayload,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      });
    } catch (e) {
      // Fallback if the logging endpoint itself fails
      console.error("Failed to send log to /api/logs", e);
    }
  },
  
  info: async (message: string, data?: any) => {
    console.log(`[Client Logger Info]: ${message}`, data);
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          level: 'info',
          message,
          data,
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) {
      console.error("Failed to send log to /api/logs", e);
    }
  },

  warn: async (message: string, data?: any) => {
    console.warn(`[Client Logger Warn]: ${message}`, data);
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          level: 'warn',
          message,
          data,
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) {
      console.error("Failed to send log to /api/logs", e);
    }
  }
};
