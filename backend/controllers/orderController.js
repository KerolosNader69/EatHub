const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

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

      const menuItem = await MenuItem.findById(item.itemId);

      if (!menuItem) {
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
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity
      });

      totalAmount += menuItem.price * item.quantity;
    }

    // Generate unique order number
    const orderNumber = generateOrderNumber();

    // Set estimated delivery time (current time + 45 minutes)
    const estimatedDelivery = new Date(Date.now() + 45 * 60 * 1000);

    // Create order
    const order = await Order.create({
      orderNumber,
      items: orderItems,
      customerInfo: {
        name: customerInfo.name.trim(),
        phone: customerInfo.phone.trim(),
        address: customerInfo.address.trim()
      },
      specialInstructions: specialInstructions || '',
      totalAmount,
      estimatedDelivery,
      status: 'received'
    });

    res.status(201).json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        estimatedDelivery: order.estimatedDelivery,
        order
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

    const order = await Order.findOne({ orderNumber }).populate('items.menuItem');

    if (!order) {
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

module.exports = {
  createOrder,
  getOrderByNumber
};

/**
 * @route   GET /api/orders
 * @desc    Get all orders (admin only)
 * @access  Private/Admin
 */
const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    // Build query filter
    const filter = {};
    if (status) {
      // Validate status value
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
      filter.status = status;
    }

    // Fetch orders sorted by createdAt descending (newest first)
    const orders = await Order.find(filter)
      .populate('items.menuItem')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
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

    // Find and update order
    const order = await Order.findOneAndUpdate(
      { orderNumber },
      { status },
      { new: true, runValidators: true }
    ).populate('items.menuItem');

    if (!order) {
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
