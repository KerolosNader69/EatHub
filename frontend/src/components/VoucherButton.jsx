import { useState } from 'react';
import './VoucherButton.css';

const VoucherButton = ({ 
  onClick, 
  voucherCount = 0, 
  disabled = false,
  loading = false,
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

  const hasVouchers = voucherCount > 0;
  const isDisabled = disabled || !hasVouchers;

  return (
    <button
      className={`voucher-button ${isPressed ? 'voucher-button--pressed' : ''} ${isDisabled ? 'voucher-button--disabled' : ''} ${showSuccessAnimation ? 'voucher-button--success' : ''} ${className}`}
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={`Vouchers ${hasVouchers ? `(${voucherCount} available)` : '(none available)'}`}
    >
      <div className="voucher-button__content">
        <div className="voucher-button__icon">
          {showSuccessAnimation ? (
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="voucher-button__success-icon"
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
                d="M9 12L11 14L15 10M21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12ZM3 12C3 13.1046 3.89543 14 5 14C6.10457 14 7 13.1046 7 12C7 10.8954 6.10457 10 5 10C3.89543 10 3 10.8954 3 12ZM7 12H17H7Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        
        <span className="voucher-button__text">
          {showSuccessAnimation ? 'Applied!' : loading ? 'Loading...' : 'Vouchers'}
        </span>
        
        {hasVouchers && !loading && !showSuccessAnimation && (
          <div className="voucher-button__badge" aria-hidden="true">
            {voucherCount}
          </div>
        )}
      </div>
    </button>
  );
};

export default VoucherButton;