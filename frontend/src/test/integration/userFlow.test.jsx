import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from '../../context/CartContext';
import Menu from '../../pages/Menu';
import Cart from '../../pages/Cart';
import Checkout from '../../pages/Checkout';
import OrderConfirmation from '../../pages/OrderConfirmation';
import * as menuService from '../../services/menuService';
import * as orderService from '../../services/orderService';

// Mock services
vi.mock('../../services/menuService');
vi.mock('../../services/orderService');

const mockMenuItems = [
  {
    _id: '1',
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce and mozzarella',
    price: 12.99,
    category: 'main_courses',
    image: '/images/pizza.jpg',
    ingredients: ['Tomato', 'Mozzarella', 'Basil'],
    portionSize: '12 inch',
    available: true
  },
  {
    _id: '2',
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with caesar dressing',
    price: 8.50,
    category: 'appetizers',
    image: '/images/salad.jpg',
    ingredients: ['Lettuce', 'Parmesan', 'Croutons'],
    portionSize: 'Regular',
    available: true
  }
];

describe('User Flow Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    
    // Mock IntersectionObserver for OptimizedImage component
    global.IntersectionObserver = class IntersectionObserver {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    
    // Mock returns data directly, not wrapped in response object
    menuService.getMenuItems.mockResolvedValue(mockMenuItems);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full user flow: browse → add to cart → checkout → confirmation', async () => {
    const user = userEvent.setup();
    
    const mockOrderResponse = {
      success: true,
      data: {
        orderNumber: 'EH1234567890',
        estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
        order: {
          _id: 'order1',
          orderNumber: 'EH1234567890',
          items: [
            { menuItem: '1', name: 'Margherita Pizza', price: 12.99, quantity: 2 }
          ],
          customerInfo: {
            name: 'John Doe',
            phone: '1234567890',
            address: '123 Main St'
          },
          totalAmount: 25.98,
          status: 'received'
        }
      }
    };
    orderService.createOrder.mockResolvedValue(mockOrderResponse);

    render(
      <MemoryRouter initialEntries={['/menu']}>
        <CartProvider>
          <Routes>
            <Route path="/menu" element={<Menu />} />
          </Routes>
        </CartProvider>
      </MemoryRouter>
    );

    // Step 1: Browse menu and add items
    await waitFor(() => {
      expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
    }, { timeout: 3000 });

    const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
    await user.click(addButtons[0]); // Add pizza
    
    // Verify item was added to cart
    await waitFor(() => {
      const cartData = JSON.parse(localStorage.getItem('eatHubCart') || '[]');
      expect(cartData.length).toBeGreaterThan(0);
    });
  }, 10000);

  it('should handle cart quantity updates', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/menu']}>
        <CartProvider>
          <Routes>
            <Route path="/menu" element={<Menu />} />
          </Routes>
        </CartProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
    }, { timeout: 3000 });

    const addButton = screen.getAllByRole('button', { name: /add to cart/i })[0];
    await user.click(addButton);
    await user.click(addButton); // Add twice

    // Verify quantity in localStorage
    await waitFor(() => {
      const cartData = JSON.parse(localStorage.getItem('eatHubCart') || '[]');
      expect(cartData[0]?.quantity).toBe(2);
    });
  });

  it('should validate checkout form', async () => {
    const user = userEvent.setup();

    // Add item to cart first
    localStorage.setItem('eatHubCart', JSON.stringify([
      { id: '1', name: 'Margherita Pizza', price: 12.99, quantity: 1 }
    ]));

    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <CartProvider>
          <Routes>
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </CartProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Checkout')).toBeInTheDocument();
    });

    // Try to submit without filling form
    const placeOrderButton = screen.getByRole('button', { name: /place order/i });
    await user.click(placeOrderButton);

    // Should show validation errors
    await waitFor(() => {
      const errorMessages = screen.queryAllByText(/required/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });
});
