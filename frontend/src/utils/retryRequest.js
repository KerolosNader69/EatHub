/**
 * Retry utility for failed API requests
 * Implements exponential backoff strategy
 */

/**
 * Retry a failed request with exponential backoff
 * @param {Function} requestFn - The async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 10000)
 * @param {Function} options.shouldRetry - Function to determine if error should be retried
 * @param {Function} options.onRetry - Callback called before each retry
 * @returns {Promise} Result of the request
 */
export const retryRequest = async (requestFn, options = {}) => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = defaultShouldRetry,
    onRetry = null
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      // Don't retry if this is the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Check if we should retry this error
      if (!shouldRetry(error)) {
        break;
      }

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, maxRetries, delay);
      }

      // Wait before retrying
      await sleep(delay);

      // Exponential backoff with jitter
      delay = Math.min(delay * 2 + Math.random() * 1000, maxDelay);
    }
  }

  throw lastError;
};

/**
 * Default function to determine if an error should be retried
 * @param {Object} error - Error object
 * @returns {boolean} True if error should be retried
 */
const defaultShouldRetry = (error) => {
  // Retry on network errors
  if (error.code === 'NETWORK_ERROR') {
    return true;
  }

  // Retry on 5xx server errors
  if (error.status >= 500 && error.status < 600) {
    return true;
  }

  // Retry on timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return true;
  }

  // Don't retry on client errors (4xx)
  if (error.status >= 400 && error.status < 500) {
    return false;
  }

  // Default: retry
  return true;
};

/**
 * Sleep utility
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create a retryable version of a service function
 * @param {Function} serviceFn - Service function to wrap
 * @param {Object} retryOptions - Retry options
 * @returns {Function} Wrapped function with retry logic
 */
export const withRetry = (serviceFn, retryOptions = {}) => {
  return async (...args) => {
    return retryRequest(() => serviceFn(...args), retryOptions);
  };
};

export default retryRequest;
