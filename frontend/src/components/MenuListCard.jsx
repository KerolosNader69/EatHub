import { useState } from 'react';
import OptimizedImage from './OptimizedImage';
import './MenuListCard.css';

const MenuListCard = ({ item, onAddToCart, onClick }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart(item);
  };

  const handleCardClick = () => {
    onClick(item);
  };

  const truncateText = (text, maxLength = 60) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div 
      className={`menu-list-card ${!item.available ? 'unavailable' : ''}`}
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="menu-list-card__image-wrapper">
        {!imageError && item.image ? (
          <OptimizedImage
            src={item.image}
            alt={item.name}
            className="menu-list-card__image"
            lazy={true}
            onError={handleImageError}
          />
        ) : (
          <div className="menu-list-card__image-placeholder">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
        {!item.available && (
          <div className="menu-list-card__closed-badge">
            Closed
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="menu-list-card__info">
        <h3 className="menu-list-card__title">{item.name}</h3>
        
        <div className="menu-list-card__meta">
          <div className="menu-list-card__rating">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFA500">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>{item.rating || '4.5'}</span>
          </div>
          
          <span className="menu-list-card__dot">•</span>
          
          <span className="menu-list-card__delivery">
            {item.deliveryTime || '20-30 min'}
          </span>
          
          <span className="menu-list-card__dot">•</span>
          
          <span className="menu-list-card__price">
            {item.price.toFixed(2)} EGP
          </span>
        </div>

        {item.description && (
          <p className="menu-list-card__description">
            {truncateText(item.description)}
          </p>
        )}
      </div>
    </div>
  );
};

export default MenuListCard;
