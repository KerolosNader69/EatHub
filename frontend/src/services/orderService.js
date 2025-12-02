import api from './api';
import { withRetry } from '../utils/retryRequest';

/**
 * Order Service
 * Handles all order-related API calls
 */

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @param {Array} orderData.items - Array of items with itemId and quantity
 * @param {Object} orderData.customerInfo - Customer information (name, phone, address)
 * @param {string} orderData.specialInstructions - Optional special instructions
 * @returns {Promise<Object>} Created order with orderNumber and estimatedDelivery
 */
const createOrderBase = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Get order status by order number
 * @param {string} orderNumber - Unique order number
 * @returns {Promise<Object>} Order details with status
 */
const getOrderStatusBase = async (orderNumber) => {
  try {
    const response = await api.get(`/orders/${orderNumber}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching order ${orderNumber}:`, error);
    throw error;
  }
};

// Export with retry logic
// Don't retry order creation to avoid duplicate orders
export const createOrder = createOrderBase;
export const getOrderStatus = withRetry(getOrderStatusBase, { maxRetries: 2 });

const orderService = {
  createOrder,
  getOrderStatus
};

export default orderService;
