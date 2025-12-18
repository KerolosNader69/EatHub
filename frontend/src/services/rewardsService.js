import api from './api';
import { withRetry } from '../utils/retryRequest';
import { withCache, CACHE_KEYS, CACHE_TTL, invalidateCachePattern } from '../utils/cache';

/**
 * Rewards Service
 * Handles all rewards-related API calls with caching, error handling and response transformation
 */

/**
 * Get rewards status (base function without caching)
 * @returns {Promise<Object>} Rewards status with points and available rewards
 */
const getRewardsStatusBase = async () => {
  try {
    const response = await api.get('/rewards/status');
    const result = response.data.data || response.data;
    
    // Transform response to ensure consistent structure
    return {
      currentPoints: result.currentPoints || 0,
      totalEarned: result.totalEarned || 0,
      availableRewards: result.availableRewards || [],
      isLoggedIn: result.isLoggedIn !== false, // Default to true if not specified
      userId: result.userId || null
    };
  } catch (error) {
    console.error('Error fetching rewards status:', error);
    
    // Handle authentication errors gracefully
    if (error.status === 401 || error.status === 403) {
      return {
        currentPoints: 0,
        totalEarned: 0,
        availableRewards: [],
        isLoggedIn: false,
        userId: null,
        message: 'Please log in to view rewards'
      };
    }
    
    // Transform error for consistent handling
    const transformedError = {
      message: error.message || 'Failed to fetch rewards status',
      code: error.code || 'REWARDS_FETCH_ERROR',
      status: error.status || 500,
      data: error.data || null
    };
    
    throw transformedError;
  }
};

/**
 * Redeem reward (base function without caching)
 * @param {string} rewardId - ID of the reward to redeem
 * @param {number} pointsToRedeem - Number of points to redeem
 * @returns {Promise<Object>} Redemption result with new balance and reward details
 */
const redeemRewardBase = async (rewardId, pointsToRedeem) => {
  try {
    if (!rewardId || typeof rewardId !== 'string') {
      throw new Error('Reward ID is required and must be a string');
    }
    
    if (!pointsToRedeem || typeof pointsToRedeem !== 'number' || pointsToRedeem <= 0) {
      throw new Error('Points to redeem is required and must be a positive number');
    }

    const response = await api.post('/rewards/redeem', {
      rewardId,
      pointsToRedeem
    });
    
    const result = response.data.data || response.data;
    
    // Transform response to ensure consistent structure
    return {
      success: result.success !== false,
      newBalance: result.newBalance || 0,
      pointsRedeemed: result.pointsRedeemed || pointsToRedeem,
      reward: result.reward || null,
      message: result.message || 'Reward redeemed successfully',
      transactionId: result.transactionId || null
    };
  } catch (error) {
    console.error('Error redeeming reward:', error);
    
    // Transform error for consistent handling
    const transformedError = {
      message: error.message || 'Failed to redeem reward',
      code: error.code || 'REWARD_REDEMPTION_ERROR',
      status: error.status || 500,
      data: error.data || null
    };
    
    throw transformedError;
  }
};

/**
 * Get rewards status with caching and retry logic
 * @param {boolean} forceRefresh - Skip cache and fetch fresh data
 * @returns {Promise<Object>} Rewards status with points and available rewards
 */
export const getRewardsStatus = async (forceRefresh = false) => {
  if (forceRefresh) {
    invalidateCachePattern('rewards_status');
  }
  
  return withCache(
    CACHE_KEYS.REWARDS_STATUS,
    () => withRetry(getRewardsStatusBase, { 
      maxRetries: 2,
      shouldRetry: (error) => {
        // Don't retry on authentication errors
        if (error.status === 401 || error.status === 403) {
          return false;
        }
        // Don't retry on other client errors except network issues
        if (error.status >= 400 && error.status < 500 && error.code !== 'NETWORK_ERROR') {
          return false;
        }
        return true;
      }
    })(),
    CACHE_TTL.REWARDS_STATUS
  );
};

/**
 * Redeem reward with retry logic
 * @param {string} rewardId - ID of the reward to redeem
 * @param {number} pointsToRedeem - Number of points to redeem
 * @returns {Promise<Object>} Redemption result with new balance and reward details
 */
export const redeemReward = async (rewardId, pointsToRedeem) => {
  const result = await withRetry(() => redeemRewardBase(rewardId, pointsToRedeem), { 
    maxRetries: 1, // Only retry once for redemption to avoid double redemption
    shouldRetry: (error) => {
      // Only retry on network errors or server errors, not business logic errors
      if (error.status >= 400 && error.status < 500) {
        return false;
      }
      return error.code === 'NETWORK_ERROR' || error.status >= 500;
    }
  })();
  
  // Invalidate rewards cache after successful redemption
  if (result.success) {
    invalidateRewardsCache();
  }
  
  return result;
};

/**
 * Invalidate rewards cache (call after rewards updates)
 */
export const invalidateRewardsCache = () => {
  invalidateCachePattern('rewards_');
};

const rewardsService = {
  getRewardsStatus,
  redeemReward,
  invalidateRewardsCache
};

export default rewardsService;