const supabase = require('../config/supabase');

/**
 * Generate unique order number
 * Format: "EH" + timestamp + random 4-digit number
 */
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `EH${timestamp}${random}`;
};

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Public
 */
const createOrder = async (req, res) => {
  try {
    const { items, customerInfo, specialInstructions } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Order must contain at least one item',
          code: 'INVALID_ITEMS'
        }
      });
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Customer information (name, phone, address) is required',
          code: 'INVALID_CUSTOMER_INFO'
        }
      });
    }

    // Validate phone number (at least 10 digits)
    const phoneDigits = customerInfo.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Phone number must contain at least 10 digits',
          code: 'INVALID_PHONE'
        }
      });
    }

    // Fetch menu items and calculate total
    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      if (!item.itemId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Each item must have a valid itemId and quantity',
            code: 'INVALID_ITEM_DATA'
          }
        });
      }

      // Fetch menu item from Supabase
      const { data: menuItem, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', item.itemId)
        .single();

      if (error || !menuItem) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Menu item with ID ${item.itemId} not found`,
            code: 'ITEM_NOT_FOUND'
          }
        });
      }

      if (!menuItem.available) {
        return res.status(400).json({
          success: false,
          error: {
            message: `${menuItem.name} is currently unavailable`,
            code: 'ITEM_UNAVAILABLE'
          }
        });
      }

      orderItems.push({
        menu_item_id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity
      });

      totalAmount += parseFloat(menuItem.price) * item.quantity;
    }

    // Generate unique order number
    const orderNumber = generateOrderNumber();

    // Set estimated delivery time (current time + 45 minutes)
    const estimatedDelivery = new Date(Date.now() + 45 * 60 * 1000).toISOString();

    // Create order in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_number: orderNumber,
        customer_name: customerInfo.name.trim(),
        customer_phone: customerInfo.phone.trim(),
        customer_address: customerInfo.address.trim(),
        special_instructions: specialInstructions || '',
        total_amount: totalAmount,
        estimated_delivery: estimatedDelivery,
        status: 'received'
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const itemsToInsert = orderItems.map(item => ({
      ...item,
      order_id: order.id
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    res.status(201).json({
      success: true,
      data: {
        orderNumber: order.order_number,
        estimatedDelivery: order.estimated_delivery,
        order: {
          ...order,
          items: orderItems
        }
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create order',
        code: 'ORDER_CREATION_FAILED'
      }
    });
  }
};

/**
 * @route   GET /api/orders/:orderNumber
 * @desc    Get order details by order number
 * @access  Public
 */
const getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    // Fetch order from Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('order_number', orderNumber)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Order not found',
          code: 'ORDER_NOT_FOUND'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve order',
        code: 'ORDER_FETCH_FAILED'
      }
    });
  }
};

/**
 * @route   GET /api/orders
 * @desc    Get all orders (admin only)
 * @access  Private/Admin
 */
const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    // Build query
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status) {
      const validStatuses = ['received', 'preparing', 'out_for_delivery', 'delivered'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid status value',
            code: 'INVALID_STATUS'
          }
        });
      }
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: orders || []
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve orders',
        code: 'ORDERS_FETCH_FAILED'
      }
    });
  }
};

/**
 * @route   PUT /api/orders/:orderNumber/status
 * @desc    Update order status (admin only)
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { status } = req.body;

    // Validate status value
    const validStatuses = ['received', 'preparing', 'out_for_delivery', 'delivered'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid status. Must be one of: received, preparing, out_for_delivery, delivered',
          code: 'INVALID_STATUS'
        }
      });
    }

    // Update order status in Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('order_number', orderNumber)
      .select(`
        *,
        order_items (*)
      `)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Order not found',
          code: 'ORDER_NOT_FOUND'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update order status',
        code: 'ORDER_UPDATE_FAILED'
      }
    });
  }
};

module.exports = {
  createOrder,
  getOrderByNumber,
  getAllOrders,
  updateOrderStatus
};
