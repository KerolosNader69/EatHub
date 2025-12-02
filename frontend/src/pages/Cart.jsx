import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import OptimizedImage from '../components/OptimizedImage';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { items, totalPrice, updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (itemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <h1 className="cart-title">Your Cart</h1>
          <div className="empty-cart">
            <svg 
              className="empty-cart-icon" 
              width="80" 
              height="80" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <p className="empty-cart-message">Your cart is empty</p>
            <p className="empty-cart-submessage">Add some delicious items from our menu!</p>
            <button 
              className="browse-menu-button"
              onClick={() => navigate('/menu')}
            >
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-title">Your Cart</h1>
        
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                {item.image ? (
                  <OptimizedImage 
                    src={item.image} 
                    alt={item.name}
                    lazy={false}
                  />
                ) : (
                  <div className="cart-item-placeholder">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="cart-item-details">
                <h3 className="cart-item-name">{item.name}</h3>
                <p className="cart-item-price">{formatPrice(item.price)} each</p>
              </div>

              <div className="cart-item-controls">
                <div className="quantity-controls">
                  <button
                    className="quantity-button"
                    onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button
                    className="quantity-button"
                    onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                
                <p className="cart-item-subtotal">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>

              <button
                className="remove-button"
                onClick={() => handleRemoveItem(item.id)}
                aria-label="Remove item"
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="cart-total">
            <span className="total-label">Subtotal:</span>
            <span className="total-amount">{formatPrice(totalPrice)}</span>
          </div>
          
          <button 
            className="checkout-button"
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
