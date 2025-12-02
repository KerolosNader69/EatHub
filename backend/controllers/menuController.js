const supabase = require('../config/supabase');

/**
 * @desc    Get all available menu items
 * @route   GET /api/menu
 * @access  Public
 */
const getMenuItems = async (req, res) => {
  try {
    // Fetch only available menu items from Supabase
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: menuItems || []
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

    // Fetch menu item from Supabase by UUID
    const { data: menuItem, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !menuItem) {
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
      price: parseFloat(price),
      category,
      ingredients: ingredients ? (Array.isArray(ingredients) ? ingredients : JSON.parse(ingredients)) : [],
      portion_size: portionSize || '',
      available: available !== undefined ? available : true
    };

    // Add image path if file was uploaded
    if (req.file) {
      menuItemData.image = `/uploads/${req.file.filename}`;
    }

    // Create menu item in Supabase
    const { data: menuItem, error } = await supabase
      .from('menu_items')
      .insert([menuItemData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Error creating menu item:', error);

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
    const { name, description, price, category, ingredients, portionSize, available } = req.body;

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category !== undefined) updateData.category = category;
    if (ingredients !== undefined) {
      updateData.ingredients = Array.isArray(ingredients) ? ingredients : JSON.parse(ingredients);
    }
    if (portionSize !== undefined) updateData.portion_size = portionSize;
    if (available !== undefined) updateData.available = available;

    // Update image if new file was uploaded
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // Update menu item in Supabase
    const { data: menuItem, error } = await supabase
      .from('menu_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !menuItem) {
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
    console.error('Error updating menu item:', error);

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

    // Delete menu item from Supabase
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) {
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
