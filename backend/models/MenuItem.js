const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Menu item name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['chicken_burgers', 'beef_burgers', 'box_deals', 'drinks', 'potatoes', 'deals_night'],
        message: '{VALUE} is not a valid category'
      }
    },
    image: {
      type: String,
      default: ''
    },
    ingredients: {
      type: [String],
      default: []
    },
    portionSize: {
      type: String,
      default: ''
    },
    available: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
menuItemSchema.index({ category: 1, available: 1 });
menuItemSchema.index({ name: 1 });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
