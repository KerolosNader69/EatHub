/**
 * API retry utilities for handling failed requests
 * Implements exponential backoff and retry logic
 */

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  },
};

/**
 * Sleep utility
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after delay
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate delay with exponential backoff
 * @param {number} attempt - Current attempt number (0-based)
 * @param {number} baseDelay - Base delay in milliseconds
 * @param {number} backoffFactor - Backoff multiplier
 * @param {number} maxDelay - Maximum delay in milliseconds
 * @returns {number} - Delay in milliseconds
 */
const calculateDelay = (attempt, baseDelay, backoffFactor, maxDelay) => {
  const delay = baseDelay * Math.pow(backoffFactor, attempt);
  return Math.min(delay, maxDelay);
};

/**
 * Retry an async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} config - Retry configuration
 * @returns {Promise} - Promise resolving to function result
 */
export const retryWithBackoff = async (fn, config = {}) => {
  const {
    maxRetries,
    baseDelay,
    maxDelay,
    backoffFactor,
    retryCondition,
  } = { ...DEFAULT_RETRY_CONFIG, ...config };

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if this is the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Check if we should retry this error
      if (!retryCondition(error)) {
        break;
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, baseDelay, backoffFactor, maxDelay);
      console.warn(`API call failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`, error.message);
      
      await sleep(delay);
    }
  }

  throw lastError;
};

/**
 * Create a retry wrapper for API functions
 * @param {Function} apiFunction - API function to wrap
 * @param {Object} config - Retry configuration
 * @returns {Function} - Wrapped function with retry logic
 */
export const createRetryWrapper = (apiFunction, config = {}) => {
  return async (...args) => {
    return retryWithBackoff(() => apiFunction(...args), config);
  };
};

/**
 * Specific retry configurations for different API endpoints
 */
export const RETRY_CONFIGS = {
  categories: {
    maxRetries: 2,
    baseDelay: 500,
    maxDelay: 5000,
  },
  featuredItems: {
    maxRetries: 2,
    baseDelay: 500,
    maxDelay: 5000,
  },
  vouchers: {
    maxRetries: 1,
    baseDelay: 1000,
    maxDelay: 3000,
  },
  rewards: {
    maxRetries: 1,
    baseDelay: 1000,
    maxDelay: 3000,
  },
};