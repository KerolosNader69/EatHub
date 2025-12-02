import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

describe('CartContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

  it('should initialize with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    const item = { id: '1', name: 'Pizza', price: 12.99 };
    
    act(() => {
      result.current.addItem(item);
    });
    
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual({ ...item, quantity: 1 });
    expect(result.current.itemCount).toBe(1);
  });

  it('should increase quantity when adding existing item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    const item = { id: '1', name: 'Pizza', price: 12.99 };
    
    act(() => {
      result.current.addItem(item);
      result.current.addItem(item);
    });
    
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.itemCount).toBe(2);
  });

  it('should add item with specified quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    const item = { id: '1', name: 'Pizza', price: 12.99, quantity: 3 };
    
    act(() => {
      result.current.addItem(item);
    });
    
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.itemCount).toBe(3);
  });

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    const item = { id: '1', name: 'Pizza', price: 12.99 };
    
    act(() => {
      result.current.addItem(item);
    });
    
    act(() => {
      result.current.updateQuantity('1', 5);
    });
    
    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.itemCount).toBe(5);
  });

  it('should remove item when quantity is updated to 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    const item = { id: '1', name: 'Pizza', price: 12.99 };
    
    act(() => {
      result.current.addItem(item);
    });
    
    act(() => {
      result.current.updateQuantity('1', 0);
    });
    
    expect(result.current.items).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    const item1 = { id: '1', name: 'Pizza', price: 12.99 };
    const item2 = { id: '2', name: 'Burger', price: 8.50 };
    
    act(() => {
      result.current.addItem(item1);
      result.current.addItem(item2);
    });
    
    act(() => {
      result.current.removeItem('1');
    });
    
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('2');
  });

  it('should clear entire cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    const item1 = { id: '1', name: 'Pizza', price: 12.99 };
    const item2 = { id: '2', name: 'Burger', price: 8.50 };
    
    act(() => {
      result.current.addItem(item1);
      result.current.addItem(item2);
    });
    
    act(() => {
      result.current.clearCart();
    });
    
    expect(result.current.items).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('should calculate total item count correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    const item1 = { id: '1', name: 'Pizza', price: 12.99, quantity: 2 };
    const item2 = { id: '2', name: 'Burger', price: 8.50, quantity: 3 };
    
    act(() => {
      result.current.addItem(item1);
      result.current.addItem(item2);
    });
    
    // 2 + 3 = 5
    expect(result.current.itemCount).toBe(5);
  });

  it('should calculate total price correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    const item1 = { id: '1', name: 'Pizza', price: 12.99, quantity: 2 };
    const item2 = { id: '2', name: 'Burger', price: 8.50, quantity: 1 };
    
    act(() => {
      result.current.addItem(item1);
      result.current.addItem(item2);
    });
    
    // (12.99 * 2) + (8.50 * 1) = 34.48
    expect(result.current.totalPrice).toBeCloseTo(34.48, 2);
  });

  it('should calculate total price with decimal precision', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    const item = { id: '1', name: 'Pizza', price: 10.99, quantity: 3 };
    
    act(() => {
      result.current.addItem(item);
    });
    
    // 10.99 * 3 = 32.97
    expect(result.current.totalPrice).toBe(32.97);
  });

  it('should persist cart to localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    const item = { id: '1', name: 'Pizza', price: 12.99 };
    
    act(() => {
      result.current.addItem(item);
    });
    
    const savedCart = JSON.parse(localStorage.getItem('eatHubCart'));
    expect(savedCart).toHaveLength(1);
    expect(savedCart[0]).toEqual({ ...item, quantity: 1 });
  });

  it('should load cart from localStorage on mount', () => {
    const savedCart = [
      { id: '1', name: 'Pizza', price: 12.99, quantity: 2 }
    ];
    
    localStorage.setItem('eatHubCart', JSON.stringify(savedCart));
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    expect(result.current.items).toEqual(savedCart);
    expect(result.current.itemCount).toBe(2);
    expect(result.current.totalPrice).toBe(25.98);
  });

  it('should handle corrupted localStorage data gracefully', () => {
    localStorage.setItem('eatHubCart', 'invalid json');
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    // Should initialize with empty cart
    expect(result.current.items).toEqual([]);
  });

  it('should throw error when useCart is used outside CartProvider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();
    
    expect(() => {
      renderHook(() => useCart());
    }).toThrow('useCart must be used within a CartProvider');
    
    console.error = originalError;
  });
});
