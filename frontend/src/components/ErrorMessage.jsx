import { useState } from 'react';
import './ErrorMessage.css';

/**
 * ErrorMessage Component
 * Displays error messages with optional retry functionality
 */
const ErrorMessage = ({ 
  message, 
  type = 'error', 
  title,
  onRetry,
  onDismiss,
  dismissible = true,
  showIcon = true
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const icons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`error-message-container ${type}`} role="alert">
      {showIcon && (
        <span className="error-message-icon">{icons[type]}</span>
      )}
      <div className="error-message-content">
        {title && <div className="error-message-title">{title}</div>}
        <p className="error-message-text">{message}</p>
        {(onRetry || onDismiss) && (
          <div className="error-message-actions">
            {onRetry && (
              <button onClick={onRetry} className="btn-retry">
                Try Again
              </button>
            )}
            {onDismiss && (
              <button onClick={handleDismiss} className="btn-dismiss">
                Dismiss
              </button>
            )}
          </div>
        )}
      </div>
      {dismissible && !onDismiss && (
        <button 
          onClick={handleDismiss} 
          className="error-message-close"
          aria-label="Close error message"
        >
          ×
        </button>
      )}
    </div>
  );
};

/**
 * InlineError Component
 * Displays inline validation errors for form fields
 */
export const InlineError = ({ message }) => {
  if (!message) return null;

  return (
    <div className="inline-error" role="alert">
      <span className="inline-error-icon">⚠</span>
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
