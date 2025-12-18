/**
 * Cache utility for storing data in localStorage with TTL (Time To Live)
 * Provides methods for caching API responses to reduce network requests
 */

const CACHE_PREFIX = 'eathub_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Cache entry structure
 * @typedef {Object} CacheEntry
 * @property {*} data - Cached data
 * @property {number} timestamp - When the data was cached
 * @property {number} ttl - Time to live in milliseconds
 */

/**
 * Set item in cache with TTL
 * @param {string} key - Cache key
 * @param {*} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
 */
export const setCache = (key, data, ttl = DEFAULT_TTL) => {
  try {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    
    localStorage.setItem(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify(cacheEntry)
    );
  } catch (error) {
    console.warn('Failed to set cache:', error);
    // Silently fail if localStorage is full or unavailable
  }
};

/**
 * Get item from cache if not expired
 * @param {string} key - Cache key
 * @returns {*|null} - Cached data or null if expired/not found
 */
export const getCache = (key) => {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    
    if (!cached) {
      return null;
    }
    
    const cacheEntry = JSON.parse(cached);
    const now = Date.now();
    const age = now - cacheEntry.timestamp;
    
    // Check if cache has expired
    if (age > cacheEntry.ttl) {
      // Remove expired cache
      removeCache(key);
      return null;
    }
    
    return cacheEntry.data;
  } catch (error) {
    console.warn('Failed to get cache:', error);
    return null;
  }
};

/**
 * Remove item from cache
 * @param {string} key - Cache key
 */
export const removeCache = (key) => {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch (error) {
    console.warn('Failed to remove cache:', error);
  }
};

/**
 * Clear all cache entries
 */
export const clearAllCache = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
};

/**
 * Check if cache entry exists and is valid
 * @param {string} key - Cache key
 * @returns {boolean} - True if cache exists and is not expired
 */
export const hasValidCache = (key) => {
  return getCache(key) !== null;
};

/**
 * Get cache age in milliseconds
 * @param {string} key - Cache key
 * @returns {number|null} - Age in milliseconds or null if not found
 */
export const getCacheAge = (key) => {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    
    if (!cached) {
      return null;
    }
    
    const cacheEntry = JSON.parse(cached);
    return Date.now() - cacheEntry.timestamp;
  } catch (error) {
    return null;
  }
};

/**
 * Wrapper for async functions with caching
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Async function to fetch data
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Promise<*>} - Cached or fresh data
 */
export const withCache = async (key, fetchFn, ttl = DEFAULT_TTL) => {
  // Try to get from cache first
  const cached = getCache(key);
  
  if (cached !== null) {
    return cached;
  }
  
  // Fetch fresh data
  const data = await fetchFn();
  
  // Cache the result
  setCache(key, data, ttl);
  
  return data;
};

/**
 * Invalidate cache entries matching a pattern
 * @param {string} pattern - Pattern to match (e.g., 'menu_')
 */
export const invalidateCachePattern = (pattern) => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX + pattern)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to invalidate cache pattern:', error);
  }
};

// Specific cache keys for the application
export const CACHE_KEYS = {
  MENU_ITEMS: 'menu_items',
  MENU_ITEM: (id) => `menu_item_${id}`,
  ORDER: (orderNumber) => `order_${orderNumber}`,
  FEATURED_ITEMS: 'featured_items',
  CATEGORIES: 'categories',
  VOUCHERS: 'vouchers',
  REWARDS_STATUS: 'rewards_status',
};

// Cache TTL configurations (in milliseconds)
export const CACHE_TTL = {
  MENU_ITEMS: 5 * 60 * 1000, // 5 minutes
  MENU_ITEM: 10 * 60 * 1000, // 10 minutes
  ORDER: 2 * 60 * 1000, // 2 minutes
  FEATURED_ITEMS: 30 * 60 * 1000, // 30 minutes (as per requirements)
  CATEGORIES: 60 * 60 * 1000, // 1 hour (as per requirements)
  VOUCHERS: 0, // No caching for vouchers (always fresh)
  REWARDS_STATUS: 5 * 60 * 1000, // 5 minutes
};
