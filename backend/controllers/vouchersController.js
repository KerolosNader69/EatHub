const supabase = require('../config/supabase');
const supabaseAdmin = require('../config/supabase').supabaseAdmin || supabase;
const fs = require('fs');
const path = require('path');

// Helper functions for JSON file operations
function readVouchersData() {
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'vouchers.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading vouchers data:', error);
    return [];
  }
}

function writeVouchersData(vouchers) {
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'vouchers.json');
    fs.writeFileSync(dataPath, JSON.stringify(vouchers, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing vouchers data:', error);
    return false;
  }
}

/**
 * @desc    Get all available vouchers
 * @route   GET /api/vouchers/available
 * @access  Public
 */
const getAvailableVouchers = async (req, res) => {
  try {
    const now = new Date().toISOString();

    // Fetch active vouchers from Supabase
    const { data: vouchers, error } = await supabase
      .from('vouchers')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filter available vouchers based on expiry and usage limit
    const availableVouchers = (vouchers || []).filter(voucher => {
      // Check expiry date
      if (voucher.expiry_date && new Date(voucher.expiry_date) < new Date(now)) return false;
      
      // Check usage limit
      if (voucher.usage_limit !== null && voucher.used_count >= voucher.usage_limit) return false;
      
      return true;
    });

    res.status(200).json({
      success: true,
      data: availableVouchers
    });
  } catch (error) {
    console.error('Error fetching available vouchers:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch available vouchers',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * @desc    Validate voucher code
 * @route   POST /api/vouchers/validate
 * @access  Public
 */
const validateVoucher = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code || orderTotal === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide voucher code and order total',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Find the voucher in Supabase
    const { data: voucher, error: fetchError } = await supabase
      .from('vouchers')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (fetchError || !voucher) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Invalid voucher code',
          code: 'INVALID_VOUCHER'
        }
      });
    }

    // Check if voucher has expired
    if (voucher.expiry_date && new Date(voucher.expiry_date) < new Date()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Voucher has expired',
          code: 'EXPIRED_VOUCHER'
        }
      });
    }

    // Check usage limit
    if (voucher.usage_limit !== null && voucher.used_count >= voucher.usage_limit) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Voucher usage limit reached',
          code: 'USAGE_LIMIT_REACHED'
        }
      });
    }

    // Check minimum order amount
    if (orderTotal < voucher.minimum_order) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Minimum order amount is $${voucher.minimum_order}`,
          code: 'MINIMUM_ORDER_NOT_MET'
        }
      });
    }

    // Calculate discount
    let discount = 0;
    if (voucher.discount_type === 'percentage') {
      discount = (orderTotal * voucher.discount_value) / 100;
    } else if (voucher.discount_type === 'fixed') {
      discount = voucher.discount_value;
    }

    // Ensure discount doesn't exceed order total
    discount = Math.min(discount, orderTotal);

    res.status(200).json({
      success: true,
      data: {
        valid: true,
        voucher: {
          id: voucher.id,
          code: voucher.code,
          title: voucher.title,
          description: voucher.description,
          discount_type: voucher.discount_type,
          discount_value: voucher.discount_value
        },
        discount: parseFloat(discount.toFixed(2)),
        finalTotal: parseFloat((orderTotal - discount).toFixed(2))
      }
    });
  } catch (error) {
    console.error('Error validating voucher:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to validate voucher',
        code: 'VALIDATION_ERROR'
      }
    });
  }
};

/**
 * @desc    Apply voucher (increment usage count)
 * @route   POST /api/vouchers/apply
 * @access  Public
 */
const applyVoucher = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide voucher code',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // First, get the current voucher to increment usage count
    // Use admin client to bypass RLS policies
    const { data: currentVoucher, error: fetchError } = await supabaseAdmin
      .from('vouchers')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (fetchError || !currentVoucher) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Voucher not found',
          code: 'NOT_FOUND'
        }
      });
    }

    // Increment usage count
    const { data: voucher, error } = await supabaseAdmin
      .from('vouchers')
      .update({ 
        used_count: (currentVoucher.used_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('code', code.toUpperCase())
      .select()
      .single();

    if (error || !voucher) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Voucher not found',
          code: 'NOT_FOUND'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Voucher applied successfully',
        voucher: {
          code: voucher.code,
          used_count: voucher.used_count
        }
      }
    });
  } catch (error) {
    console.error('Error applying voucher:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to apply voucher',
        code: 'APPLICATION_ERROR'
      }
    });
  }
};

/**
 * @desc    Create new voucher (Admin only)
 * @route   POST /api/vouchers
 * @access  Private/Admin
 */
const createVoucher = async (req, res) => {
  try {
    const { 
      code, 
      title, 
      description, 
      discountType, 
      discountValue, 
      minimumOrder, 
      expiryDate, 
      usageLimit 
    } = req.body;

    // Validate required fields
    if (!code || !title || !discountType || !discountValue) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide code, title, discountType, and discountValue',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const voucherData = {
      code: code.toUpperCase(),
      title,
      description: description || '',
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      minimum_order: minimumOrder ? parseFloat(minimumOrder) : 0,
      expiry_date: expiryDate ? new Date(expiryDate).toISOString() : null,
      usage_limit: usageLimit ? parseInt(usageLimit) : null,
      is_active: true,
      used_count: 0
    };

    // Use admin client to bypass RLS policies
    const { data: voucher, error } = await supabaseAdmin
      .from('vouchers')
      .insert([voucherData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: voucher
    });
  } catch (error) {
    console.error('Error creating voucher:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({
        success: false,
        error: {
          message: 'Voucher code already exists',
          code: 'DUPLICATE_CODE'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create voucher',
        code: 'CREATE_ERROR'
      }
    });
  }
};

/**
 * @desc    Get all vouchers (Admin only)
 * @route   GET /api/vouchers
 * @access  Private/Admin
 */
const getAllVouchers = async (req, res) => {
  try {
    // Use admin client to bypass RLS policies
    const { data: vouchers, error } = await supabaseAdmin
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: vouchers
    });
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch vouchers',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * @desc    Update voucher (Admin only)
 * @route   PUT /api/vouchers/:id
 * @access  Private/Admin
 */
const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      code, 
      title, 
      description, 
      discountType, 
      discountValue, 
      minimumOrder, 
      expiryDate, 
      usageLimit,
      isActive 
    } = req.body;

    const updateData = {};
    if (code !== undefined) updateData.code = code.toUpperCase();
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (discountType !== undefined) updateData.discount_type = discountType;
    if (discountValue !== undefined) updateData.discount_value = parseFloat(discountValue);
    if (minimumOrder !== undefined) updateData.minimum_order = parseFloat(minimumOrder);
    if (expiryDate !== undefined) updateData.expiry_date = expiryDate ? new Date(expiryDate).toISOString() : null;
    if (usageLimit !== undefined) updateData.usage_limit = usageLimit ? parseInt(usageLimit) : null;
    if (isActive !== undefined) updateData.is_active = isActive;

    // Use admin client to bypass RLS policies
    const { data: voucher, error } = await supabaseAdmin
      .from('vouchers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !voucher) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Voucher not found',
          code: 'NOT_FOUND'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: voucher
    });
  } catch (error) {
    console.error('Error updating voucher:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update voucher',
        code: 'UPDATE_ERROR'
      }
    });
  }
};

/**
 * @desc    Delete voucher (Admin only)
 * @route   DELETE /api/vouchers/:id
 * @access  Private/Admin
 */
const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    // Use admin client to bypass RLS policies
    const { error } = await supabaseAdmin
      .from('vouchers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Voucher deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting voucher:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete voucher',
        code: 'DELETE_ERROR'
      }
    });
  }
};

module.exports = {
  getAvailableVouchers,
  validateVoucher,
  applyVoucher,
  createVoucher,
  getAllVouchers,
  updateVoucher,
  deleteVoucher
};