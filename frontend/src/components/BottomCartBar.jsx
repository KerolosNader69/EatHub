import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './BottomCartBar.css';

const BottomCartBar = () => {
  const { items, itemCount } = useCart();
  const navigate = useNavigate();

  // Don't render if cart is empty
  if (!items || items.length === 0) {
    return null;
  }

  const handleViewCart = () => {
    navigate('/cart');
  };

  return (
    <div className="bottom-cart-bar">
      <div className="bottom-cart-bar__content">
        <div className="bottom-cart-bar__items">
          <span className="bottom-cart-bar__count">{itemCount}</span>
          <span className="bottom-cart-bar__text">
            {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>
        
        <button 
          className="bottom-cart-bar__button"
          onClick={handleViewCart}
          aria-label={`View cart with ${itemCount} items`}
        >
          <span>View Cart</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default BottomCartBar;
