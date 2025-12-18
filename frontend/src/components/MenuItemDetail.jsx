import { useState, useEffect } from 'react';
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

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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

  // Parse ingredients if it's a string
  const ingredientsList = typeof item.ingredients === 'string' 
    ? item.ingredients.split(',').map(i => i.trim())
    : Array.isArray(item.ingredients) 
    ? item.ingredients 
    : [];

  return (
    <div className="product-detail-overlay" onClick={onClose}>
      <div className="product-detail" onClick={(e) => e.stopPropagation()}>
        {/* Header with Back Button */}
        <div className="product-detail__header">
          <button className="product-detail__back" onClick={onClose} aria-label="Go back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="product-detail__content">
          {/* Product Image */}
          <div className="product-detail__image-wrapper">
            {!imageError && item.image ? (
              <OptimizedImage
                src={item.image}
                alt={item.name}
                className="product-detail__image"
                lazy={false}
                onError={handleImageError}
              />
            ) : (
              <div className="product-detail__image-placeholder">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-detail__info">
            <h1 className="product-detail__name">{item.name}</h1>
            <p className="product-detail__price">{item.price.toFixed(2)} EGP</p>

            {item.description && (
              <p className="product-detail__description">{item.description}</p>
            )}

            {/* Weight/Grams */}
            {(item.grams || item.weight || item.portionSize) && (
              <div className="product-detail__meta">
                <span className="product-detail__meta-label">Weight:</span>
                <span className="product-detail__meta-value">
                  {item.grams ? `${item.grams}g` : item.weight || item.portionSize}
                </span>
              </div>
            )}

            {/* Ingredients */}
            {ingredientsList.length > 0 && (
              <div className="product-detail__section">
                <h3 className="product-detail__section-title">Ingredients</h3>
                <p className="product-detail__ingredients">
                  {ingredientsList.join(', ')}
                </p>
              </div>
            )}

            {/* Spacer for sticky footer */}
            <div className="product-detail__spacer"></div>
          </div>
        </div>

        {/* Sticky Footer with Add to Cart */}
        <div className="product-detail__footer">
          <div className="product-detail__quantity">
            <button
              className="product-detail__qty-btn"
              onClick={handleDecrement}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="product-detail__qty-value">{quantity}</span>
            <button
              className="product-detail__qty-btn"
              onClick={handleIncrement}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            className="product-detail__add-btn"
            onClick={handleAddToCart}
            disabled={!item.available}
          >
            {item.available ? `Add to Cart • ${totalPrice} EGP` : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemDetail;
