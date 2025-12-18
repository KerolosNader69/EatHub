/**
 * Data caching utilities for API responses
 * Implements localStorage caching with TTL for categories and featured items
 */

const CACHE_PREFIX = 'eat_hub_data_cache_';
const CATEGORIES_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
const FEATURED_ITEMS_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Cache key generator
 * @param {string} key - Cache key
 * @returns {string} - Full cache key
 */
const getCacheKey = (key) => {
  return `${CACHE_PREFIX}${key}`;
};

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if expired/not found
 */
export const getCachedData = (key) => {
  try {
    const cacheKey = getCacheKey(key);
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is expired
    if (now > data.expiry) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return data.value;
  } catch (error) {
    console.warn('Error reading data cache:', error);
    return null;
  }
};

/**
 * Cache data
 * @param {string} key - Cache key
 * @param {any} value - Data to cache
 * @param {number} ttl - Time to live in milliseconds
 */
export const cacheData = (key, value, ttl) => {
  try {
    const cacheKey = getCacheKey(key);
    const data = {
      value,
      cached: Date.now(),
      expiry: Date.now() + ttl,
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (error) {
    console.warn('Error caching data:', error);
    // If localStorage is full, try to clear old cache entries
    clearExpiredDataCache();
  }
};

/**
 * Cache categories data
 * @param {Array} categories - Categories array
 */
export const cacheCategories = (categories) => {
  cacheData('categories', categories, CATEGORIES_TTL);
};

/**
 * Get cached categories
 * @returns {Array|null} - Cached categories or null
 */
export const getCachedCategories = () => {
  return getCachedData('categories');
};

/**
 * Cache featured items data
 * @param {Array} items - Featured items array
 */
export const cacheFeaturedItems = (items) => {
  cacheData('featured_items', items, FEATURED_ITEMS_TTL);
};

/**
 * Get cached featured items
 * @returns {Array|null} - Cached featured items or null
 */
export const getCachedFeaturedItems = () => {
  return getCachedData('featured_items');
};/*
*
 * Clear expired cache entries
 */
export const clearExpiredDataCache = () => {
  try {
    const now = Date.now();
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (now > data.expiry) {
            keysToRemove.push(key);
          }
        } catch (error) {
          // Invalid data, remove it
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    if (keysToRemove.length > 0) {
      console.log(`Cleared ${keysToRemove.length} expired data cache entries`);
    }
  } catch (error) {
    console.warn('Error clearing expired data cache:', error);
  }
};

/**
 * Clear all data cache
 */
export const clearAllDataCache = () => {
  try {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log(`Cleared ${keysToRemove.length} data cache entries`);
  } catch (error) {
    console.warn('Error clearing data cache:', error);
  }
};

// Initialize cache cleanup on module load
clearExpiredDataCache();