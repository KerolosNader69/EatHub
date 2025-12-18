const supabase = require('../config/supabase');
const { supabaseAdmin } = require('../config/supabase');

/**
 * @desc    Get all menu items (or only available for public)
 * @route   GET /api/menu
 * @access  Public (filtered) / Admin (all items)
 */
const getMenuItems = async (req, res) => {
  try {
    // Check if request is from admin (has auth token)
    const isAdmin = req.headers.authorization;
    
    // Use admin client for admin requests to bypass RLS, regular client for public
    const client = isAdmin ? supabaseAdmin : supabase;
    
    let query = client
      .from('menu_items')
      .select('*');
    
    // If not admin, only show available items
    if (!isAdmin) {
      query = query.eq('available', true);
    }
    
    const { data: menuItems, error } = await query
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    console.log(`Fetched ${menuItems?.length || 0} menu items (isAdmin: ${!!isAdmin})`);

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
    const { 
      name, description, price, discountPrice, category, ingredients, portionSize, available
    } = req.body;

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
      available: available === 'false' || available === false ? false : true
    };

    // Add discount_price if provided
    if (discountPrice) {
      menuItemData.discount_price = parseFloat(discountPrice);
    }

    // Add image as base64 data URL if file was uploaded
    if (req.file) {
      const base64Image = req.file.buffer.toString('base64');
      menuItemData.image = `data:${req.file.mimetype};base64,${base64Image}`;
    }

    // Create menu item in Supabase (use admin client to bypass RLS)
    const { data: menuItem, error } = await supabaseAdmin
      .from('menu_items')
      .insert([menuItemData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

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
    const { 
      name, description, price, discountPrice, category, ingredients, portionSize, available
    } = req.body;

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
    if (available !== undefined) {
      updateData.available = available === 'false' || available === false ? false : true;
    }
    
    // Handle discount_price - can be set or cleared
    if (discountPrice !== undefined) {
      updateData.discount_price = discountPrice ? parseFloat(discountPrice) : null;
    }

    // Update image as base64 data URL if new file was uploaded
    if (req.file) {
      const base64Image = req.file.buffer.toString('base64');
      updateData.image = `data:${req.file.mimetype};base64,${base64Image}`;
    }

    // Update menu item in Supabase (use admin client to bypass RLS)
    const { data: menuItem, error } = await supabaseAdmin
      .from('menu_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return res.status(404).json({
        success: false,
        error: {
          message: error.message || 'Menu item not found',
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
        message: error.message || 'Failed to update menu item',
        code: 'UPDATE_ERROR'
      }
    });
  }
};

/**
 * @desc    Get featured menu items
 * @route   GET /api/menu/featured
 * @access  Public
 */
const getFeaturedItems = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6; // Default to 6 items

    // Since we can't modify the database schema, we'll get the first few available items
    // and treat them as featured items for demonstration purposes
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Add featured properties to the items
    const featuredItems = (menuItems || []).map((item, index) => ({
      ...item,
      is_featured: true,
      featured_order: index + 1
    }));

    res.status(200).json({
      success: true,
      data: featuredItems
    });
  } catch (error) {
    console.error('Error fetching featured items:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch featured items',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * @desc    Get active announcement for promo banner
 * @route   GET /api/menu/announcement
 * @access  Public
 */
const getAnnouncement = async (_req, res) => {
  try {
    // First try to get an item with a discount price (prioritize discounted items)
    let { data: items, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .not('image', 'is', null)
      .not('discount_price', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);

    // If no discounted items, get the newest item with an image
    if (error || !items || items.length === 0) {
      const result = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .not('image', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);
      
      items = result.data;
      error = result.error;
    }

    if (error) {
      console.log('Error fetching announcement:', error.message);
      return res.status(200).json({
        success: true,
        data: null
      });
    }

    const item = items && items.length > 0 ? items[0] : null;

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(200).json({
      success: true,
      data: null
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
    
    console.log(`Attempting to delete menu item with ID: ${id}`);

    // First, check if the item exists
    const { data: existingItem, error: checkError } = await supabaseAdmin
      .from('menu_items')
      .select('id, name')
      .eq('id', id)
      .single();

    if (checkError || !existingItem) {
      console.log('Menu item not found:', checkError);
      return res.status(404).json({
        success: false,
        error: {
          message: 'Menu item not found',
          code: 'NOT_FOUND'
        }
      });
    }

    console.log(`Found item to delete: ${existingItem.name}`);

    // Check if the item is referenced in any orders
    const { data: orderItems, error: orderCheckError } = await supabaseAdmin
      .from('order_items')
      .select('id')
      .eq('menu_item_id', id)
      .limit(1);

    if (orderCheckError) {
      console.error('Error checking order references:', orderCheckError);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to check order references',
          code: 'CHECK_ERROR'
        }
      });
    }

    if (orderItems && orderItems.length > 0) {
      console.log(`Cannot delete item ${existingItem.name} - it has order references`);
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete menu item because it is referenced in existing orders. Consider marking it as unavailable instead.',
          code: 'REFERENCED_IN_ORDERS'
        }
      });
    }

    // Delete the item (safe to delete since no order references)
    const { error: deleteError } = await supabaseAdmin
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete operation failed:', deleteError);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to delete menu item',
          code: 'DELETE_ERROR',
          details: deleteError.message
        }
      });
    }

    console.log(`Successfully deleted menu item: ${existingItem.name}`);

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
      data: {
        id: existingItem.id,
        name: existingItem.name
      }
    });
  } catch (error) {
    console.error('Unexpected error in deleteMenuItem:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  getFeaturedItems,
  getAnnouncement,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
