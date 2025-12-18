const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  getFeaturedItems,
  getAnnouncement,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../config/multer');

// Public routes - customer-facing
router.get('/', getMenuItems);
router.get('/featured', getFeaturedItems);
router.get('/announcement', getAnnouncement);
router.get('/:id', getMenuItemById);

// Admin routes - protected
router.post('/', authenticateAdmin, upload.single('image'), createMenuItem);
router.put('/:id', authenticateAdmin, upload.single('image'), updateMenuItem);
router.delete('/:id', authenticateAdmin, deleteMenuItem);

module.exports = router;
