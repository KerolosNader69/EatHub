/**
 * Error tracking utility for frontend
 * Logs errors to console and optionally sends to backend
 */

class ErrorTracker {
  constructor() {
    this.enabled = import.meta.env.VITE_ERROR_TRACKING_ENABLED === 'true';
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }

  /**
   * Initialize error tracking
   */
  init() {
    if (!this.enabled) {
      console.log('Error tracking disabled');
      return;
    }

    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        type: 'javascript_error'
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        type: 'promise_rejection'
      });
    });

    console.log('Error tracking initialized');
  }

  /**
   * Log error
   */
  logError(error) {
    const errorData = {
      ...error,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    // Log to console
    console.error('Error tracked:', errorData);

    // Send to backend (optional)
    if (this.enabled) {
      this.sendToBackend(errorData);
    }
  }

  /**
   * Send error to backend
   */
  async sendToBackend(errorData) {
    try {
      await fetch(`${this.apiUrl}/api/monitoring/error`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorData)
      });
    } catch (err) {
      // Silently fail - don't want error tracking to cause more errors
      console.warn('Failed to send error to backend:', err);
    }
  }

  /**
   * Track custom error
   */
  trackError(message, context = {}) {
    this.logError({
      message,
      context,
      type: 'custom_error'
    });
  }

  /**
   * Track API error
   */
  trackApiError(endpoint, statusCode, errorMessage) {
    this.logError({
      message: `API Error: ${errorMessage}`,
      endpoint,
      statusCode,
      type: 'api_error'
    });
  }
}

// Create singleton instance
const errorTracker = new ErrorTracker();

export default errorTracker;
