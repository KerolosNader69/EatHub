import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminMenuManagement from '../components/AdminMenuManagement';
import AdminOrderManagement from '../components/AdminOrderManagement';
import AdminFeedbackManagement from '../components/AdminFeedbackManagement';
import AdminVoucherManagement from '../components/AdminVoucherManagement';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, admin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('menu');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1 className="admin-logo">
            <span className="logo-eat">Eat</span>
            <span className="logo-hub">hub</span>
            <span className="admin-badge">Admin</span>
          </h1>
          
          <div className="admin-user-info">
            <span className="admin-username">
              Welcome, {admin?.username || 'Admin'}
            </span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="admin-content">
        <nav className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            Menu Management
          </button>
          <button
            className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Order Management
          </button>
          <button
            className={`tab-button ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            Customer Feedback
          </button>
          <button
            className={`tab-button ${activeTab === 'vouchers' ? 'active' : ''}`}
            onClick={() => setActiveTab('vouchers')}
          >
            Voucher Management
          </button>
        </nav>

        <div className="admin-panel">
          {activeTab === 'menu' && <AdminMenuManagement />}
          {activeTab === 'orders' && <AdminOrderManagement />}
          {activeTab === 'feedback' && <AdminFeedbackManagement />}
          {activeTab === 'vouchers' && <AdminVoucherManagement />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
