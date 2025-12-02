const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MenuItem',
          required: true
        },
        name: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true,
          min: 0
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1']
        }
      }
    ],
    customerInfo: {
      name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
      },
      address: {
        type: String,
        required: [true, 'Delivery address is required'],
        trim: true
      }
    },
    specialInstructions: {
      type: String,
      default: ''
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: {
        values: ['received', 'preparing', 'out_for_delivery', 'delivered'],
        message: '{VALUE} is not a valid status'
      },
      default: 'received'
    },
    estimatedDelivery: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient order lookups
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
