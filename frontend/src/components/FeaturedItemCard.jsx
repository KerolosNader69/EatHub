import { useState } from 'react';
import OptimizedImage from './OptimizedImage';
import './FeaturedItemCard.css';

const FeaturedItemCard = ({ item, onItemClick, onAddToCart }) => {
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleItemClick = () => {
    onItemClick(item);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Prevent triggering item click
    
    if (!item.available || isAdding) return;
    
    setIsAdding(true);
    
    try {
      await onAddToCart(item);
      
      // Show success animation briefly
      setTimeout(() => {
        setIsAdding(false);
      }, 1000);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      setIsAdding(false);
    }
  };

  // Default placeholder SVG for items without images
  const defaultPlaceholder = (
    <svg
      width="60"
      height="60"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="featured-item-placeholder-icon"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemClick();
    }
  };

  return (
    <div 
      className="featured-item-card" 
      onClick={handleItemClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${item.name}, ${item.price.toFixed(2)} EGP${!item.available ? ' (currently unavailable)' : ''}`}
    >
      <div className="featured-item-image-container">
        {!imageError && item.image ? (
          <OptimizedImage
            src={item.image}
            alt=""
            className="featured-item-image"
            lazy={true}
            onError={handleImageError}
            width="280"
            height="200"
          />
        ) : (
          <div className="featured-item-image-placeholder" aria-hidden="true">
            {defaultPlaceholder}
          </div>
        )}
        
        {!item.available && (
          <div className="featured-item-unavailable-overlay" aria-hidden="true">
            <span>Unavailable</span>
          </div>
        )}
      </div>

      <div className="featured-item-content">
        <h3 className="featured-item-name">{item.name}</h3>
        <p className="featured-item-price" aria-label={`Price: ${item.price.toFixed(2)} EGP`}>
          {item.price.toFixed(2)} EGP
        </p>
        
        <button
          className={`featured-item-add-button ${isAdding ? 'adding' : ''} ${!item.available ? 'disabled' : ''}`}
          onClick={handleAddToCart}
          disabled={!item.available || isAdding}
          aria-label={`Add ${item.name} to cart for ${item.price.toFixed(2)} EGP`}
          aria-describedby={!item.available ? `unavailable-${item.id}` : undefined}
        >
          {isAdding ? (
            <>
              <svg
                className="featured-item-success-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span aria-live="polite">Added!</span>
            </>
          ) : (
            <>
              <svg
                className="featured-item-cart-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="m1 1 4 4 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Add to Cart
            </>
          )}
        </button>
        
        {!item.available && (
          <div id={`unavailable-${item.id}`} className="sr-only">
            This item is currently unavailable and cannot be added to cart
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedItemCard;