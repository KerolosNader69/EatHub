# Context API Documentation

This directory contains React Context providers for global state management in the Eat Hub application.

## Available Contexts

### CartContext

Manages shopping cart state including items, quantities, and totals.

**Features:**
- Add items to cart
- Update item quantities
- Remove items from cart
- Clear entire cart
- Persistent storage (localStorage)
- Automatic total calculation

**Usage:**
```jsx
import { useCart } from '../context';

function MyComponent() {
  const { items, itemCount, totalPrice, addItem, updateQuantity, removeItem, clearCart } = useCart();
  
  // Add item to cart
  addItem({ id: '123', name: 'Pizza', price: 12.99, quantity: 1 });
  
  // Update quantity
  updateQuantity('123', 2);
  
  // Remove item
  removeItem('123');
  
  // Clear cart
  clearCart();
}
```

### AuthContext

Manages admin authentication state and JWT token handling.

**Features:**
- Login/logout functionality
- Token persistence (localStorage)
- Token verification
- Loading and error states

**Usage:**
```jsx
import { useAuth } from '../context';

function AdminPanel() {
  const { isAuthenticated, admin, token, login, logout, verifyToken } = useAuth();
  
  // Login
  login('jwt-token', { id: '1', username: 'admin' });
  
  // Logout
  logout();
  
  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
}
```

## Setup

Wrap your app with the providers in `main.jsx` or `App.jsx`:

```jsx
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
```
