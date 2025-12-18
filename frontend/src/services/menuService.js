import axios from 'axios';
import { withRetry } from '../utils/retryRequest';
import { withCache, CACHE_KEYS, CACHE_TTL, invalidateCachePattern } from '../utils/cache';

// Create a public API instance without auth interceptors for menu requests
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Menu Service
 * Handles all menu-related API calls with caching support
 */

/**
 * Get all menu items (base function without caching)
 * @returns {Promise<Array>} Array of menu items
 */
const getMenuItemsBase = async () => {
  try {
    // Use public API instance to ensure no auth headers are sent
    const response = await publicApi.get('/menu');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching menu items:', error);
    throw error;
  }
};

/**
 * Get a single menu item by ID (base function without caching)
 * @param {string} id - Menu item ID
 * @returns {Promise<Object>} Menu item object
 */
const getMenuItemBase = async (id) => {
  try {
    // Use public API instance for individual menu items too
    const response = await publicApi.get(`/menu/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching menu item ${id}:`, error);
    throw error;
  }
};

/**
 * Get all menu items with caching and retry logic
 * @param {boolean} forceRefresh - Skip cache and fetch fresh data
 * @returns {Promise<Array>} Array of menu items
 */
export const getMenuItems = async (forceRefresh = true) => {
  // Always force refresh for now to avoid cache issues with availability changes
  if (forceRefresh) {
    invalidateCachePattern('menu_');
  }
  
  return withCache(
    CACHE_KEYS.MENU_ITEMS,
    () => withRetry(getMenuItemsBase, { maxRetries: 2 })(),
    CACHE_TTL.MENU_ITEMS
  );
};

/**
 * Get a single menu item by ID with caching and retry logic
 * @param {string} id - Menu item ID
 * @param {boolean} forceRefresh - Skip cache and fetch fresh data
 * @returns {Promise<Object>} Menu item object
 */
export const getMenuItem = async (id, forceRefresh = false) => {
  if (forceRefresh) {
    invalidateCachePattern(`menu_item_${id}`);
  }
  
  return withCache(
    CACHE_KEYS.MENU_ITEM(id),
    () => withRetry(() => getMenuItemBase(id), { maxRetries: 2 })(),
    CACHE_TTL.MENU_ITEM
  );
};

/**
 * Get featured menu items (base function without caching)
 * @returns {Promise<Array>} Array of featured menu items
 */
const getFeaturedItemsBase = async () => {
  try {
    const response = await publicApi.get('/menu/featured');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching featured items:', error);
    throw error;
  }
};

/**
 * Get all categories (base function without caching)
 * @returns {Promise<Array>} Array of categories
 */
const getCategoriesBase = async () => {
  try {
    const response = await publicApi.get('/categories');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Get active announcement for promo banner (base function without caching)
 * @returns {Promise<Object|null>} Announcement item or null
 */
const getAnnouncementBase = async () => {
  try {
    const response = await publicApi.get('/menu/announcement');
    return response.data.data || null;
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return null;
  }
};

/**
 * Get featured menu items with caching and retry logic
 * @param {boolean} forceRefresh - Skip cache and fetch fresh data
 * @returns {Promise<Array>} Array of featured menu items
 */
export const getFeaturedItems = async (forceRefresh = false) => {
  if (forceRefresh) {
    invalidateCachePattern('featured_items');
  }
  
  return withCache(
    CACHE_KEYS.FEATURED_ITEMS,
    () => withRetry(getFeaturedItemsBase, { maxRetries: 2 })(),
    CACHE_TTL.FEATURED_ITEMS
  );
};

/**
 * Get all categories with caching and retry logic
 * @param {boolean} forceRefresh - Skip cache and fetch fresh data
 * @returns {Promise<Array>} Array of categories
 */
export const getCategories = async (forceRefresh = false) => {
  if (forceRefresh) {
    invalidateCachePattern('categories');
  }
  
  return withCache(
    CACHE_KEYS.CATEGORIES,
    () => withRetry(getCategoriesBase, { maxRetries: 2 })(),
    CACHE_TTL.CATEGORIES
  );
};

/**
 * Get active announcement for promo banner with retry logic
 * @returns {Promise<Object|null>} Announcement item or null
 */
export const getAnnouncement = async () => {
  return withRetry(getAnnouncementBase, { maxRetries: 2 })();
};

/**
 * Invalidate menu cache (call after menu updates)
 */
export const invalidateMenuCache = () => {
  invalidateCachePattern('menu_');
};

const menuService = {
  getMenuItems,
  getMenuItem,
  getFeaturedItems,
  getCategories,
  getAnnouncement
};

export default menuService;
