import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const { orderNumber, estimatedDelivery, order } = location.state || {};

  // Clear cart when component mounts
  useEffect(() => {
    if (orderNumber) {
      clearCart();
    }
  }, [orderNumber, clearCart]);

  // Redirect to menu if no order data
  if (!orderNumber || !order) {
    navigate('/menu');
    return null;
  }

  const formatDeliveryTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      received: 'Order Received',
      preparing: 'Preparing',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered'
    };
    return statusMap[status] || 'Order Received';
  };

  const orderStatus = order.status || 'received';
  const orderItems = order.items || [];
  const customerInfo = order.customerInfo || {};
  const totalAmount = order.totalAmount || 0;

  return (
    <div className="order-confirmation-page">
      <div className="confirmation-container">
        {/* Success Icon */}
        <div className="success-icon">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" stroke="#c41e3a" strokeWidth="4" />
            <path
              d="M25 40L35 50L55 30"
              stroke="#c41e3a"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1>Order Confirmed!</h1>
        <p className="confirmation-message">
          Thank you for your order. We're preparing your delicious meal!
        </p>

        {/* Order Number */}
        <div className="order-number-section">
          <span className="order-number-label">Order Number</span>
          <span className="order-number">{orderNumber}</span>
        </div>

        {/* Order Status */}
        <div className="status-section">
          <div className="status-indicator">
            <span className="status-label">Status:</span>
            <span className={`status-badge status-${orderStatus}`}>
              {getStatusDisplay(orderStatus)}
            </span>
          </div>
          
          {estimatedDelivery && (
            <div className="delivery-time">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="#666" strokeWidth="1.5" />
                <path d="M10 5V10L13 13" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>Estimated delivery: {formatDeliveryTime(estimatedDelivery)}</span>
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="order-details-section">
          <h2>Order Details</h2>
          
          <div className="order-items">
            {orderItems.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">x{item.quantity}</span>
                </div>
                <span className="item-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="order-total">
            <span>Total</span>
            <span className="total-amount">${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="delivery-section">
          <h2>Delivery Address</h2>
          <div className="delivery-info">
            <div className="info-row">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2C7.24 2 5 4.24 5 7c0 4.5 5 11 5 11s5-6.5 5-11c0-2.76-2.24-5-5-5zm0 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
                  fill="#666"
                />
              </svg>
              <span>{customerInfo.address}</span>
            </div>
            <div className="info-row">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M16 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
                  fill="#666"
                />
                <circle cx="10" cy="10" r="3" fill="#666" />
              </svg>
              <span>{customerInfo.name}</span>
            </div>
            <div className="info-row">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M16 2H4c-1.1 0-1.99.9-1.99 2L2 16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 12H6v-2h4v2zm4-4H6V8h8v2z"
                  fill="#666"
                />
              </svg>
              <span>{customerInfo.phone}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="track-order-button"
            onClick={() => navigate('/order-status', { state: { orderNumber } })}
          >
            Track Order
          </button>
          <button
            className="continue-shopping-button"
            onClick={() => navigate('/menu')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
