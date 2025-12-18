const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoriesController');
const { authenticateAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin routes - protected
router.post('/', authenticateAdmin, createCategory);
router.put('/:id', authenticateAdmin, updateCategory);
router.delete('/:id', authenticateAdmin, deleteCategory);

module.exports = router;