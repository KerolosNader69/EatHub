import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getOrderStatus } from '../services/orderService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import './OrderStatus.css';

const OrderStatus = () => {
  const location = useLocation();
  const initialOrderNumber = location.state?.orderNumber || '';
  
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [searchInput, setSearchInput] = useState(initialOrderNumber);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch order on mount if orderNumber is provided
  useEffect(() => {
    if (initialOrderNumber) {
      fetchOrder(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const fetchOrder = async (orderNum) => {
    if (!orderNum.trim()) {
      setError('Please enter an order number');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const orderData = await getOrderStatus(orderNum.trim());
      setOrder(orderData);
      setOrderNumber(orderNum.trim());
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.message || 'Order not found. Please check your order number.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrder(searchInput);
  };

  const handleRefresh = () => {
    if (orderNumber) {
      fetchOrder(orderNumber);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusSteps = () => {
    return [
      { key: 'received', label: 'Received' },
      { key: 'preparing', label: 'Preparing' },
      { key: 'out_for_delivery', label: 'Out for Delivery' },
      { key: 'delivered', label: 'Delivered' }
    ];
  };

  const getStatusIndex = (status) => {
    const steps = getStatusSteps();
    return steps.findIndex(step => step.key === status);
  };

  const currentStatusIndex = order ? getStatusIndex(order.status) : -1;

  return (
    <div className="order-status-page">
      <div className="order-status-container">
        <h1>Track Your Order</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter your order number (e.g., EH1234567890)"
              className="search-input"
              disabled={loading}
            />
            <button
              type="submit"
              className="search-button"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </div>
          {error && (
            <ErrorMessage 
              message={error}
              type="error"
              onDismiss={() => setError('')}
            />
          )}
        </form>

        {/* Loading State */}
        {loading && !order && (
          <div className="loading-container">
            <Loading text="Loading order details..." />
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="order-details">
            {/* Order Header */}
            <div className="order-header">
              <div className="order-info">
                <h2>Order #{order.orderNumber}</h2>
                <p className="order-date">
                  Placed on {formatDateTime(order.createdAt)}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                className="refresh-button"
                disabled={loading}
                title="Refresh status"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className={loading ? 'spinning' : ''}
                >
                  <path
                    d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
                    fill="currentColor"
                  />
                </svg>
                Refresh
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="progress-section">
              <div className="progress-steps">
                {getStatusSteps().map((step, index) => (
                  <div
                    key={step.key}
                    className={`progress-step ${
                      index <= currentStatusIndex ? 'completed' : ''
                    } ${index === currentStatusIndex ? 'current' : ''}`}
                  >
                    <div className="step-indicator">
                      {index < currentStatusIndex ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" fill="#c41e3a" />
                          <path
                            d="M8 12L11 15L16 9"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <div className="step-circle">
                          {index === currentStatusIndex && (
                            <div className="pulse-ring"></div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="step-label">{step.label}</div>
                    {index < getStatusSteps().length - 1 && (
                      <div
                        className={`step-line ${
                          index < currentStatusIndex ? 'completed' : ''
                        }`}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Delivery */}
            {order.estimatedDelivery && order.status !== 'delivered' && (
              <div className="delivery-estimate">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#c41e3a" strokeWidth="2" />
                  <path
                    d="M12 6V12L16 14"
                    stroke="#c41e3a"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span>
                  Estimated delivery: {formatDateTime(order.estimatedDelivery)}
                </span>
              </div>
            )}

            {/* Order Items */}
            <div className="order-items-section">
              <h3>Order Items</h3>
              <div className="order-items-list">
                {(order.items || []).map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-details">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">Qty: {item.quantity}</span>
                    </div>
                    <span className="item-price">
                      {(item.price * item.quantity).toFixed(2)} EGP
                    </span>
                  </div>
                ))}
              </div>
              <div className="order-total">
                <span>Total</span>
                <span className="total-amount">{(order.totalAmount || 0).toFixed(2)} EGP</span>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="delivery-info-section">
              <h3>Delivery Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 2C7.24 2 5 4.24 5 7c0 4.5 5 11 5 11s5-6.5 5-11c0-2.76-2.24-5-5-5zm0 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
                      fill="#666"
                    />
                  </svg>
                  <div>
                    <div className="info-label">Address</div>
                    <div className="info-value">{order.customerInfo.address}</div>
                  </div>
                </div>
                <div className="info-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M16 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
                      fill="#666"
                    />
                    <circle cx="10" cy="10" r="3" fill="#666" />
                  </svg>
                  <div>
                    <div className="info-label">Name</div>
                    <div className="info-value">{order.customerInfo.name}</div>
                  </div>
                </div>
                <div className="info-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M16 2H4c-1.1 0-1.99.9-1.99 2L2 16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 12H6v-2h4v2zm4-4H6V8h8v2z"
                      fill="#666"
                    />
                  </svg>
                  <div>
                    <div className="info-label">Phone</div>
                    <div className="info-value">{order.customerInfo.phone}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatus;
