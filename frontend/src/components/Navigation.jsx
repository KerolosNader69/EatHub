import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getRewardsStatus } from '../services/rewardsService';
import './Navigation.css';

const Navigation = () => {
  const { itemCount } = useCart();
  const { isAuthenticated, admin: user, user: authUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const location = useLocation();

  // Fetch user points when authenticated
  useEffect(() => {
    const fetchPoints = async () => {
      if (isAuthenticated && authUser?.id) {
        try {
          const data = await getRewardsStatus();
          setUserPoints(data.currentPoints || 0);
        } catch (error) {
          console.error('Error fetching points:', error);
        }
      } else {
        setUserPoints(0);
      }
    };
    fetchPoints();
  }, [isAuthenticated, authUser]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  // Helper function to determine if a link is active
  const isActiveLink = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    // Special handling for menu routes to include category filtering
    if (path === '/menu') {
      return location.pathname === '/menu' || location.pathname.startsWith('/menu/');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
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
          {/* Home - Always visible */}
          <Link 
            to="/" 
            className={`nav-link home-link ${isActiveLink('/') ? 'active' : ''}`} 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg 
              className="home-icon" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Home
          </Link>

          {/* Menu - Always visible */}
          <Link 
            to="/menu" 
            className={`nav-link menu-link ${isActiveLink('/menu') ? 'active' : ''}`} 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg 
              className="menu-icon" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M3 12h18m-9-9v18"></path>
            </svg>
            Menu
          </Link>

          {/* Track Order - Always visible */}
          <Link 
            to="/order-status" 
            className={`nav-link track-order-link ${isActiveLink('/order-status') ? 'active' : ''}`} 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg 
              className="track-icon" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"></path>
              <path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"></path>
              <path d="M7 21h10"></path>
              <path d="M12 3v18"></path>
              <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path>
            </svg>
            Track
          </Link>

          {/* Feedback - Always visible */}
          <Link 
            to="/feedback" 
            className={`nav-link feedback-link ${isActiveLink('/feedback') ? 'active' : ''}`} 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg 
              className="feedback-icon" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Feedback
          </Link>

          {/* Cart - De-emphasized when bottom bar is active */}
          <Link 
            to="/cart" 
            className={`nav-link cart-link ${isActiveLink('/cart') ? 'active' : ''} ${itemCount > 0 ? 'cart-link--minimal' : ''}`} 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg 
              className="cart-icon" 
              width="20" 
              height="20" 
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
              <span className="cart-badge cart-badge--minimal">{itemCount}</span>
            )}
          </Link>
          
          {/* Authentication Buttons */}
          <div className="auth-buttons">
            {isAuthenticated ? (
              // Authenticated: Show Points, Settings and Sign Out
              <>
                {/* Points Display */}
                <div className="points-display">
                  <span className="points-icon">🪙</span>
                  <span className="points-count">{userPoints}</span>
                </div>
                <Link 
                  to="/user/settings" 
                  className="nav-button settings-button" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg 
                    className="button-icon" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m0-6l4.2-4.2"></path>
                  </svg>
                  Settings
                </Link>
                <button 
                  className="nav-button signout-button" 
                  onClick={handleLogout}
                >
                  <svg 
                    className="button-icon" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Sign Out
                </button>
              </>
            ) : (
              // Not authenticated: Show Sign Up and Login
              <>
                <Link 
                  to="/user/signup" 
                  className="nav-button signup-button" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg 
                    className="button-icon" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                  Sign Up
                </Link>
                <Link 
                  to="/user/login" 
                  className="nav-button login-button" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg 
                    className="button-icon" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                  </svg>
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
