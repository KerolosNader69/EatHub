/**
 * Performance monitoring utilities
 * Tracks cache hits, load times, and optimization metrics
 */

const PERFORMANCE_PREFIX = 'eat_hub_perf_';

/**
 * Performance metrics storage
 */
let performanceMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  imageLoads: 0,
  lazyLoads: 0,
  componentLoads: {},
  apiCalls: {},
};

/**
 * Track cache hit
 * @param {string} key - Cache key
 */
export const trackCacheHit = (key) => {
  performanceMetrics.cacheHits++;
  console.debug(`Cache hit: ${key}`);
};

/**
 * Track cache miss
 * @param {string} key - Cache key
 */
export const trackCacheMiss = (key) => {
  performanceMetrics.cacheMisses++;
  console.debug(`Cache miss: ${key}`);
};

/**
 * Track image load
 * @param {string} src - Image source
 * @param {number} loadTime - Load time in milliseconds
 */
export const trackImageLoad = (src, loadTime) => {
  performanceMetrics.imageLoads++;
  console.debug(`Image loaded: ${src} in ${loadTime}ms`);
};

/**
 * Track lazy load
 * @param {string} component - Component name
 */
export const trackLazyLoad = (component) => {
  performanceMetrics.lazyLoads++;
  console.debug(`Lazy loaded: ${component}`);
};

/**
 * Track component load time
 * @param {string} component - Component name
 * @param {number} loadTime - Load time in milliseconds
 */
export const trackComponentLoad = (component, loadTime) => {
  if (!performanceMetrics.componentLoads[component]) {
    performanceMetrics.componentLoads[component] = [];
  }
  performanceMetrics.componentLoads[component].push(loadTime);
  console.debug(`Component loaded: ${component} in ${loadTime}ms`);
};

/**
 * Track API call performance
 * @param {string} endpoint - API endpoint
 * @param {number} responseTime - Response time in milliseconds
 * @param {boolean} fromCache - Whether response came from cache
 */
export const trackApiCall = (endpoint, responseTime, fromCache = false) => {
  if (!performanceMetrics.apiCalls[endpoint]) {
    performanceMetrics.apiCalls[endpoint] = {
      calls: 0,
      totalTime: 0,
      cacheHits: 0,
    };
  }
  
  performanceMetrics.apiCalls[endpoint].calls++;
  performanceMetrics.apiCalls[endpoint].totalTime += responseTime;
  
  if (fromCache) {
    performanceMetrics.apiCalls[endpoint].cacheHits++;
  }
  
  console.debug(`API call: ${endpoint} in ${responseTime}ms ${fromCache ? '(cached)' : ''}`);
};

/**
 * Get performance metrics
 * @returns {Object} - Current performance metrics
 */
export const getPerformanceMetrics = () => {
  const cacheHitRate = performanceMetrics.cacheHits + performanceMetrics.cacheMisses > 0
    ? (performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses) * 100).toFixed(2)
    : 0;

  return {
    ...performanceMetrics,
    cacheHitRate: `${cacheHitRate}%`,
    totalCacheOperations: performanceMetrics.cacheHits + performanceMetrics.cacheMisses,
  };
};

/**
 * Log performance summary to console
 */
export const logPerformanceSummary = () => {
  const metrics = getPerformanceMetrics();
  
  console.group('🚀 Performance Summary');
  console.log('Cache Performance:', {
    hits: metrics.cacheHits,
    misses: metrics.cacheMisses,
    hitRate: metrics.cacheHitRate,
  });
  console.log('Image Loading:', {
    totalImages: metrics.imageLoads,
    lazyLoads: metrics.lazyLoads,
  });
  console.log('Component Loading:', metrics.componentLoads);
  console.log('API Performance:', metrics.apiCalls);
  console.groupEnd();
};

/**
 * Reset performance metrics
 */
export const resetPerformanceMetrics = () => {
  performanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    imageLoads: 0,
    lazyLoads: 0,
    componentLoads: {},
    apiCalls: {},
  };
};

/**
 * Save performance metrics to localStorage
 */
export const savePerformanceMetrics = () => {
  try {
    localStorage.setItem(
      `${PERFORMANCE_PREFIX}metrics`,
      JSON.stringify({
        ...performanceMetrics,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.warn('Failed to save performance metrics:', error);
  }
};

// Auto-save metrics every 30 seconds
if (typeof window !== 'undefined') {
  setInterval(savePerformanceMetrics, 30000);
}