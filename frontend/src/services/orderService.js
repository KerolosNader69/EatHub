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
 * @param {string} userId - Optional user ID for rewards
 * @returns {Promise<Object>} Created order with orderNumber and estimatedDelivery
 */
const createOrderBase = async (orderData, userId = null) => {
  try {
    const headers = userId ? { 'x-user-id': userId } : {};
    const response = await api.post('/orders', orderData, { headers });
    const data = response.data.data || response.data;
    
    // Transform response to ensure consistent structure
    return {
      orderNumber: data.orderNumber || data.order_number,
      estimatedDelivery: data.estimatedDelivery || data.estimated_delivery,
      order: data.order || {
        ...data,
        orderNumber: data.orderNumber || data.order_number,
        customerInfo: {
          name: data.order?.customer_name || orderData.customerInfo.name,
          phone: data.order?.customer_phone || orderData.customerInfo.phone,
          address: data.order?.customer_address || orderData.customerInfo.address
        },
        items: data.order?.order_items || data.order?.items || [],
        totalAmount: parseFloat(data.order?.total_amount || data.order?.totalAmount || 0),
        status: data.order?.status || 'received',
        specialInstructions: data.order?.special_instructions || orderData.specialInstructions
      },
      rewards: data.rewards || null // Points earned from this order
    };
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
    const orderData = response.data.data || response.data;
    
    // Transform Supabase data structure to match frontend expectations
    return {
      ...orderData,
      orderNumber: orderData.order_number || orderData.orderNumber,
      customerInfo: {
        name: orderData.customer_name || orderData.customerInfo?.name,
        phone: orderData.customer_phone || orderData.customerInfo?.phone,
        address: orderData.customer_address || orderData.customerInfo?.address
      },
      items: orderData.order_items || orderData.items || [],
      totalAmount: parseFloat(orderData.total_amount || orderData.totalAmount || 0),
      specialInstructions: orderData.special_instructions || orderData.specialInstructions,
      createdAt: orderData.created_at || orderData.createdAt,
      estimatedDelivery: orderData.estimated_delivery || orderData.estimatedDelivery
    };
  } catch (error) {
    console.error(`Error fetching order ${orderNumber}:`, error);
    throw error;
  }
};

// Export with retry logic
// Don't retry order creation to avoid duplicate orders
export const createOrder = (orderData, userId) => createOrderBase(orderData, userId);
export const getOrderStatus = withRetry(getOrderStatusBase, { maxRetries: 2 });

const orderService = {
  createOrder,
  getOrderStatus
};

export default orderService;
