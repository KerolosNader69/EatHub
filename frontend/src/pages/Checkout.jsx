import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';
import ErrorMessage, { InlineError } from '../components/ErrorMessage';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    specialInstructions: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Redirect if cart is empty
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Phone validation (at least 10 digits)
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (phoneDigits.length < 10) {
      newErrors.phone = 'Phone number must contain at least 10 digits';
    }
    
    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Delivery address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          itemId: item.id,
          quantity: item.quantity
        })),
        customerInfo: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim()
        },
        specialInstructions: formData.specialInstructions.trim()
      };
      
      // Create order
      const response = await createOrder(orderData);
      
      // Navigate to confirmation page with order data
      navigate('/order-confirmation', {
        state: {
          orderNumber: response.orderNumber,
          estimatedDelivery: response.estimatedDelivery,
          order: response.order || response
        }
      });
      
    } catch (error) {
      console.error('Error submitting order:', error);
      setSubmitError(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Checkout</h1>
        
        <div className="checkout-content">
          {/* Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-items">
              {items.map(item => (
                <div key={item.id} className="summary-item">
                  <div className="summary-item-info">
                    <span className="summary-item-name">{item.name}</span>
                    <span className="summary-item-quantity">x{item.quantity}</span>
                  </div>
                  <span className="summary-item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span className="total-amount">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Checkout Form */}
          <div className="checkout-form-container">
            <h2>Delivery Information</h2>
            
            {submitError && (
              <ErrorMessage 
                message={submitError}
                type="error"
                onDismiss={() => setSubmitError('')}
              />
            )}
            
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-group">
                <label htmlFor="name">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  disabled={isSubmitting}
                />
                <InlineError message={errors.name} />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'error' : ''}
                  placeholder="(123) 456-7890"
                  disabled={isSubmitting}
                />
                <InlineError message={errors.phone} />
              </div>
              
              <div className="form-group">
                <label htmlFor="address">
                  Delivery Address <span className="required">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={errors.address ? 'error' : ''}
                  rows="3"
                  disabled={isSubmitting}
                />
                <InlineError message={errors.address} />
              </div>
              
              <div className="form-group">
                <label htmlFor="specialInstructions">
                  Special Instructions (Optional)
                </label>
                <textarea
                  id="specialInstructions"
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any special requests or dietary requirements..."
                  disabled={isSubmitting}
                />
              </div>
              
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
