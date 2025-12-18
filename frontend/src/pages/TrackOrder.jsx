import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import './TrackOrder.css';

const TrackOrder = () => {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!orderNumber.trim()) {
      setError('Please enter an order number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/orders/${orderNumber}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found. Please check your order number.');
        }
        throw new Error('Failed to fetch order. Please try again.');
      }

      const data = await response.json();
      
      // Navigate to order status page with the order data
      navigate('/order-status', { 
        state: { 
          orderNumber: data.orderNumber,
          order: data 
        } 
      });
    } catch (err) {
      console.error('Track order error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Navigation />
      <div className="track-order-container">
        <div className="track-order-card">
          <div className="track-order-icon">
            📦
          </div>
          
          <h1>Track Your Order</h1>
          <p className="track-order-description">
            Enter your order number to check the status of your delivery
          </p>

          <form onSubmit={handleSubmit} className="track-order-form">
            <div className="form-group">
              <label htmlFor="orderNumber">Order Number</label>
              <input
                type="text"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => {
                  setOrderNumber(e.target.value);
                  setError('');
                }}
                placeholder="e.g., ORD-1234567890"
                className={error ? 'error' : ''}
                disabled={loading}
              />
              {error && <span className="error-message">{error}</span>}
            </div>

            <button 
              type="submit" 
              className="track-button"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>

          <div className="track-order-help">
            <p className="help-title">Where to find your order number?</p>
            <ul className="help-list">
              <li>Check your order confirmation page</li>
              <li>Look in your email confirmation</li>
              <li>It starts with "ORD-" followed by numbers</li>
            </ul>
          </div>

          <button 
            className="back-to-menu-link"
            onClick={() => navigate('/menu')}
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
