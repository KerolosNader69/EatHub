import { useState, useEffect } from 'react';
import menuService from '../services/menuService';
import adminService from '../services/adminService';
import MenuItemForm from './MenuItemForm';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';
import OptimizedImage from './OptimizedImage';
import './AdminMenuManagement.css';

const AdminMenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError('');
      const items = await menuService.getMenuItems();
      setMenuItems(items);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Failed to load menu items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingItem) {
        // Update existing item
        await adminService.updateMenuItem(editingItem._id, formData);
      } else {
        // Create new item
        await adminService.createMenuItem(formData);
      }
      
      // Refresh menu items
      await fetchMenuItems();
      handleCloseForm();
    } catch (err) {
      console.error('Error saving menu item:', err);
      throw err;
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const updatedData = { available: !item.available };
      await adminService.updateMenuItem(item._id, updatedData);
      
      // Update local state immediately for UI responsiveness
      setMenuItems(prevItems =>
        prevItems.map(i =>
          i._id === item._id ? { ...i, available: !i.available } : i
        )
      );
    } catch (err) {
      console.error('Error toggling availability:', err);
      setError('Failed to update availability. Please try again.');
      // Refresh to get correct state
      fetchMenuItems();
    }
  };

  const handleDeleteClick = (item) => {
    setDeleteConfirm(item);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    
    try {
      await adminService.deleteMenuItem(deleteConfirm._id);
      setMenuItems(prevItems => prevItems.filter(i => i._id !== deleteConfirm._id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting menu item:', err);
      setError('Failed to delete menu item. Please try again.');
      setDeleteConfirm(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const getCategoryLabel = (category) => {
    const labels = {
      appetizers: 'Appetizers',
      main_courses: 'Main Courses',
      desserts: 'Desserts',
      beverages: 'Beverages'
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="admin-menu-management">
        <div className="menu-header">
          <h2>Menu Management</h2>
        </div>
        <div className="loading-state">
          <Loading text="Loading menu items..." />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-menu-management">
      <div className="menu-header">
        <h2>Menu Management</h2>
        <button onClick={handleAddNew} className="btn-add-new">
          + Add New Item
        </button>
      </div>

      {error && (
        <ErrorMessage 
          message={error}
          type="error"
          onDismiss={() => setError('')}
        />
      )}

      <div className="menu-items-grid">
        {menuItems.length === 0 ? (
          <div className="empty-state">
            <p>No menu items yet. Add your first item to get started!</p>
          </div>
        ) : (
          menuItems.map(item => (
            <div key={item._id} className="menu-item-card">
              <div className="item-image">
                {item.image ? (
                  <OptimizedImage src={item.image} alt={item.name} lazy={true} />
                ) : (
                  <div className="image-placeholder">No Image</div>
                )}
              </div>
              
              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="item-category">{getCategoryLabel(item.category)}</p>
                <p className="item-price">${item.price.toFixed(2)}</p>
                <p className="item-description">{item.description}</p>
              </div>
              
              <div className="item-actions">
                <div className="availability-toggle">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={item.available}
                      onChange={() => handleToggleAvailability(item)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className={`availability-label ${item.available ? 'available' : 'unavailable'}`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                
                <div className="action-buttons">
                  <button onClick={() => handleEdit(item)} className="btn-edit">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteClick(item)} className="btn-delete">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <MenuItemForm
          item={editingItem}
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
        />
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={handleDeleteCancel}>
          <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete "{deleteConfirm.name}"?</p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={handleDeleteCancel} className="btn-cancel">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className="btn-confirm-delete">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenuManagement;
