import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Cart from './Cart';
import { CartProvider } from '../context/CartContext';

// Mock the OptimizedImage component
vi.mock('../components/OptimizedImage', () => ({
  default: ({ src, alt }) => <img src={src} alt={alt} />
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderCart = (initialCart = []) => {
  // Mock localStorage
  const mockLocalStorage = {
    getItem: vi.fn(() => JSON.stringify(initialCart)),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  return render(
    <BrowserRouter>
      <CartProvider>
        <Cart />
      </CartProvider>
    </BrowserRouter>
  );
};

describe('Cart Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
  });

  it('should display empty cart message when cart is empty', () => {
    renderCart([]);
    
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    expect(screen.getByText(/add some delicious items from our menu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /browse menu/i })).toBeInTheDocument();
  });

  it('should navigate to menu when browse menu button is clicked', async () => {
    const user = userEvent.setup();
    renderCart([]);
    
    const browseButton = screen.getByRole('button', { name: /browse menu/i });
    await user.click(browseButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/menu');
  });

  it('should display cart items with correct details', () => {
    const cartItems = [
      { id: '1', name: 'Pizza', price: 12.99, quantity: 2, image: '/pizza.jpg' },
      { id: '2', name: 'Burger', price: 8.50, quantity: 1, image: '/burger.jpg' }
    ];
    
    renderCart(cartItems);
    
    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.getByText(/\$12\.99\s+each/)).toBeInTheDocument();
    expect(screen.getByText(/\$8\.50\s+each/)).toBeInTheDocument();
  });

  it('should calculate subtotal correctly for each item', () => {
    const cartItems = [
      { id: '1', name: 'Pizza', price: 12.99, quantity: 2, image: '/pizza.jpg' }
    ];
    
    renderCart(cartItems);
    
    // 12.99 * 2 = 25.98
    const subtotal = document.querySelector('.cart-item-subtotal');
    expect(subtotal).toHaveTextContent('$25.98');
  });

  it('should calculate total price correctly', () => {
    const cartItems = [
      { id: '1', name: 'Pizza', price: 12.99, quantity: 2, image: '/pizza.jpg' },
      { id: '2', name: 'Burger', price: 8.50, quantity: 1, image: '/burger.jpg' }
    ];
    
    renderCart(cartItems);
    
    // (12.99 * 2) + (8.50 * 1) = 34.48
    expect(screen.getByText('$34.48')).toBeInTheDocument();
  });

  it('should update quantity when + button is clicked', async () => {
    const user = userEvent.setup();
    const cartItems = [
      { id: '1', name: 'Pizza', price: 12.99, quantity: 2, image: '/pizza.jpg' }
    ];
    
    renderCart(cartItems);
    
    const increaseButtons = screen.getAllByLabelText(/increase quantity/i);
    await user.click(increaseButtons[0]);
    
    // Quantity should increase to 3
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Subtotal should update: 12.99 * 3 = 38.97
    const subtotal = document.querySelector('.cart-item-subtotal');
    expect(subtotal).toHaveTextContent('$38.97');
  });

  it('should update quantity when - button is clicked', async () => {
    const user = userEvent.setup();
    const cartItems = [
      { id: '1', name: 'Pizza', price: 12.99, quantity: 2, image: '/pizza.jpg' }
    ];
    
    renderCart(cartItems);
    
    const decreaseButtons = screen.getAllByLabelText(/decrease quantity/i);
    await user.click(decreaseButtons[0]);
    
    // Quantity should decrease to 1
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // Subtotal should update: 12.99 * 1 = 12.99
    const subtotal = document.querySelector('.cart-item-subtotal');
    expect(subtotal).toHaveTextContent('$12.99');
  });

  it('should remove item when remove button is clicked', async () => {
    const user = userEvent.setup();
    const cartItems = [
      { id: '1', name: 'Pizza', price: 12.99, quantity: 2, image: '/pizza.jpg' },
      { id: '2', name: 'Burger', price: 8.50, quantity: 1, image: '/burger.jpg' }
    ];
    
    renderCart(cartItems);
    
    const removeButtons = screen.getAllByLabelText(/remove item/i);
    await user.click(removeButtons[0]);
    
    // Pizza should be removed
    expect(screen.queryByText('Pizza')).not.toBeInTheDocument();
    
    // Burger should still be there
    expect(screen.getByText('Burger')).toBeInTheDocument();
  });

  it('should navigate to checkout when proceed to checkout button is clicked', async () => {
    const user = userEvent.setup();
    const cartItems = [
      { id: '1', name: 'Pizza', price: 12.99, quantity: 2, image: '/pizza.jpg' }
    ];
    
    renderCart(cartItems);
    
    const checkoutButton = screen.getByRole('button', { name: /proceed to checkout/i });
    await user.click(checkoutButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/checkout');
  });

  it('should update total within 500ms when quantity changes', async () => {
    const user = userEvent.setup();
    const cartItems = [
      { id: '1', name: 'Pizza', price: 10.00, quantity: 1, image: '/pizza.jpg' }
    ];
    
    renderCart(cartItems);
    
    const startTime = Date.now();
    const increaseButton = screen.getByLabelText(/increase quantity/i);
    await user.click(increaseButton);
    const endTime = Date.now();
    
    // Should update within 500ms
    expect(endTime - startTime).toBeLessThan(500);
    
    // Total should be updated to 20.00
    const totalAmount = document.querySelector('.total-amount');
    expect(totalAmount).toHaveTextContent('$20.00');
  });

  it('should display placeholder image when item has no image', () => {
    const cartItems = [
      { id: '1', name: 'Pizza', price: 12.99, quantity: 1, image: null }
    ];
    
    renderCart(cartItems);
    
    // Should render placeholder div with SVG
    const placeholder = document.querySelector('.cart-item-placeholder');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder.querySelector('svg')).toBeInTheDocument();
  });
});
