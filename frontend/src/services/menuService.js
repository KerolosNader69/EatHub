import api from './api';
import { withRetry } from '../utils/retryRequest';
import { withCache, CACHE_KEYS, CACHE_TTL, invalidateCachePattern } from '../utils/cache';

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
    const response = await api.get('/menu');
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
    const response = await api.get(`/menu/${id}`);
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
export const getMenuItems = async (forceRefresh = false) => {
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
 * Invalidate menu cache (call after menu updates)
 */
export const invalidateMenuCache = () => {
  invalidateCachePattern('menu_');
};

const menuService = {
  getMenuItems,
  getMenuItem
};

export default menuService;
