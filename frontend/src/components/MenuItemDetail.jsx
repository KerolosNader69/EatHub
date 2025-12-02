import { useState, useEffect } from 'react';
import Modal from './Modal';
import OptimizedImage from './OptimizedImage';
import './MenuItemDetail.css';

const MenuItemDetail = ({ item, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  // Reset quantity when item changes
  useEffect(() => {
    setQuantity(1);
    setImageError(false);
  }, [item]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    onAddToCart(item, quantity);
    onClose();
  };

  const totalPrice = (item.price * quantity).toFixed(2);

  return (
    <Modal onClose={onClose}>
      <div className="menu-item-detail">
        <button className="close-button" onClick={onClose} aria-label="Close">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="menu-item-detail-content">
          <div className="menu-item-detail-image-container">
            {!imageError && item.image ? (
              <OptimizedImage
                src={item.image}
                alt={item.name}
                className="menu-item-detail-image"
                lazy={false}
                onError={handleImageError}
              />
            ) : (
              <div className="menu-item-detail-image-placeholder">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}
          </div>

          <div className="menu-item-detail-info">
            <h2 className="menu-item-detail-name">{item.name}</h2>
            <p className="menu-item-detail-price">${item.price.toFixed(2)}</p>

            <div className="menu-item-detail-section">
              <h3>Description</h3>
              <p>{item.description}</p>
            </div>

            {item.ingredients && item.ingredients.length > 0 && (
              <div className="menu-item-detail-section">
                <h3>Ingredients</h3>
                <ul className="ingredients-list">
                  {item.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>
            )}

            {item.portionSize && (
              <div className="menu-item-detail-section">
                <h3>Portion Size</h3>
                <p>{item.portionSize}</p>
              </div>
            )}

            <div className="menu-item-detail-actions">
              <div className="quantity-selector">
                <button
                  className="quantity-button"
                  onClick={handleDecrement}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="quantity-value">{quantity}</span>
                <button
                  className="quantity-button"
                  onClick={handleIncrement}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                className="add-to-cart-button-detail"
                onClick={handleAddToCart}
                disabled={!item.available}
              >
                {item.available
                  ? `Add to Cart - $${totalPrice}`
                  : 'Unavailable'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MenuItemDetail;
