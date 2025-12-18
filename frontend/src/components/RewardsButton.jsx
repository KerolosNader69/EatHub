import { useState } from 'react';
import './RewardsButton.css';

const RewardsButton = ({ 
  onClick, 
  rewardPoints = null, 
  disabled = false,
  loading = false,
  isLoggedIn = false,
  className = '',
  showSuccess = false
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const handleClick = (e) => {
    if (disabled || loading) return;
    
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    
    if (onClick) {
      onClick(e);
    }
  };

  // Handle success animation
  useState(() => {
    if (showSuccess) {
      setShowSuccessAnimation(true);
      const timer = setTimeout(() => setShowSuccessAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const displayPoints = isLoggedIn && rewardPoints !== null;

  return (
    <button
      className={`rewards-button ${isPressed ? 'rewards-button--pressed' : ''} ${disabled ? 'rewards-button--disabled' : ''} ${showSuccessAnimation ? 'rewards-button--success' : ''} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label={`Rewards ${displayPoints ? `(${rewardPoints} points)` : ''}`}
    >
      <div className="rewards-button__content">
        <div className="rewards-button__icon">
          {showSuccessAnimation ? (
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="rewards-button__success-icon"
            >
              <path 
                d="M9 12L11 14L15 10" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path 
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        
        <div className="rewards-button__text-container">
          <span className="rewards-button__text">
            {showSuccessAnimation ? 'Redeemed!' : loading ? 'Loading...' : 'Rewards'}
          </span>
          
          {displayPoints && !loading && !showSuccessAnimation && (
            <span className="rewards-button__points">
              {rewardPoints} pts
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default RewardsButton;