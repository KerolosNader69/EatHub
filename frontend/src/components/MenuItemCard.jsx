import { useState } from 'react';
import OptimizedImage from './OptimizedImage';
import './MenuItemCard.css';

const MenuItemCard = ({ item, onAddToCart, onClick }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent triggering the card click
    onAddToCart(item);
  };

  const handleCardClick = () => {
    onClick(item);
  };

  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="menu-item-card" onClick={handleCardClick}>
      <div className="menu-item-image-container">
        {!imageError && item.image ? (
          <OptimizedImage
            src={item.image}
            alt={item.name}
            className="menu-item-image"
            lazy={true}
            onError={handleImageError}
          />
        ) : (
          <div className="menu-item-image-placeholder">
            <svg
              width="64"
              height="64"
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
        {!item.available && (
          <div className="unavailable-overlay">
            <span>Unavailable</span>
          </div>
        )}
      </div>

      <div className="menu-item-content">
        <h3 className="menu-item-name">{item.name}</h3>
        <p className="menu-item-price">${item.price.toFixed(2)}</p>
        <p className="menu-item-description">
          {truncateDescription(item.description)}
        </p>
        
        <button
          className="add-to-cart-button"
          onClick={handleAddToCart}
          disabled={!item.available}
        >
          {item.available ? 'Add to Cart' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
};

export default MenuItemCard;
