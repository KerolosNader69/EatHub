import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getRewardsStatus, redeemReward } from './rewardsService';
import api from './api';

// Mock the API module
vi.mock('./api');

// Mock the retry utility
vi.mock('../utils/retryRequest', () => ({
  withRetry: (fn, options) => fn
}));

// Mock the cache utility
vi.mock('../utils/cache', () => ({
  withCache: (key, fn, ttl) => fn(),
  CACHE_KEYS: {
    REWARDS_STATUS: 'rewards_status'
  },
  CACHE_TTL: {
    REWARDS_STATUS: 1800000
  },
  invalidateCachePattern: vi.fn()
}));

describe('RewardsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getRewardsStatus', () => {
    it('should return rewards status successfully', async () => {
      const mockRewardsData = {
        currentPoints: 250,
        totalEarned: 1000,
        availableRewards: [
          {
            id: 'reward1',
            title: 'Free Delivery',
            description: 'Get free delivery on your next order',
            pointsCost: 100,
            rewardType: 'discount'
          },
          {
            id: 'reward2',
            title: 'Free Appetizer',
            description: 'Get a free appetizer with any main course',
            pointsCost: 200,
            rewardType: 'free_item'
          }
        ],
        isLoggedIn: true,
        userId: 'user123'
      };

      api.get.mockResolvedValue({
        data: {
          success: true,
          data: mockRewardsData
        }
      });

      const result = await getRewardsStatus();

      expect(api.get).toHaveBeenCalledWith('/rewards/status');
      expect(result).toEqual(mockRewardsData);
    });

    it('should handle API response with data directly in response.data', async () => {
      const mockRewardsData = {
        currentPoints: 150,
        totalEarned: 500,
        availableRewards: []
      };

      api.get.mockResolvedValue({
        data: mockRewardsData
      });

      const result = await getRewardsStatus();

      expect(result).toMatchObject({
        currentPoints: 150,
        totalEarned: 500,
        availableRewards: [],
        isLoggedIn: true,
        userId: null
      });
    });

    it('should provide default values for missing fields', async () => {
      api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            // Missing most fields
          }
        }
      });

      const result = await getRewardsStatus();

      expect(result).toMatchObject({
        currentPoints: 0,
        totalEarned: 0,
        availableRewards: [],
        isLoggedIn: true,
        userId: null
      });
    });

    it('should handle authentication errors gracefully', async () => {
      const authError = new Error('Unauthorized');
      authError.status = 401;
      api.get.mockRejectedValue(authError);

      const result = await getRewardsStatus();

      expect(result).toEqual({
        currentPoints: 0,
        totalEarned: 0,
        availableRewards: [],
        isLoggedIn: false,
        userId: null,
        message: 'Please log in to view rewards'
      });
    });

    it('should handle forbidden errors gracefully', async () => {
      const forbiddenError = new Error('Forbidden');
      forbiddenError.status = 403;
      api.get.mockRejectedValue(forbiddenError);

      const result = await getRewardsStatus();

      expect(result).toEqual({
        currentPoints: 0,
        totalEarned: 0,
        availableRewards: [],
        isLoggedIn: false,
        userId: null,
        message: 'Please log in to view rewards'
      });
    });

    it('should handle server errors and transform them', async () => {
      const serverError = new Error('Internal server error');
      serverError.status = 500;
      api.get.mockRejectedValue(serverError);

      await expect(getRewardsStatus()).rejects.toMatchObject({
        message: 'Internal server error',
        code: 'REWARDS_FETCH_ERROR',
        status: 500
      });
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      api.get.mockRejectedValue(networkError);

      await expect(getRewardsStatus()).rejects.toMatchObject({
        message: 'Network error',
        code: 'REWARDS_FETCH_ERROR',
        status: 500
      });
    });

    it('should handle isLoggedIn false explicitly', async () => {
      api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            currentPoints: 0,
            isLoggedIn: false
          }
        }
      });

      const result = await getRewardsStatus();

      expect(result.isLoggedIn).toBe(false);
    });
  });

  describe('redeemReward', () => {
    it('should redeem reward successfully', async () => {
      const mockRedemptionResult = {
        success: true,
        newBalance: 150,
        pointsRedeemed: 100,
        reward: {
          id: 'reward1',
          title: 'Free Delivery',
          description: 'Get free delivery on your next order'
        },
        message: 'Reward redeemed successfully',
        transactionId: 'txn123'
      };

      api.post.mockResolvedValue({
        data: {
          success: true,
          data: mockRedemptionResult
        }
      });

      const result = await redeemReward('reward1', 100);

      expect(api.post).toHaveBeenCalledWith('/rewards/redeem', {
        rewardId: 'reward1',
        pointsToRedeem: 100
      });
      expect(result).toEqual(mockRedemptionResult);
    });

    it('should handle API response with data directly in response.data', async () => {
      const mockResult = {
        newBalance: 50,
        pointsRedeemed: 200,
        reward: { id: 'reward2', title: 'Free Appetizer' }
      };

      api.post.mockResolvedValue({
        data: mockResult
      });

      const result = await redeemReward('reward2', 200);

      expect(result).toMatchObject({
        success: true,
        newBalance: 50,
        pointsRedeemed: 200,
        reward: { id: 'reward2', title: 'Free Appetizer' },
        message: 'Reward redeemed successfully',
        transactionId: null
      });
    });

    it('should validate input parameters', async () => {
      // Test invalid reward ID
      await expect(redeemReward('', 100)).rejects.toThrow('Reward ID is required and must be a string');
      await expect(redeemReward(null, 100)).rejects.toThrow('Reward ID is required and must be a string');
      await expect(redeemReward(123, 100)).rejects.toThrow('Reward ID is required and must be a string');

      // Test invalid points
      await expect(redeemReward('reward1', 0)).rejects.toThrow('Points to redeem is required and must be a positive number');
      await expect(redeemReward('reward1', -50)).rejects.toThrow('Points to redeem is required and must be a positive number');
      await expect(redeemReward('reward1', 'invalid')).rejects.toThrow('Points to redeem is required and must be a positive number');
      await expect(redeemReward('reward1', null)).rejects.toThrow('Points to redeem is required and must be a positive number');
    });

    it('should handle API errors and transform them', async () => {
      const apiError = new Error('Insufficient points');
      apiError.status = 400;
      api.post.mockRejectedValue(apiError);

      await expect(redeemReward('reward1', 1000)).rejects.toMatchObject({
        message: 'Insufficient points',
        code: 'REWARD_REDEMPTION_ERROR',
        status: 400
      });
    });

    it('should provide default values for missing response fields', async () => {
      api.post.mockResolvedValue({
        data: {
          success: true,
          data: {
            newBalance: 75
            // Missing other fields
          }
        }
      });

      const result = await redeemReward('reward1', 100);

      expect(result).toMatchObject({
        success: true,
        newBalance: 75,
        pointsRedeemed: 100,
        reward: null,
        message: 'Reward redeemed successfully',
        transactionId: null
      });
    });

    it('should handle failed redemption response', async () => {
      api.post.mockResolvedValue({
        data: {
          success: false,
          data: {
            success: false,
            newBalance: 250,
            message: 'Reward not available'
          }
        }
      });

      const result = await redeemReward('reward1', 100);

      expect(result).toMatchObject({
        success: false,
        newBalance: 250,
        message: 'Reward not available'
      });
    });

    it('should handle server errors', async () => {
      const serverError = new Error('Server error');
      serverError.status = 500;
      api.post.mockRejectedValue(serverError);

      await expect(redeemReward('reward1', 100)).rejects.toMatchObject({
        message: 'Server error',
        code: 'REWARD_REDEMPTION_ERROR',
        status: 500
      });
    });

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.code = 'NETWORK_ERROR';
      api.post.mockRejectedValue(timeoutError);

      await expect(redeemReward('reward1', 100)).rejects.toMatchObject({
        message: 'Request timeout',
        code: 'REWARD_REDEMPTION_ERROR'
      });
    });
  });
});