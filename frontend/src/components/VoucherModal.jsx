import { useState, useEffect } from 'react';
import { getAvailableVouchers, validateVoucher } from '../services/voucherService';
import './VoucherModal.css';

const VoucherModal = ({ isOpen, onClose, onVoucherApplied }) => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validatingCode, setValidatingCode] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchVouchers();
    }
  }, [isOpen]);

  const fetchVouchers = async () => {
    setLoading(true);
    setError('');
    try {
      const vouchersData = await getAvailableVouchers();
      setVouchers(vouchersData);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      setError(err.message || 'Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 2000);
    }
  };

  const handleApplyVoucher = async (voucher) => {
    setValidatingCode(voucher.code);
    setError('');
    
    try {
      // For validation, we'll use a default order total of 0 to check if voucher is valid
      // The actual validation with order total will happen in the cart/checkout
      const result = await validateVoucher(voucher.code, 1);
      
      if (result.valid) {
        onVoucherApplied(voucher);
        onClose();
      } else {
        setError(result.message || 'Voucher is not valid');
      }
    } catch (err) {
      console.error('Error validating voucher:', err);
      setError(err.message || 'Failed to validate voucher');
    } finally {
      setValidatingCode('');
    }
  };

  const formatDiscount = (voucher) => {
    if (voucher.discountType === 'percentage') {
      return `${voucher.discountValue}% OFF`;
    } else {
      return `$${voucher.discountValue} OFF`;
    }
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  if (!isOpen) return null;

  return (
    <div className="voucher-modal-overlay" onClick={onClose}>
      <div className="voucher-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="voucher-modal-close" onClick={onClose}>×</button>
        
        <div className="voucher-modal-header">
          <div className="voucher-icon">🎫</div>
          <h2>Available Vouchers</h2>
          <p>Choose a voucher to apply to your order</p>
        </div>

        <div className="voucher-modal-body">
          {loading && (
            <div className="voucher-loading">
              <div className="loading-spinner"></div>
              <p>Loading vouchers...</p>
            </div>
          )}

          {error && (
            <div className="voucher-error">
              <p>{error}</p>
              <button onClick={fetchVouchers} className="retry-button">
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && vouchers.length === 0 && (
            <div className="no-vouchers">
              <div className="no-vouchers-icon">📭</div>
              <h3>No Vouchers Available</h3>
              <p>Check back later for new discount offers!</p>
            </div>
          )}

          {!loading && !error && vouchers.length > 0 && (
            <div className="vouchers-list">
              {vouchers.map((voucher) => (
                <div 
                  key={voucher.id} 
                  className={`voucher-card ${isExpired(voucher.expiryDate) ? 'expired' : ''}`}
                >
                  <div className="voucher-card-header">
                    <div className="voucher-discount">
                      {formatDiscount(voucher)}
                    </div>
                    {isExpiringSoon(voucher.expiryDate) && !isExpired(voucher.expiryDate) && (
                      <div className="expiring-badge">Expires Soon!</div>
                    )}
                    {isExpired(voucher.expiryDate) && (
                      <div className="expired-badge">Expired</div>
                    )}
                  </div>

                  <div className="voucher-card-body">
                    <h3 className="voucher-title">{voucher.title}</h3>
                    <p className="voucher-description">{voucher.description}</p>
                    
                    <div className="voucher-details">
                      {voucher.minimumOrder > 0 && (
                        <div className="voucher-detail">
                          <span className="detail-label">Minimum Order:</span>
                          <span className="detail-value">${voucher.minimumOrder}</span>
                        </div>
                      )}
                      {voucher.expiryDate && (
                        <div className="voucher-detail">
                          <span className="detail-label">Expires:</span>
                          <span className="detail-value">
                            {new Date(voucher.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {voucher.usageLimit && (
                        <div className="voucher-detail">
                          <span className="detail-label">Uses Left:</span>
                          <span className="detail-value">
                            {voucher.usageLimit - (voucher.usedCount || 0)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="voucher-code-section">
                      <div className="voucher-code">
                        <span className="code-label">Code:</span>
                        <span className="code-value">{voucher.code}</span>
                        <button
                          className={`copy-button ${copiedCode === voucher.code ? 'copied' : ''}`}
                          onClick={() => handleCopyCode(voucher.code)}
                          title="Copy code"
                        >
                          {copiedCode === voucher.code ? '✓' : '📋'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="voucher-card-footer">
                    {!isExpired(voucher.expiryDate) ? (
                      <button
                        className="apply-voucher-button"
                        onClick={() => handleApplyVoucher(voucher)}
                        disabled={validatingCode === voucher.code}
                      >
                        {validatingCode === voucher.code ? (
                          <>
                            <div className="button-spinner"></div>
                            Applying...
                          </>
                        ) : (
                          'Apply Voucher'
                        )}
                      </button>
                    ) : (
                      <button className="apply-voucher-button expired" disabled>
                        Expired
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoucherModal;