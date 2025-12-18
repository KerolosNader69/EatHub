import api from './api';
import { withRetry } from '../utils/retryRequest';
import { invalidateCachePattern } from '../utils/cache';

/**
 * Admin Service
 * Handles all admin-related API calls with cache invalidation
 */

/**
 * Admin login
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.username - Admin username
 * @param {string} credentials.password - Admin password
 * @returns {Promise<Object>} Login response with token and admin info
 */
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

/**
 * Verify JWT token
 * @returns {Promise<Object>} Verification response with admin info
 */
const verifyTokenBase = async () => {
  try {
    const response = await api.post('/auth/verify');
    return response.data;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
};

/**
 * Get all orders (admin only)
 * @param {string} status - Optional status filter
 * @returns {Promise<Array>} Array of orders
 */
const getOrdersBase = async (status = null) => {
  try {
    const url = status ? `/orders?status=${status}` : '/orders';
    const response = await api.get(url);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Export with retry logic
export const verifyToken = withRetry(verifyTokenBase, { maxRetries: 2 });
export const getOrders = withRetry(getOrdersBase, { maxRetries: 2 });

/**
 * Update order status (admin only)
 * @param {string} orderNumber - Order number
 * @param {string} status - New status (received, preparing, out_for_delivery, delivered)
 * @returns {Promise<Object>} Updated order
 */
export const updateOrderStatus = async (orderNumber, status) => {
  try {
    const response = await api.put(`/orders/${orderNumber}/status`, { status });
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error updating order ${orderNumber} status:`, error);
    throw error;
  }
};

/**
 * Create a new menu item (admin only)
 * @param {FormData} formData - Form data with menu item details and image
 * @returns {Promise<Object>} Created menu item
 */
export const createMenuItem = async (formData) => {
  try {
    const response = await api.post('/menu', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Invalidate menu cache after creating item
    invalidateCachePattern('menu_');
    
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating menu item:', error);
    throw error;
  }
};

/**
 * Update an existing menu item (admin only)
 * @param {string} id - Menu item ID
 * @param {FormData|Object} data - Updated menu item data
 * @returns {Promise<Object>} Updated menu item
 */
export const updateMenuItem = async (id, data) => {
  try {
    const config = data instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    
    const response = await api.put(`/menu/${id}`, data, config);
    
    // Invalidate menu cache after updating item
    invalidateCachePattern('menu_');
    
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error updating menu item ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a menu item (admin only)
 * @param {string} id - Menu item ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteMenuItem = async (id) => {
  try {
    const response = await api.delete(`/menu/${id}`);
    
    // Invalidate menu cache after deleting item
    invalidateCachePattern('menu_');
    
    return response.data;
  } catch (error) {
    console.error(`Error deleting menu item ${id}:`, error);
    throw error;
  }
};

/**
 * Get all vouchers (admin only)
 * @returns {Promise<Array>} Array of vouchers
 */
export const getAllVouchers = async () => {
  try {
    const response = await api.get('/vouchers');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    throw error;
  }
};

/**
 * Create a new voucher (admin only)
 * @param {Object} voucherData - Voucher data
 * @returns {Promise<Object>} Created voucher
 */
export const createVoucher = async (voucherData) => {
  try {
    const response = await api.post('/vouchers', voucherData);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating voucher:', error);
    throw error;
  }
};

/**
 * Update a voucher (admin only)
 * @param {string} id - Voucher ID
 * @param {Object} voucherData - Updated voucher data
 * @returns {Promise<Object>} Updated voucher
 */
export const updateVoucher = async (id, voucherData) => {
  try {
    const response = await api.put(`/vouchers/${id}`, voucherData);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error updating voucher ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a voucher (admin only)
 * @param {string} id - Voucher ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteVoucher = async (id) => {
  try {
    const response = await api.delete(`/vouchers/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting voucher ${id}:`, error);
    throw error;
  }
};

const adminService = {
  login,
  verifyToken,
  getOrders,
  updateOrderStatus,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getAllVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher
};

export default adminService;
