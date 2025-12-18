import { useState } from 'react';
import OptimizedImage from './OptimizedImage';
import './CategoryCard.css';

const CategoryCard = ({ category, onClick }) => {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    onClick(category);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Get category display - image or emoji
  const getCategoryDisplay = () => {
    // If category has an image_url, use it
    if (category.image_url && !imageError) {
      return (
        <OptimizedImage
          src={category.image_url}
          alt=""
          className="category-image"
          lazy={true}
          onError={handleImageError}
          placeholder={
            <div className="category-icon-placeholder">
              <span className="category-emoji">{category.icon || '📁'}</span>
            </div>
          }
        />
      );
    }
    
    // Otherwise use emoji
    return <span className="category-emoji">{category.icon || '📁'}</span>;
  };

  // Default icon SVG for fallback
  const defaultIcon = (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="category-default-icon"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div 
      className="category-card" 
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Browse ${category.displayName || category.name} category${category.itemCount !== undefined ? ` (${category.itemCount} ${category.itemCount === 1 ? 'item' : 'items'})` : ''}`}
    >
      <div className="category-icon-container" aria-hidden="true">
        {getCategoryDisplay()}
      </div>
      
      <div className="category-content">
        <h3 className="category-name">{category.displayName || category.name}</h3>
        {category.itemCount !== undefined && (
          <p className="category-item-count" aria-hidden="true">
            {category.itemCount} {category.itemCount === 1 ? 'item' : 'items'}
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;