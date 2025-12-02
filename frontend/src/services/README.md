# API Services Documentation

This directory contains service modules for making API calls to the Eat Hub backend.

## Available Services

### menuService

Handles menu-related API operations.

**Methods:**
- `getMenuItems()` - Fetch all menu items
- `getMenuItem(id)` - Fetch a single menu item by ID

**Example:**
```javascript
import { menuService } from '../services';

const items = await menuService.getMenuItems();
const item = await menuService.getMenuItem('123');
```

### orderService

Handles customer order operations.

**Methods:**
- `createOrder(orderData)` - Create a new order
- `getOrderStatus(orderNumber)` - Get order status by order number

**Example:**
```javascript
import { orderService } from '../services';

const order = await orderService.createOrder({
  items: [{ itemId: '123', quantity: 2 }],
  customerInfo: {
    name: 'John Doe',
    phone: '1234567890',
    address: '123 Main St'
  },
  specialInstructions: 'Extra sauce'
});

const status = await orderService.getOrderStatus('EH123456');
```

### adminService

Handles admin-only operations (requires authentication).

**Methods:**
- `login(credentials)` - Admin login
- `verifyToken()` - Verify JWT token
- `getOrders(status)` - Get all orders (optional status filter)
- `updateOrderStatus(orderNumber, status)` - Update order status
- `createMenuItem(formData)` - Create new menu item
- `updateMenuItem(id, data)` - Update menu item
- `deleteMenuItem(id)` - Delete menu item

**Example:**
```javascript
import { adminService } from '../services';

// Login
const response = await adminService.login({ username: 'admin', password: 'pass' });

// Get orders
const orders = await adminService.getOrders('preparing');

// Update order status
await adminService.updateOrderStatus('EH123456', 'out_for_delivery');

// Create menu item
const formData = new FormData();
formData.append('name', 'Pizza');
formData.append('price', 12.99);
formData.append('image', fileInput.files[0]);
await adminService.createMenuItem(formData);
```

## API Configuration

The base API URL is configured via environment variable:

```env
VITE_API_URL=http://localhost:5000/api
```

## Error Handling

All services use a centralized error handling system. Errors are returned in a consistent format:

```javascript
{
  message: 'User-friendly error message',
  code: 'ERROR_CODE',
  status: 400
}
```

**Example error handling:**
```javascript
try {
  const items = await menuService.getMenuItems();
} catch (error) {
  console.error(error.message); // User-friendly message
  console.error(error.code);    // Error code
  console.error(error.status);  // HTTP status
}
```

## Authentication

Admin services automatically include the JWT token from localStorage in request headers. The token is managed by the AuthContext.
