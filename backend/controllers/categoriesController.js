const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');

// Helper function to read categories from JSON file
function readCategoriesData() {
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'categories.json');
    console.log('Reading categories from:', dataPath);
    const data = fs.readFileSync(dataPath, 'utf8');
    const categories = JSON.parse(data);
    console.log('Categories loaded:', categories.length);
    return categories;
  } catch (error) {
    console.error('Error reading categories data:', error);
    console.error('Attempted path:', path.join(__dirname, '..', 'data', 'categories.json'));
    // Return empty array as fallback
    return [];
  }
}

// Helper function to write categories to JSON file
function writeCategoriesData(categories) {
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'categories.json');
    fs.writeFileSync(dataPath, JSON.stringify(categories, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing categories data:', error);
    return false;
  }
}

/**
 * @desc    Get all active categories with item counts
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res) => {
  try {
    // Get all active categories from JSON file
    const categories = readCategoriesData().filter(cat => cat.is_active);

    // Get item counts for each category from menu_items table
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const { count, error: countError } = await supabase
          .from('menu_items')
          .select('*', { count: 'exact', head: true })
          .eq('category', category.name)
          .eq('available', true);

        if (countError) {
          console.error(`Error counting items for category ${category.name}:`, countError);
        }

        return {
          ...category,
          itemCount: count || 0
        };
      })
    );

    res.status(200).json({
      success: true,
      data: categoriesWithCounts
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch categories',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * @desc    Get single category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const categories = readCategoriesData();
    const category = categories.find(cat => cat.id === id && cat.is_active);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Category not found',
          code: 'NOT_FOUND'
        }
      });
    }

    // Get item count for this category
    const { count, error: countError } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true })
      .eq('category', category.name)
      .eq('available', true);

    if (countError) {
      console.error(`Error counting items for category ${category.name}:`, countError);
    }

    const categoryWithCount = {
      ...category,
      itemCount: count || 0
    };

    res.status(200).json({
      success: true,
      data: categoryWithCount
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch category',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * @desc    Create new category (Admin only)
 * @route   POST /api/categories
 * @access  Private/Admin
 */
const createCategory = async (req, res) => {
  try {
    const { name, displayName, icon, backgroundColor, sortOrder } = req.body;

    // Validate required fields
    if (!name || !displayName) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide name and displayName',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const categoryData = {
      name: name.toLowerCase().replace(/\s+/g, '-'),
      display_name: displayName,
      icon: icon || '📁',
      background_color: backgroundColor || '#FFE5E5',
      sort_order: sortOrder || 0,
      is_active: true
    };

    const { data: category, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({
        success: false,
        error: {
          message: 'Category name already exists',
          code: 'DUPLICATE_NAME'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create category',
        code: 'CREATE_ERROR'
      }
    });
  }
};

/**
 * @desc    Update category (Admin only)
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, displayName, icon, backgroundColor, sortOrder, isActive } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.toLowerCase().replace(/\s+/g, '-');
    if (displayName !== undefined) updateData.display_name = displayName;
    if (icon !== undefined) updateData.icon = icon;
    if (backgroundColor !== undefined) updateData.background_color = backgroundColor;
    if (sortOrder !== undefined) updateData.sort_order = sortOrder;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data: category, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !category) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Category not found',
          code: 'NOT_FOUND'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update category',
        code: 'UPDATE_ERROR'
      }
    });
  }
};

/**
 * @desc    Delete category (Admin only)
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has menu items
    const { count, error: countError } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true })
      .eq('category', id);

    if (countError) {
      console.error('Error checking menu items:', countError);
    }

    if (count > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete category with existing menu items',
          code: 'HAS_MENU_ITEMS'
        }
      });
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete category',
        code: 'DELETE_ERROR'
      }
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};