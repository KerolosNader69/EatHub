import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import './Feedback.css';

const Feedback = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    category: 'general',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to submit feedback');
      }

      console.log('Feedback submitted successfully:', data);
      setSubmitted(true);
      
      // Reset form after 3 seconds and redirect
      setTimeout(() => {
        setSubmitted(false);
        navigate('/menu');
      }, 3000);
    } catch (error) {
      console.error('Feedback submission error:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="app">
        <Navigation />
        <div className="feedback-container">
          <div className="feedback-card success-card">
            <div className="success-icon">✓</div>
            <h1>Thank You!</h1>
            <p className="success-message">
              Your feedback has been submitted successfully.
            </p>
            <p className="redirect-message">
              Redirecting to menu...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Navigation />
      <div className="feedback-container">
        <div className="feedback-card">
          <button 
            className="back-button" 
            onClick={() => navigate('/menu')}
            aria-label="Back to menu"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Menu
          </button>

          <div className="feedback-header">
            <div className="feedback-icon">💬</div>
            <h1>We'd Love Your Feedback!</h1>
            <p>Help us improve your experience</p>
          </div>

          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name (Optional)</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email (Optional)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="rating">How would you rate your experience?</label>
              <div className="rating-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-button ${formData.rating >= star ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  >
                    ⭐
                  </button>
                ))}
                <span className="rating-text">
                  {formData.rating === 1 && 'Poor'}
                  {formData.rating === 2 && 'Fair'}
                  {formData.rating === 3 && 'Good'}
                  {formData.rating === 4 && 'Very Good'}
                  {formData.rating === 5 && 'Excellent'}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category">Feedback Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="general">General Feedback</option>
                <option value="food_quality">Food Quality</option>
                <option value="delivery">Delivery Service</option>
                <option value="website">Website Experience</option>
                <option value="suggestion">Suggestion</option>
                <option value="complaint">Complaint</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message">Your Feedback *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us what you think..."
                rows="6"
                required
              />
            </div>

            <button type="submit" className="submit-button">
              Submit Feedback
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
