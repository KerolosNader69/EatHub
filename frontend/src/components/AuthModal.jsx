import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const { login } = useAuth();
  const [isSignup, setIsSignup] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  if (!isOpen) return null;

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateSignup = () => {
    const newErrors = {};
    if (!signupData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!signupData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(signupData.email)) newErrors.email = 'Email is invalid';
    if (!signupData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!signupData.address.trim()) newErrors.address = 'Address is required';
    if (!signupData.password) newErrors.password = 'Password is required';
    else if (signupData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (signupData.password !== signupData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!loginData.email.trim()) newErrors.email = 'Email is required';
    if (!loginData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/user/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: signupData.fullName,
          email: signupData.email,
          phone: signupData.phone,
          address: signupData.address,
          password: signupData.password
        })
      });

      // Check if response has content
      const text = await response.text();
      if (!text) {
        throw new Error('Server returned empty response. Please check if backend is running.');
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Response text:', text);
        throw new Error('Invalid server response. Please check backend logs.');
      }

      if (!response.ok) {
        // Handle rate limiting
        if (data.error?.message?.includes('security purposes')) {
          throw new Error('Too many signup attempts. Please wait a minute and try again.');
        }
        throw new Error(data.error?.message || 'Signup failed');
      }

      // Check if email verification is required
      if (data.success && !data.token) {
        // Email verification required
        setUserEmail(signupData.email);
        setShowEmailVerification(true);
      } else if (data.token && data.user) {
        // Auto-login (email verification disabled)
        login(data.token, data.user);
        onSuccess();
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      // Check if response has content
      const text = await response.text();
      if (!text) {
        throw new Error('Server returned empty response. Please check if backend is running.');
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Response text:', text);
        throw new Error('Invalid server response. Please check backend logs.');
      }

      if (!response.ok) {
        // Handle rate limiting
        if (data.error?.message?.includes('security purposes')) {
          throw new Error('Too many login attempts. Please wait a minute and try again.');
        }
        throw new Error(data.error?.message || 'Login failed');
      }

      if (data.token && data.user) {
        login(data.token, data.user);
        onSuccess();
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>×</button>
        
        {showEmailVerification ? (
          // Email Verification Message
          <div className="email-verification-container">
            <div className="verification-icon">📧</div>
            <h2>Check Your Email</h2>
            <p className="verification-message">
              We've sent a verification link to:
            </p>
            <p className="verification-email">{userEmail}</p>
            <p className="verification-instructions">
              Please check your email and click the verification link to activate your account.
              After verifying, come back and login to continue your order.
            </p>
            <button 
              className="auth-submit-button"
              onClick={() => {
                setShowEmailVerification(false);
                setIsSignup(false); // Switch to login tab
              }}
            >
              Go to Login
            </button>
          </div>
        ) : (
          <>
            <div className="auth-modal-header">
              <h2>⚠️ Authentication Required</h2>
              <p>Please sign up or login to complete your order</p>
            </div>

        <div className="auth-modal-tabs">
          <button
            className={`auth-tab ${isSignup ? 'active' : ''}`}
            onClick={() => { setIsSignup(true); setErrors({}); }}
          >
            Sign Up
          </button>
          <button
            className={`auth-tab ${!isSignup ? 'active' : ''}`}
            onClick={() => { setIsSignup(false); setErrors({}); }}
          >
            Login
          </button>
        </div>

        {isSignup ? (
          <form onSubmit={handleSignupSubmit} className="auth-modal-form">
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  name="fullName"
                  value={signupData.fullName}
                  onChange={handleSignupChange}
                  placeholder="Full Name *"
                  className={errors.fullName ? 'error' : ''}
                  disabled={loading}
                />
                {errors.fullName && <span className="error-text">{errors.fullName}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  placeholder="Email *"
                  className={errors.email ? 'error' : ''}
                  disabled={loading}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  value={signupData.phone}
                  onChange={handleSignupChange}
                  placeholder="Phone Number *"
                  className={errors.phone ? 'error' : ''}
                  disabled={loading}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <textarea
                  name="address"
                  value={signupData.address}
                  onChange={handleSignupChange}
                  placeholder="Delivery Address *"
                  rows="2"
                  className={errors.address ? 'error' : ''}
                  disabled={loading}
                />
                {errors.address && <span className="error-text">{errors.address}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  placeholder="Password (min. 6 characters) *"
                  className={errors.password ? 'error' : ''}
                  disabled={loading}
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  value={signupData.confirmPassword}
                  onChange={handleSignupChange}
                  placeholder="Confirm Password *"
                  className={errors.confirmPassword ? 'error' : ''}
                  disabled={loading}
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            </div>

            {errors.submit && <div className="submit-error">{errors.submit}</div>}

            <button type="submit" className="auth-submit-button" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up & Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="auth-modal-form">
            <div className="form-row">
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  placeholder="Email *"
                  className={errors.email ? 'error' : ''}
                  disabled={loading}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="Password *"
                  className={errors.password ? 'error' : ''}
                  disabled={loading}
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
            </div>

            {errors.submit && <div className="submit-error">{errors.submit}</div>}

            <button type="submit" className="auth-submit-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login & Continue'}
            </button>
          </form>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
