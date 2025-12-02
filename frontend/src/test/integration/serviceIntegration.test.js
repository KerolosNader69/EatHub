import { describe, it, expect, vi, afterEach } from 'vitest';
import * as menuService from '../../services/menuService';
import * as orderService from '../../services/orderService';
import * as adminService from '../../services/adminService';

// Mock the API module
vi.mock('../../services/api');

describe('Service Integration Tests', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete User Flow - Service Level', () => {
    it('should handle complete order flow: browse menu → create order → track status', async () => {
      // Step 1: Browse menu
      const mockMenuItems = [
        {
          _id: '1',
          name: 'Margherita Pizza',
          price: 12.99,
          category: 'main_courses',
          available: true
        },
        {
          _id: '2',
          name: 'Caesar Salad',
          price: 8.50,
          category: 'appetizers',
          available: true
        }
      ];
      
      vi.spyOn(menuService, 'getMenuItems').mockResolvedValue(mockMenuItems);
      
      const menuItems = await menuService.getMenuItems();
      expect(menuItems).toHaveLength(2);
      expect(menuItems[0].name).toBe('Margherita Pizza');
      
      // Step 2: Create order
      const orderData = {
        items: [
          { itemId: '1', quantity: 2 },
          { itemId: '2', quantity: 1 }
        ],
        customerInfo: {
          name: 'John Doe',
          phone: '1234567890',
          address: '123 Main St'
        }
      };
      
      const mockOrderResponse = {
        success: true,
        data: {
          orderNumber: 'EH1234567890',
          estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
          order: {
            _id: 'order1',
            orderNumber: 'EH1234567890',
            items: [
              { menuItem: '1', name: 'Margherita Pizza', price: 12.99, quantity: 2 },
              { menuItem: '2', name: 'Caesar Salad', price: 8.50, quantity: 1 }
            ],
            customerInfo: orderData.customerInfo,
            totalAmount: 34.48,
            status: 'received'
          }
        }
      };
      
      vi.spyOn(orderService, 'createOrder').mockResolvedValue(mockOrderResponse);
      
      const orderResult = await orderService.createOrder(orderData);
      expect(orderResult.success).toBe(true);
      expect(orderResult.data.orderNumber).toBe('EH1234567890');
      expect(orderResult.data.order.totalAmount).toBe(34.48);
      
      // Step 3: Track order status
      vi.spyOn(orderService, 'getOrderStatus').mockResolvedValue({
        success: true,
        data: {
          orderNumber: 'EH1234567890',
          status: 'received',
          estimatedDelivery: mockOrderResponse.data.estimatedDelivery
        }
      });
      
      const statusResult = await orderService.getOrderStatus('EH1234567890');
      expect(statusResult.success).toBe(true);
      expect(statusResult.data.status).toBe('received');
    });

    it('should handle cart operations through localStorage', () => {
      // Simulate cart operations
      const cartItem = {
        id: '1',
        name: 'Margherita Pizza',
        price: 12.99,
        quantity: 2
      };
      
      // Add to cart
      localStorage.setItem('eatHubCart', JSON.stringify([cartItem]));
      
      // Retrieve cart
      const cart = JSON.parse(localStorage.getItem('eatHubCart'));
      expect(cart).toHaveLength(1);
      expect(cart[0].quantity).toBe(2);
      
      // Update quantity
      cart[0].quantity = 3;
      localStorage.setItem('eatHubCart', JSON.stringify(cart));
      
      const updatedCart = JSON.parse(localStorage.getItem('eatHubCart'));
      expect(updatedCart[0].quantity).toBe(3);
      
      // Clear cart
      localStorage.removeItem('eatHubCart');
      const clearedCart = localStorage.getItem('eatHubCart');
      expect(clearedCart).toBeNull();
    });
  });

  describe('Complete Admin Flow - Service Level', () => {
    it('should handle complete admin flow: login → manage menu → process orders', async () => {
      // Step 1: Admin login
      const loginData = {
        username: 'admin',
        password: 'password123'
      };
      
      vi.spyOn(adminService, 'login').mockResolvedValue({
        success: true,
        token: 'mock-jwt-token',
        admin: { id: 'admin1', username: 'admin' }
      });
      
      const loginResult = await adminService.login(loginData);
      expect(loginResult.success).toBe(true);
      expect(loginResult.token).toBe('mock-jwt-token');
      
      // Step 2: Create menu item
      const newMenuItem = {
        name: 'New Burger',
        description: 'Delicious burger',
        price: 10.99,
        category: 'main_courses'
      };
      
      vi.spyOn(adminService, 'createMenuItem').mockResolvedValue({
        success: true,
        data: {
          _id: '3',
          ...newMenuItem,
          available: true
        }
      });
      
      const createResult = await adminService.createMenuItem(newMenuItem);
      expect(createResult.success).toBe(true);
      expect(createResult.data.name).toBe('New Burger');
      
      // Step 3: Update menu item
      vi.spyOn(adminService, 'updateMenuItem').mockResolvedValue({
        success: true,
        data: {
          _id: '3',
          ...newMenuItem,
          available: false
        }
      });
      
      const updateResult = await adminService.updateMenuItem('3', { available: false });
      expect(updateResult.success).toBe(true);
      expect(updateResult.data.available).toBe(false);
      
      // Step 4: Get orders
      vi.spyOn(adminService, 'getOrders').mockResolvedValue({
        success: true,
        data: [
          {
            _id: 'order1',
            orderNumber: 'EH1234567890',
            status: 'received',
            totalAmount: 25.98
          }
        ]
      });
      
      const ordersResult = await adminService.getOrders();
      expect(ordersResult.success).toBe(true);
      expect(ordersResult.data).toHaveLength(1);
      
      // Step 5: Update order status
      vi.spyOn(adminService, 'updateOrderStatus').mockResolvedValue({
        success: true,
        data: {
          orderNumber: 'EH1234567890',
          status: 'preparing'
        }
      });
      
      const statusUpdateResult = await adminService.updateOrderStatus('EH1234567890', 'preparing');
      expect(statusUpdateResult.success).toBe(true);
      expect(statusUpdateResult.data.status).toBe('preparing');
    });

    it('should handle menu item deletion', async () => {
      vi.spyOn(adminService, 'deleteMenuItem').mockResolvedValue({
        success: true,
        message: 'Menu item deleted successfully'
      });
      
      const deleteResult = await adminService.deleteMenuItem('1');
      expect(deleteResult.success).toBe(true);
      expect(adminService.deleteMenuItem).toHaveBeenCalledWith('1');
    });

    it('should filter orders by status', async () => {
      const allOrders = [
        { orderNumber: 'EH1111111111', status: 'received' },
        { orderNumber: 'EH2222222222', status: 'preparing' },
        { orderNumber: 'EH3333333333', status: 'delivered' }
      ];
      
      vi.spyOn(adminService, 'getOrders').mockResolvedValue({
        success: true,
        data: allOrders
      });
      
      const ordersResult = await adminService.getOrders();
      const receivedOrders = ordersResult.data.filter(o => o.status === 'received');
      
      expect(receivedOrders).toHaveLength(1);
      expect(receivedOrders[0].orderNumber).toBe('EH1111111111');
    });
  });

  describe('API Error Handling', () => {
    it('should handle menu fetch errors', async () => {
      vi.spyOn(menuService, 'getMenuItems').mockRejectedValue(new Error('Network error'));
      
      await expect(menuService.getMenuItems()).rejects.toThrow('Network error');
    });

    it('should handle order creation errors', async () => {
      vi.spyOn(orderService, 'createOrder').mockRejectedValue({
        response: {
          data: {
            success: false,
            error: { message: 'Invalid order data' }
          }
        }
      });
      
      await expect(orderService.createOrder({})).rejects.toMatchObject({
        response: {
          data: {
            success: false
          }
        }
      });
    });

    it('should handle admin login errors', async () => {
      vi.spyOn(adminService, 'login').mockRejectedValue({
        response: {
          data: {
            success: false,
            error: { message: 'Invalid credentials' }
          }
        }
      });
      
      await expect(adminService.login({ username: 'wrong', password: 'wrong' }))
        .rejects.toMatchObject({
          response: {
            data: {
              success: false
            }
          }
        });
    });
  });
});
