import api from './api';
import { withRetry } from '../utils/retryRequest';
import { invalidateCachePattern } from '../utils/cache';

/**
 * Voucher Service
 * Handles all voucher-related API calls with error handling and response transformation
 */

/**
 * Get available vouchers (base function without caching)
 * @returns {Promise<Array>} Array of available vouchers
 */
const getAvailableVouchersBase = async () => {
  try {
    // Add timestamp to prevent CDN/browser caching
    const timestamp = Date.now();
    const response = await api.get(`/vouchers/available?_t=${timestamp}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching available vouchers:', error);
    
    // Transform error for consistent handling
    const transformedError = {
      message: error.message || 'Failed to fetch vouchers',
      code: error.code || 'VOUCHER_FETCH_ERROR',
      status: error.status || 500,
      data: error.data || null
    };
    
    throw transformedError;
  }
};

/**
 * Validate voucher code (base function without caching)
 * @param {string} code - Voucher code to validate
 * @param {number} orderTotal - Total order amount for validation
 * @returns {Promise<Object>} Validation result with discount information
 */
const validateVoucherBase = async (code, orderTotal) => {
  try {
    if (!code || typeof code !== 'string') {
      throw new Error('Voucher code is required and must be a string');
    }
    
    if (!orderTotal || typeof orderTotal !== 'number' || orderTotal <= 0) {
      throw new Error('Order total is required and must be a positive number');
    }

    const response = await api.post('/vouchers/validate', {
      code: code.trim().toUpperCase(),
      orderTotal
    });
    
    const result = response.data.data || response.data;
    
    // Transform response to ensure consistent structure
    return {
      valid: result.valid || false,
      discount: result.discount || 0,
      discountType: result.discountType || 'fixed',
      message: result.message || (result.valid ? 'Voucher applied successfully' : 'Invalid voucher code'),
      voucherDetails: result.voucherDetails || null
    };
  } catch (error) {
    console.error('Error validating voucher:', error);
    
    // Transform error for consistent handling
    const transformedError = {
      message: error.message || 'Failed to validate voucher',
      code: error.code || 'VOUCHER_VALIDATION_ERROR',
      status: error.status || 500,
      data: error.data || null
    };
    
    throw transformedError;
  }
};

/**
 * Get available vouchers with retry logic (no caching for fresh data)
 * @returns {Promise<Array>} Array of available vouchers
 */
export const getAvailableVouchers = async () => {
  // Always fetch fresh voucher data to ensure availability is current
  return withRetry(getAvailableVouchersBase, { 
    maxRetries: 2,
    shouldRetry: (error) => {
      // Don't retry on client errors (4xx) except for timeout
      if (error.status >= 400 && error.status < 500 && error.code !== 'NETWORK_ERROR') {
        return false;
      }
      return true;
    }
  })();
};

/**
 * Validate voucher code with retry logic
 * @param {string} code - Voucher code to validate
 * @param {number} orderTotal - Total order amount for validation
 * @returns {Promise<Object>} Validation result with discount information
 */
export const validateVoucher = async (code, orderTotal) => {
  return withRetry(() => validateVoucherBase(code, orderTotal), { 
    maxRetries: 1, // Only retry once for validation to avoid multiple attempts
    shouldRetry: (error) => {
      // Only retry on network errors or server errors, not validation errors
      if (error.status >= 400 && error.status < 500) {
        return false;
      }
      return error.code === 'NETWORK_ERROR' || error.status >= 500;
    }
  })();
};

/**
 * Invalidate voucher cache (if any caching is added in the future)
 */
export const invalidateVoucherCache = () => {
  invalidateCachePattern('voucher_');
};

const voucherService = {
  getAvailableVouchers,
  validateVoucher,
  invalidateVoucherCache
};

export default voucherService;