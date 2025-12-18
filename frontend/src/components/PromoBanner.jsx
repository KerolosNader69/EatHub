import { useNavigate } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';
import './PromoBanner.css';

const PromoBanner = ({ announcement }) => {
  const navigate = useNavigate();

  if (!announcement) return null;

  const handleClick = () => {
    navigate(`/menu/item/${announcement.id}`);
  };

  return (
    <div className="promo-banner" onClick={handleClick} role="button" tabIndex={0}>
      <div className="promo-banner-image">
        <OptimizedImage 
          src={announcement.announcement_image || announcement.image} 
          alt={announcement.announcement_title || announcement.name}
        />
        <div className="promo-banner-overlay" />
      </div>
      <div className="promo-banner-content">
        <div className="promo-badge">🔥 Special Offer</div>
        <h2 className="promo-title">{announcement.announcement_title || announcement.name}</h2>
        <p className="promo-subtitle">{announcement.announcement_subtitle || announcement.description}</p>
        <div className="promo-footer">
          <span className="promo-price">
            {(announcement.announcement_price || announcement.price).toFixed(2)} EGP
          </span>
          <button className="promo-cta" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
