/**
 * Example Usage Guide for Context and Services
 * 
 * This file demonstrates how to use the CartContext, AuthContext, and API services
 * in your React components.
 */

// ============================================
// 1. CART CONTEXT USAGE
// ============================================

/*
// In your component:
import { useCart } from '../context';

function MenuItemCard({ item }) {
  const { addItem, items, itemCount, totalPrice } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    });
  };

  return (
    <div>
      <h3>{item.name}</h3>
      <p>${item.price}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
      <p>Cart has {itemCount} items, Total: ${totalPrice.toFixed(2)}</p>
    </div>
  );
}
*/

// ============================================
// 2. AUTH CONTEXT USAGE
// ============================================

/*
// In your admin login component:
import { useAuth } from '../context';
import { adminService } from '../services';

function AdminLogin() {
  const { login, isAuthenticated, error } = useAuth();

  const handleLogin = async (username, password) => {
    try {
      const response = await adminService.login({ username, password });
      login(response.token, response.admin);
      // Redirect to admin dashboard
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" />;
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin(e.target.username.value, e.target.password.value);
    }}>
      <input name="username" placeholder="Username" />
      <input name="password" type="password" placeholder="Password" />
      <button type="submit">Login</button>
      {error && <p>{error}</p>}
    </form>
  );
}
*/

// ============================================
// 3. API SERVICES USAGE
// ============================================

/*
// Menu Service Example:
import { menuService } from '../services';

async function loadMenuItems() {
  try {
    const items = await menuService.getMenuItems();
    console.log('Menu items:', items);
  } catch (error) {
    console.error('Failed to load menu:', error.message);
  }
}

// Order Service Example:
import { orderService } from '../services';

async function placeOrder(cartItems, customerInfo) {
  try {
    const orderData = {
      items: cartItems.map(item => ({
        itemId: item.id,
        quantity: item.quantity
      })),
      customerInfo: {
        name: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address
      },
      specialInstructions: customerInfo.instructions || ''
    };

    const order = await orderService.createOrder(orderData);
    console.log('Order created:', order.orderNumber);
    return order;
  } catch (error) {
    console.error('Failed to create order:', error.message);
    throw error;
  }
}

// Admin Service Example:
import { adminService } from '../services';

async function updateOrderStatus(orderNumber, newStatus) {
  try {
    const updatedOrder = await adminService.updateOrderStatus(orderNumber, newStatus);
    console.log('Order updated:', updatedOrder);
  } catch (error) {
    console.error('Failed to update order:', error.message);
  }
}
*/

// ============================================
// 4. WRAPPING YOUR APP WITH PROVIDERS
// ============================================

/*
// In your main.jsx or App.jsx:
import { CartProvider, AuthProvider } from './context';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <YourAppComponents />
      </CartProvider>
    </AuthProvider>
  );
}
*/

export default {};
