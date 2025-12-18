const express = require('express');
const router = express.Router();
const {
  getRewardsStatus,
  redeemReward,
  earnPoints,
  getAllRewards,
  createReward,
  updateReward,
  deleteReward
} = require('../controllers/rewardsController');
const { authenticateAdmin } = require('../middleware/auth');

// Public routes (but may require user context)
router.get('/status', getRewardsStatus);
router.post('/redeem', redeemReward);
router.post('/earn', earnPoints);

// Admin routes - protected
router.get('/', authenticateAdmin, getAllRewards);
router.post('/', authenticateAdmin, createReward);
router.put('/:id', authenticateAdmin, updateReward);
router.delete('/:id', authenticateAdmin, deleteReward);

module.exports = router;