import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAvailableVouchers, validateVoucher } from './voucherService';
import api from './api';

// Mock the API module
vi.mock('./api');

// Mock the retry utility
vi.mock('../utils/retryRequest', () => ({
  withRetry: (fn, options) => fn
}));

// Mock the cache utility
vi.mock('../utils/cache', () => ({
  invalidateCachePattern: vi.fn()
}));

describe('VoucherService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAvailableVouchers', () => {
    it('should return available vouchers successfully', async () => {
      const mockVouchers = [
        {
          id: '1',
          code: 'SAVE10',
          title: '10% Off',
          description: 'Get 10% off your order',
          discountType: 'percentage',
          discountValue: 10,
          minimumOrder: 20,
          expiryDate: '2024-12-31T23:59:59.000Z',
          isActive: true
        },
        {
          id: '2',
          code: 'FREE5',
          title: '$5 Off',
          description: 'Get $5 off orders over $25',
          discountType: 'fixed',
          discountValue: 5,
          minimumOrder: 25,
          expiryDate: '2024-12-31T23:59:59.000Z',
          isActive: true
        }
      ];

      api.get.mockResolvedValue({
        data: {
          success: true,
          data: mockVouchers
        }
      });

      const result = await getAvailableVouchers();

      expect(api.get).toHaveBeenCalledWith('/vouchers/available');
      expect(result).toEqual(mockVouchers);
    });

    it('should handle API response with data directly in response.data', async () => {
      const mockVouchers = [
        {
          id: '1',
          code: 'SAVE10',
          title: '10% Off'
        }
      ];

      api.get.mockResolvedValue({
        data: mockVouchers
      });

      const result = await getAvailableVouchers();

      expect(result).toEqual(mockVouchers);
    });

    it('should handle empty vouchers array', async () => {
      api.get.mockResolvedValue({
        data: {
          success: true,
          data: []
        }
      });

      const result = await getAvailableVouchers();

      expect(result).toEqual([]);
    });

    it('should handle API errors and transform them', async () => {
      const apiError = new Error('Network error');
      apiError.status = 500;
      api.get.mockRejectedValue(apiError);

      await expect(getAvailableVouchers()).rejects.toMatchObject({
        message: 'Network error',
        code: 'VOUCHER_FETCH_ERROR',
        status: 500
      });
    });

    it('should handle API errors without status', async () => {
      const apiError = new Error('Unknown error');
      api.get.mockRejectedValue(apiError);

      await expect(getAvailableVouchers()).rejects.toMatchObject({
        message: 'Unknown error',
        code: 'VOUCHER_FETCH_ERROR',
        status: 500
      });
    });

    it('should handle null response data', async () => {
      api.get.mockResolvedValue({
        data: {
          success: true,
          data: null
        }
      });

      const result = await getAvailableVouchers();

      expect(result).toBeNull();
    });
  });

  describe('validateVoucher', () => {
    it('should validate voucher successfully', async () => {
      const mockValidationResult = {
        valid: true,
        discount: 10,
        discountType: 'percentage',
        message: 'Voucher applied successfully',
        voucherDetails: {
          id: '1',
          code: 'SAVE10',
          title: '10% Off'
        }
      };

      api.post.mockResolvedValue({
        data: {
          success: true,
          data: mockValidationResult
        }
      });

      const result = await validateVoucher('SAVE10', 50);

      expect(api.post).toHaveBeenCalledWith('/vouchers/validate', {
        code: 'SAVE10',
        orderTotal: 50
      });
      expect(result).toEqual(mockValidationResult);
    });

    it('should handle invalid voucher response', async () => {
      const mockValidationResult = {
        valid: false,
        discount: 0,
        message: 'Invalid voucher code'
      };

      api.post.mockResolvedValue({
        data: {
          success: true,
          data: mockValidationResult
        }
      });

      const result = await validateVoucher('INVALID', 50);

      expect(result).toMatchObject({
        valid: false,
        discount: 0,
        discountType: 'fixed',
        message: 'Invalid voucher code'
      });
    });

    it('should trim and uppercase voucher code', async () => {
      api.post.mockResolvedValue({
        data: {
          success: true,
          data: { valid: true, discount: 5 }
        }
      });

      await validateVoucher('  save10  ', 50);

      expect(api.post).toHaveBeenCalledWith('/vouchers/validate', {
        code: 'SAVE10',
        orderTotal: 50
      });
    });

    it('should validate input parameters', async () => {
      // Test invalid voucher code
      await expect(validateVoucher('', 50)).rejects.toThrow('Voucher code is required and must be a string');
      await expect(validateVoucher(null, 50)).rejects.toThrow('Voucher code is required and must be a string');
      await expect(validateVoucher(123, 50)).rejects.toThrow('Voucher code is required and must be a string');

      // Test invalid order total
      await expect(validateVoucher('SAVE10', 0)).rejects.toThrow('Order total is required and must be a positive number');
      await expect(validateVoucher('SAVE10', -10)).rejects.toThrow('Order total is required and must be a positive number');
      await expect(validateVoucher('SAVE10', 'invalid')).rejects.toThrow('Order total is required and must be a positive number');
      await expect(validateVoucher('SAVE10', null)).rejects.toThrow('Order total is required and must be a positive number');
    });

    it('should handle API errors and transform them', async () => {
      const apiError = new Error('Validation failed');
      apiError.status = 400;
      api.post.mockRejectedValue(apiError);

      await expect(validateVoucher('SAVE10', 50)).rejects.toMatchObject({
        message: 'Validation failed',
        code: 'VOUCHER_VALIDATION_ERROR',
        status: 400
      });
    });

    it('should provide default values for missing response fields', async () => {
      api.post.mockResolvedValue({
        data: {
          success: true,
          data: {
            valid: true
            // Missing other fields
          }
        }
      });

      const result = await validateVoucher('SAVE10', 50);

      expect(result).toMatchObject({
        valid: true,
        discount: 0,
        discountType: 'fixed',
        message: 'Voucher applied successfully',
        voucherDetails: null
      });
    });

    it('should handle response with data directly in response.data', async () => {
      const mockResult = {
        valid: true,
        discount: 15,
        discountType: 'percentage'
      };

      api.post.mockResolvedValue({
        data: mockResult
      });

      const result = await validateVoucher('SAVE15', 100);

      expect(result).toMatchObject({
        valid: true,
        discount: 15,
        discountType: 'percentage'
      });
    });

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.code = 'NETWORK_ERROR';
      api.post.mockRejectedValue(timeoutError);

      await expect(validateVoucher('SAVE10', 50)).rejects.toMatchObject({
        message: 'Request timeout',
        code: 'VOUCHER_VALIDATION_ERROR'
      });
    });
  });
});