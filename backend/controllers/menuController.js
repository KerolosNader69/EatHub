const MenuItem = require('../models/MenuItem');

/**
 * @desc    Get all available menu items
 * @route   GET /api/menu
 * @access  Public
 */
const getMenuItems = async (req, res) => {
  try {
    // Fetch only available menu items
    const menuItems = await MenuItem.find({ available: true })
      .select('-__v')
      .sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: menuItems
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch menu items',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * @desc    Get single menu item by ID
 * @route   GET /api/menu/:id
 * @access  Public
 */
const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid menu item ID format',
          code: 'INVALID_ID'
        }
      });
    }

    const menuItem = await MenuItem.findById(id).select('-__v');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Menu item not found',
          code: 'NOT_FOUND'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch menu item',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * @desc    Create new menu item (Admin only)
 * @route   POST /api/menu
 * @access  Private/Admin
 */
const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, ingredients, portionSize, available } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide all required fields: name, description, price, category',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Prepare menu item data
    const menuItemData = {
      name,
      description,
      price,
      category,
      ingredients: ingredients ? (Array.isArray(ingredients) ? ingredients : JSON.parse(ingredients)) : [],
      portionSize: portionSize || '',
      available: available !== undefined ? available : true
    };

    // Add image path if file was uploaded
    if (req.file) {
      menuItemData.image = `/uploads/${req.file.filename}`;
    }

    // Create menu item
    const menuItem = await MenuItem.create(menuItemData);

    res.status(201).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Error creating menu item:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: {
          message: messages.join(', '),
          code: 'VALIDATION_ERROR'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create menu item',
        code: 'CREATE_ERROR'
      }
    });
  }
};

/**
 * @desc    Update menu item (Admin only)
 * @route   PUT /api/menu/:id
 * @access  Private/Admin
 */
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid menu item ID format',
          code: 'INVALID_ID'
        }
      });
    }

    // Find existing menu item
    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Menu item not found',
          code: 'NOT_FOUND'
        }
      });
    }

    // Update fields
    const { name, description, price, category, ingredients, portionSize, available } = req.body;

    if (name !== undefined) menuItem.name = name;
    if (description !== undefined) menuItem.description = description;
    if (price !== undefined) menuItem.price = price;
    if (category !== undefined) menuItem.category = category;
    if (ingredients !== undefined) {
      menuItem.ingredients = Array.isArray(ingredients) ? ingredients : JSON.parse(ingredients);
    }
    if (portionSize !== undefined) menuItem.portionSize = portionSize;
    if (available !== undefined) menuItem.available = available;

    // Update image if new file was uploaded
    if (req.file) {
      menuItem.image = `/uploads/${req.file.filename}`;
    }

    // Save updated menu item
    await menuItem.save();

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Error updating menu item:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: {
          message: messages.join(', '),
          code: 'VALIDATION_ERROR'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update menu item',
        code: 'UPDATE_ERROR'
      }
    });
  }
};

/**
 * @desc    Delete menu item (Admin only)
 * @route   DELETE /api/menu/:id
 * @access  Private/Admin
 */
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid menu item ID format',
          code: 'INVALID_ID'
        }
      });
    }

    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Menu item not found',
          code: 'NOT_FOUND'
        }
      });
    }

    await MenuItem.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete menu item',
        code: 'DELETE_ERROR'
      }
    });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
