import { useNavigate } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';
import './PromoBanner.css';

const PromoBanner = ({ announcement }) => {
  const navigate = useNavigate();

  if (!announcement) return null;

  const handleClick = () => {
    // Navigate to the menu page with the item's category, passing the item to open
    const category = announcement.category || 'menu';
    navigate(`/menu/${category}`, { state: { openItem: announcement } });
  };

  // Use actual discount_price from database, or show regular price
  const originalPrice = announcement.price;
  const discountedPrice = announcement.discount_price;
  const hasDiscount = discountedPrice && discountedPrice < originalPrice;

  return (
    <div 
      className="promo-banner" 
      onClick={handleClick} 
      role="button" 
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="promo-banner-image">
        <OptimizedImage 
          src={announcement.image} 
          alt={announcement.name}
        />
        <div className="promo-banner-overlay" />
      </div>
      <div className="promo-banner-content">
        <div className="promo-badge">
          {hasDiscount ? '🔥 SPECIAL OFFER' : '⭐ FEATURED'}
        </div>
        <h2 className="promo-title">{announcement.name}</h2>
        <p className="promo-subtitle">{announcement.description}</p>
        <div className="promo-footer">
          <div className="promo-prices">
            {hasDiscount ? (
              <>
                <span className="promo-price-original">{originalPrice.toFixed(2)} EGP</span>
                <span className="promo-price">{discountedPrice.toFixed(2)} EGP</span>
              </>
            ) : (
              <span className="promo-price">{originalPrice.toFixed(2)} EGP</span>
            )}
          </div>
          <button className="promo-cta" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
