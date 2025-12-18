import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminFeedbackManagement.css';

const AdminFeedbackManagement = () => {
  const { getAuthToken } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      
      const response = await fetch('/api/feedback', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch feedback');
      }

      setFeedback(data.feedback || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAndSortedFeedback = () => {
    let filtered = [...feedback];

    // Apply filter
    if (filter !== 'all') {
      if (filter === 'high-rating') {
        filtered = filtered.filter(f => f.rating >= 4);
      } else if (filter === 'low-rating') {
        filtered = filtered.filter(f => f.rating <= 2);
      } else {
        filtered = filtered.filter(f => f.category === filter);
      }
    }

    // Apply sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === 'rating-high') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'rating-low') {
      filtered.sort((a, b) => a.rating - b.rating);
    }

    return filtered;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  const getCategoryLabel = (category) => {
    const labels = {
      general: 'General',
      food_quality: 'Food Quality',
      delivery: 'Delivery',
      website: 'Website',
      suggestion: 'Suggestion',
      complaint: 'Complaint'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: '#6c757d',
      food_quality: '#28a745',
      delivery: '#007bff',
      website: '#17a2b8',
      suggestion: '#ffc107',
      complaint: '#dc3545'
    };
    return colors[category] || '#6c757d';
  };

  const getStats = () => {
    const total = feedback.length;
    const avgRating = total > 0
      ? (feedback.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1)
      : 0;
    const highRating = feedback.filter(f => f.rating >= 4).length;
    const lowRating = feedback.filter(f => f.rating <= 2).length;

    return { total, avgRating, highRating, lowRating };
  };

  if (loading) {
    return (
      <div className="feedback-management">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feedback-management">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={fetchFeedback} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredFeedback = getFilteredAndSortedFeedback();
  const stats = getStats();

  return (
    <div className="feedback-management">
      <div className="feedback-header">
        <h2>Customer Feedback</h2>
        <button onClick={fetchFeedback} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>

      <div className="feedback-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Feedback</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.avgRating} ⭐</div>
          <div className="stat-label">Average Rating</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.highRating}</div>
          <div className="stat-label">High Ratings (4-5)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.lowRating}</div>
          <div className="stat-label">Low Ratings (1-2)</div>
        </div>
      </div>

      <div className="feedback-controls">
        <div className="control-group">
          <label htmlFor="filter">Filter:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="control-select"
          >
            <option value="all">All Feedback</option>
            <option value="high-rating">High Ratings (4-5)</option>
            <option value="low-rating">Low Ratings (1-2)</option>
            <option value="general">General</option>
            <option value="food_quality">Food Quality</option>
            <option value="delivery">Delivery</option>
            <option value="website">Website</option>
            <option value="suggestion">Suggestions</option>
            <option value="complaint">Complaints</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="sort">Sort by:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="control-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating-high">Highest Rating</option>
            <option value="rating-low">Lowest Rating</option>
          </select>
        </div>
      </div>

      {filteredFeedback.length === 0 ? (
        <div className="empty-state">
          <p>No feedback found matching your filters.</p>
        </div>
      ) : (
        <div className="feedback-list">
          {filteredFeedback.map((item) => (
            <div key={item.id} className="feedback-item">
              <div className="feedback-item-header">
                <div className="feedback-meta">
                  <span className="feedback-name">{item.name}</span>
                  {item.email && (
                    <span className="feedback-email">{item.email}</span>
                  )}
                </div>
                <div className="feedback-rating">
                  {getRatingStars(item.rating)}
                </div>
              </div>

              <div className="feedback-item-body">
                <span
                  className="feedback-category"
                  style={{ backgroundColor: getCategoryColor(item.category) }}
                >
                  {getCategoryLabel(item.category)}
                </span>
                <p className="feedback-message">{item.message}</p>
              </div>

              <div className="feedback-item-footer">
                <span className="feedback-date">
                  {formatDate(item.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFeedbackManagement;
