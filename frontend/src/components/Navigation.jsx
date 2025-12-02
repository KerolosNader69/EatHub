import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navigation.css';

const Navigation = () => {
  const { itemCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/menu" className="nav-logo">
          <span className="logo-eat">Eat</span>
          <span className="logo-hub">hub</span>
        </Link>

        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/menu" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
            Menu
          </Link>
          <Link to="/cart" className="nav-link cart-link" onClick={() => setIsMobileMenuOpen(false)}>
            <svg 
              className="cart-icon" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {itemCount > 0 && (
              <span className="cart-badge">{itemCount}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
