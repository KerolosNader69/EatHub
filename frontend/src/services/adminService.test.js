import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  login,
  verifyToken,
  getOrders,
  updateOrderStatus,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from './adminService';
import api from './api';

// Mock the api module
vi.mock('./api');

// Mock cache utility
vi.mock('../utils/cache', () => ({
  invalidateCachePattern: vi.fn()
}));

// Mock retry utility
vi.mock('../utils/retryRequest', () => ({
  withRetry: (fn) => fn // Return the function as-is for testing
}));

describe('Admin Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should call API with correct credentials', async () => {
      const mockResponse = {
        data: {
          success: true,
          token: 'mock-jwt-token',
          admin: { id: '1', username: 'admin' }
        }
      };
      
      api.post.mockResolvedValue(mockResponse);
      
      const credentials = { username: 'admin', password: 'password123' };
      const result = await login(credentials);
      
      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle login errors', async () => {
      const mockError = new Error('Invalid credentials');
      api.post.mockRejectedValue(mockError);
      
      const credentials = { username: 'admin', password: 'wrong' };
      
      await expect(login(credentials)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('verifyToken', () => {
    it('should call API to verify token', async () => {
      const mockResponse = {
        data: {
          success: true,
          admin: { id: '1', username: 'admin' }
        }
      };
      
      api.post.mockResolvedValue(mockResponse);
      
      const result = await verifyToken();
      
      expect(api.post).toHaveBeenCalledWith('/auth/verify');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle verification errors', async () => {
      const mockError = new Error('Invalid token');
      api.post.mockRejectedValue(mockError);
      
      await expect(verifyToken()).rejects.toThrow('Invalid token');
    });
  });

  describe('getOrders', () => {
    it('should fetch all orders without status filter', async () => {
      const mockOrders = [
        { orderNumber: 'EH001', status: 'received' },
        { orderNumber: 'EH002', status: 'preparing' }
      ];
      
      const mockResponse = {
        data: {
          success: true,
          data: mockOrders
        }
      };
      
      api.get.mockResolvedValue(mockResponse);
      
      const result = await getOrders();
      
      expect(api.get).toHaveBeenCalledWith('/orders');
      expect(result).toEqual(mockOrders);
    });

    it('should fetch orders with status filter', async () => {
      const mockOrders = [
        { orderNumber: 'EH001', status: 'preparing' }
      ];
      
      const mockResponse = {
        data: {
          success: true,
          data: mockOrders
        }
      };
      
      api.get.mockResolvedValue(mockResponse);
      
      const result = await getOrders('preparing');
      
      expect(api.get).toHaveBeenCalledWith('/orders?status=preparing');
      expect(result).toEqual(mockOrders);
    });

    it('should handle response without nested data property', async () => {
      const mockOrders = [
        { orderNumber: 'EH001', status: 'received' }
      ];
      
      const mockResponse = {
        data: mockOrders
      };
      
      api.get.mockResolvedValue(mockResponse);
      
      const result = await getOrders();
      
      expect(result).toEqual(mockOrders);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status with correct parameters', async () => {
      const mockOrder = {
        orderNumber: 'EH001',
        status: 'preparing'
      };
      
      const mockResponse = {
        data: {
          success: true,
          data: mockOrder
        }
      };
      
      api.put.mockResolvedValue(mockResponse);
      
      const result = await updateOrderStatus('EH001', 'preparing');
      
      expect(api.put).toHaveBeenCalledWith('/orders/EH001/status', { status: 'preparing' });
      expect(result).toEqual(mockOrder);
    });

    it('should handle update errors', async () => {
      const mockError = new Error('Order not found');
      api.put.mockRejectedValue(mockError);
      
      await expect(updateOrderStatus('EH999', 'preparing')).rejects.toThrow('Order not found');
    });
  });

  describe('createMenuItem', () => {
    it('should create menu item with FormData', async () => {
      const mockMenuItem = {
        id: '1',
        name: 'Pizza',
        price: 12.99
      };
      
      const mockResponse = {
        data: {
          success: true,
          data: mockMenuItem
        }
      };
      
      api.post.mockResolvedValue(mockResponse);
      
      const formData = new FormData();
      formData.append('name', 'Pizza');
      formData.append('price', '12.99');
      
      const result = await createMenuItem(formData);
      
      expect(api.post).toHaveBeenCalledWith('/menu', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      expect(result).toEqual(mockMenuItem);
    });

    it('should invalidate cache after creating item', async () => {
      const { invalidateCachePattern } = await import('../utils/cache');
      
      const mockResponse = {
        data: {
          success: true,
          data: { id: '1', name: 'Pizza' }
        }
      };
      
      api.post.mockResolvedValue(mockResponse);
      
      const formData = new FormData();
      await createMenuItem(formData);
      
      expect(invalidateCachePattern).toHaveBeenCalledWith('menu_');
    });
  });

  describe('updateMenuItem', () => {
    it('should update menu item with FormData', async () => {
      const mockMenuItem = {
        id: '1',
        name: 'Updated Pizza',
        price: 14.99
      };
      
      const mockResponse = {
        data: {
          success: true,
          data: mockMenuItem
        }
      };
      
      api.put.mockResolvedValue(mockResponse);
      
      const formData = new FormData();
      formData.append('name', 'Updated Pizza');
      
      const result = await updateMenuItem('1', formData);
      
      expect(api.put).toHaveBeenCalledWith('/menu/1', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      expect(result).toEqual(mockMenuItem);
    });

    it('should update menu item with regular object', async () => {
      const mockMenuItem = {
        id: '1',
        name: 'Updated Pizza',
        available: false
      };
      
      const mockResponse = {
        data: {
          success: true,
          data: mockMenuItem
        }
      };
      
      api.put.mockResolvedValue(mockResponse);
      
      const updateData = { available: false };
      const result = await updateMenuItem('1', updateData);
      
      expect(api.put).toHaveBeenCalledWith('/menu/1', updateData, {});
      expect(result).toEqual(mockMenuItem);
    });

    it('should invalidate cache after updating item', async () => {
      const { invalidateCachePattern } = await import('../utils/cache');
      
      const mockResponse = {
        data: {
          success: true,
          data: { id: '1', name: 'Pizza' }
        }
      };
      
      api.put.mockResolvedValue(mockResponse);
      
      await updateMenuItem('1', { name: 'Pizza' });
      
      expect(invalidateCachePattern).toHaveBeenCalledWith('menu_');
    });
  });

  describe('deleteMenuItem', () => {
    it('should delete menu item by id', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Item deleted'
        }
      };
      
      api.delete.mockResolvedValue(mockResponse);
      
      const result = await deleteMenuItem('1');
      
      expect(api.delete).toHaveBeenCalledWith('/menu/1');
      expect(result).toEqual(mockResponse.data);
    });

    it('should invalidate cache after deleting item', async () => {
      const { invalidateCachePattern } = await import('../utils/cache');
      
      const mockResponse = {
        data: {
          success: true,
          message: 'Item deleted'
        }
      };
      
      api.delete.mockResolvedValue(mockResponse);
      
      await deleteMenuItem('1');
      
      expect(invalidateCachePattern).toHaveBeenCalledWith('menu_');
    });

    it('should handle deletion errors', async () => {
      const mockError = new Error('Item not found');
      api.delete.mockRejectedValue(mockError);
      
      await expect(deleteMenuItem('999')).rejects.toThrow('Item not found');
    });
  });
});
