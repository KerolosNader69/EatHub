import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import ErrorMessage, { InlineError } from '../components/ErrorMessage';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, setLoading, setError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear login error
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setLoading(true);
    setLoginError('');
    
    try {
      const response = await adminService.login({
        email: formData.email,
        password: formData.password
      });
      
      // Store token and admin info
      login(response.token, response.admin);
      
      // Redirect to dashboard
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      setLoginError(error.message || 'Invalid email or password. Please try again.');
      setError(error.message);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <h1>
            <span className="logo-eat">Eat</span>
            <span className="logo-hub">hub</span>
          </h1>
          <h2>Admin Login</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          {loginError && (
            <ErrorMessage 
              message={loginError}
              type="error"
              onDismiss={() => setLoginError('')}
            />
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              disabled={isSubmitting}
              autoComplete="email"
              placeholder="admin@eathub.com"
            />
            <InlineError message={errors.email} />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              disabled={isSubmitting}
              autoComplete="current-password"
            />
            <InlineError message={errors.password} />
          </div>
          
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
