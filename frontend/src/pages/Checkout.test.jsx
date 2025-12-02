import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Checkout from './Checkout';
import { CartProvider } from '../context/CartContext';

// Mock the order service
vi.mock('../services/orderService', () => ({
  createOrder: vi.fn(),
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

const renderCheckout = (initialCart = []) => {
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
        <Checkout />
      </CartProvider>
    </BrowserRouter>
  );
};

describe('Checkout Form Validation', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.clearAllMocks();
  });

  const cartItems = [
    { id: '1', name: 'Pizza', price: 12.99, quantity: 2 }
  ];

  it('should display validation error when name is empty', async () => {
    const user = userEvent.setup();
    renderCheckout(cartItems);
    
    const submitButton = screen.getByRole('button', { name: /place order/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });

  it('should display validation error when phone is empty', async () => {
    const user = userEvent.setup();
    renderCheckout(cartItems);
    
    const submitButton = screen.getByRole('button', { name: /place order/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
  });

  it('should display validation error when phone has less than 10 digits', async () => {
    const user = userEvent.setup();
    renderCheckout(cartItems);
    
    const phoneInput = screen.getByLabelText(/phone number/i);
    await user.type(phoneInput, '123456789'); // 9 digits
    
    const submitButton = screen.getByRole('button', { name: /place order/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/phone number must contain at least 10 digits/i)).toBeInTheDocument();
  });

  it('should accept phone number with at least 10 digits', async () => {
    const user = userEvent.setup();
    const { createOrder } = await import('../services/orderService');
    createOrder.mockResolvedValue({
      orderNumber: 'EH123456',
      estimatedDelivery: new Date().toISOString(),
      order: {}
    });
    
    renderCheckout(cartItems);
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/phone number/i), '1234567890'); // 10 digits
    await user.type(screen.getByLabelText(/delivery address/i), '123 Main St');
    
    const submitButton = screen.getByRole('button', { name: /place order/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(createOrder).toHaveBeenCalled();
    });
  });

  it('should display validation error when address is empty', async () => {
    const user = userEvent.setup();
    renderCheckout(cartItems);
    
    const submitButton = screen.getByRole('button', { name: /place order/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/delivery address is required/i)).toBeInTheDocument();
  });

  it('should clear error when user starts typing in a field', async () => {
    const user = userEvent.setup();
    renderCheckout(cartItems);
    
    // Trigger validation errors
    const submitButton = screen.getByRole('button', { name: /place order/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    
    // Start typing in name field
    const nameInput = screen.getByLabelText(/full name/i);
    await user.type(nameInput, 'J');
    
    // Error should be cleared
    expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
  });

  it('should validate all required fields before submission', async () => {
    const user = userEvent.setup();
    renderCheckout(cartItems);
    
    const submitButton = screen.getByRole('button', { name: /place order/i });
    await user.click(submitButton);
    
    // All three required field errors should be displayed
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
    expect(screen.getByText(/delivery address is required/i)).toBeInTheDocument();
  });

  it('should trim whitespace from form fields', async () => {
    const user = userEvent.setup();
    const { createOrder } = await import('../services/orderService');
    createOrder.mockResolvedValue({
      orderNumber: 'EH123456',
      estimatedDelivery: new Date().toISOString(),
      order: {}
    });
    
    renderCheckout(cartItems);
    
    await user.type(screen.getByLabelText(/full name/i), '  John Doe  ');
    await user.type(screen.getByLabelText(/phone number/i), '  1234567890  ');
    await user.type(screen.getByLabelText(/delivery address/i), '  123 Main St  ');
    
    const submitButton = screen.getByRole('button', { name: /place order/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          customerInfo: {
            name: 'John Doe',
            phone: '1234567890',
            address: '123 Main St'
          }
        })
      );
    });
  });

  it('should allow special instructions to be optional', async () => {
    const user = userEvent.setup();
    const { createOrder } = await import('../services/orderService');
    createOrder.mockResolvedValue({
      orderNumber: 'EH123456',
      estimatedDelivery: new Date().toISOString(),
      order: {}
    });
    
    renderCheckout(cartItems);
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/phone number/i), '1234567890');
    await user.type(screen.getByLabelText(/delivery address/i), '123 Main St');
    // Don't fill special instructions
    
    const submitButton = screen.getByRole('button', { name: /place order/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(createOrder).toHaveBeenCalled();
    });
  });

  it('should accept phone numbers with formatting characters', async () => {
    const user = userEvent.setup();
    const { createOrder } = await import('../services/orderService');
    createOrder.mockResolvedValue({
      orderNumber: 'EH123456',
      estimatedDelivery: new Date().toISOString(),
      order: {}
    });
    
    renderCheckout(cartItems);
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/phone number/i), '(123) 456-7890'); // Formatted phone
    await user.type(screen.getByLabelText(/delivery address/i), '123 Main St');
    
    const submitButton = screen.getByRole('button', { name: /place order/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(createOrder).toHaveBeenCalled();
    });
  });
});
