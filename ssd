const express = require('express');
const router = express.Router();
const {
  getAvailableVouchers,
  validateVoucher,
  applyVoucher,
  createVoucher,
  getAllVouchers,
  updateVoucher,
  deleteVoucher
} = require('../controllers/vouchersController');
const { authenticateAdmin } = require('../middleware/auth');

// Middleware to prevent caching of voucher data
const noCacheMiddleware = (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
};

// Public routes - with no-cache headers to ensure fresh data
router.get('/available', noCacheMiddleware, getAvailableVouchers);
router.post('/validate', noCacheMiddleware, validateVoucher);
router.post('/apply', noCacheMiddleware, applyVoucher);

// Admin routes - protected
router.get('/', authenticateAdmin, getAllVouchers);
router.post('/', authenticateAdmin, createVoucher);
router.put('/:id', authenticateAdmin, updateVoucher);
router.delete('/:id', authenticateAdmin, deleteVoucher);

module.exports = router;