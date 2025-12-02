import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Action types
const ADD_ITEM = 'ADD_ITEM';
const UPDATE_QUANTITY = 'UPDATE_QUANTITY';
const REMOVE_ITEM = 'REMOVE_ITEM';
const CLEAR_CART = 'CLEAR_CART';
const LOAD_CART = 'LOAD_CART';

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case ADD_ITEM: {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id
      );

      if (existingItemIndex > -1) {
        // Item already exists, update quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + (action.payload.quantity || 1)
        };
        return { ...state, items: updatedItems };
      } else {
        // Add new item
        return {
          ...state,
          items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }]
        };
      }
    }

    case UPDATE_QUANTITY: {
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0); // Remove items with quantity 0

      return { ...state, items: updatedItems };
    }

    case REMOVE_ITEM: {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id)
      };
    }

    case CLEAR_CART: {
      return { ...state, items: [] };
    }

    case LOAD_CART: {
      return { ...state, items: action.payload };
    }

    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: []
};

// Cart Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('eatHubCart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: LOAD_CART, payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('eatHubCart', JSON.stringify(state.items));
  }, [state.items]);

  // Cart actions
  const addItem = (item) => {
    dispatch({ type: ADD_ITEM, payload: item });
  };

  const updateQuantity = (id, quantity) => {
    dispatch({ type: UPDATE_QUANTITY, payload: { id, quantity } });
  };

  const removeItem = (id) => {
    dispatch({ type: REMOVE_ITEM, payload: { id } });
  };

  const clearCart = () => {
    dispatch({ type: CLEAR_CART });
  };

  // Calculate total items count
  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);

  // Calculate total price
  const totalPrice = state.items.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  );

  const value = {
    items: state.items,
    itemCount,
    totalPrice,
    addItem,
    updateQuantity,
    removeItem,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
