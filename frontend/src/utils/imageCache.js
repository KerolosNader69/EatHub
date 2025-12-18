/**
 * Image caching utilities for performance optimization
 * Implements localStorage caching with TTL for images
 */

const CACHE_PREFIX = 'eat_hub_image_cache_';
const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Cache key generator
 * @param {string} url - Image URL
 * @returns {string} - Cache key
 */
const getCacheKey = (url) => {
  return `${CACHE_PREFIX}${btoa(url).replace(/[^a-zA-Z0-9]/g, '')}`;
};

/**
 * Get cached image data
 * @param {string} url - Image URL
 * @returns {Object|null} - Cached data or null if expired/not found
 */
export const getCachedImage = (url) => {
  try {
    const cacheKey = getCacheKey(url);
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is expired
    if (now > data.expiry) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('Error reading image cache:', error);
    return null;
  }
};

/**
 * Cache image data
 * @param {string} url - Image URL
 * @param {string} dataUrl - Base64 data URL
 * @param {number} ttl - Time to live in milliseconds
 */
export const cacheImage = (url, dataUrl, ttl = DEFAULT_TTL) => {
  try {
    const cacheKey = getCacheKey(url);
    const data = {
      url,
      dataUrl,
      cached: Date.now(),
      expiry: Date.now() + ttl,
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (error) {
    console.warn('Error caching image:', error);
    // If localStorage is full, try to clear old cache entries
    clearExpiredCache();
  }
};

/**
 * Preload and cache image
 * @param {string} url - Image URL
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Promise<string>} - Promise resolving to data URL
 */
export const preloadAndCacheImage = (url, ttl = DEFAULT_TTL) => {
  return new Promise((resolve, reject) => {
    // Check if already cached
    const cached = getCachedImage(url);
    if (cached) {
      resolve(cached.dataUrl);
      return;
    }
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Create canvas to convert to data URL
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/webp', 0.8);
        
        // Cache the result
        cacheImage(url, dataUrl, ttl);
        resolve(dataUrl);
      } catch (error) {
        // If canvas conversion fails, just resolve with original URL
        resolve(url);
      }
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };
    
    img.src = url;
  });
};

/**
 * Clear expired cache entries
 */
export const clearExpiredCache = () => {
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
      console.log(`Cleared ${keysToRemove.length} expired image cache entries`);
    }
  } catch (error) {
    console.warn('Error clearing expired cache:', error);
  }
};

/**
 * Get cache statistics
 * @returns {Object} - Cache statistics
 */
export const getCacheStats = () => {
  try {
    let totalEntries = 0;
    let totalSize = 0;
    let expiredEntries = 0;
    const now = Date.now();
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        totalEntries++;
        const value = localStorage.getItem(key);
        totalSize += value.length;
        
        try {
          const data = JSON.parse(value);
          if (now > data.expiry) {
            expiredEntries++;
          }
        } catch (error) {
          expiredEntries++;
        }
      }
    }
    
    return {
      totalEntries,
      totalSize,
      expiredEntries,
      sizeInKB: Math.round(totalSize / 1024),
    };
  } catch (error) {
    console.warn('Error getting cache stats:', error);
    return {
      totalEntries: 0,
      totalSize: 0,
      expiredEntries: 0,
      sizeInKB: 0,
    };
  }
};

/**
 * Clear all image cache
 */
export const clearAllImageCache = () => {
  try {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log(`Cleared ${keysToRemove.length} image cache entries`);
  } catch (error) {
    console.warn('Error clearing image cache:', error);
  }
};

// Initialize cache cleanup on module load
clearExpiredCache();