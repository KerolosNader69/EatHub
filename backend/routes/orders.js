const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderByNumber,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { authenticateAdmin } = require('../middleware/auth');

// Customer order endpoints
router.post('/', createOrder);

// Admin order endpoints (protected)
router.get('/', authenticateAdmin, getAllOrders);

// Public order lookup endpoint
router.get('/:orderNumber', getOrderByNumber);

// Admin order status update (protected)
router.put('/:orderNumber/status', authenticateAdmin, updateOrderStatus);

module.exports = router;
