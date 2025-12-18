import { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';
import './AdminVoucherManagement.css';

const AdminVoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minimumOrder: '',
    expiryDate: '',
    usageLimit: '',
    isActive: true
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getAllVouchers();
      setVouchers(data || []);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      setError('Failed to load vouchers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingVoucher(null);
    setFormData({
      code: '',
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minimumOrder: '',
      expiryDate: '',
      usageLimit: '',
      isActive: true
    });
    setShowForm(true);
  };

  const handleEdit = (voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      code: voucher.code || '',
      title: voucher.title || '',
      description: voucher.description || '',
      discountType: voucher.discount_type || 'percentage',
      discountValue: voucher.discount_value?.toString() || '',
      minimumOrder: voucher.minimum_order?.toString() || '',
      expiryDate: voucher.expiry_date ? new Date(voucher.expiry_date).toISOString().split('T')[0] : '',
      usageLimit: voucher.usage_limit?.toString() || '',
      isActive: voucher.is_active !== false
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingVoucher(null);
    setFormData({
      code: '',
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minimumOrder: '',
      expiryDate: '',
      usageLimit: '',
      isActive: true
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const voucherPayload = {
        code: formData.code,
        title: formData.title,
        description: formData.description || '',
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minimumOrder: formData.minimumOrder ? parseFloat(formData.minimumOrder) : 0,
        expiryDate: formData.expiryDate || null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null
      };

      if (editingVoucher) {
        voucherPayload.isActive = formData.isActive;
        await adminService.updateVoucher(editingVoucher.id, voucherPayload);
      } else {
        await adminService.createVoucher(voucherPayload);
      }
      
      await fetchVouchers();
      handleCloseForm();
    } catch (err) {
      console.error('Error saving voucher:', err);
      const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to save voucher. Please try again.';
      setError(errorMessage);
    }
  };

  const handleDeleteClick = (voucher) => {
    setDeleteConfirm(voucher);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    
    try {
      await adminService.deleteVoucher(deleteConfirm.id);
      setVouchers(prev => prev.filter(v => v.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting voucher:', err);
      setError(err.message || 'Failed to delete voucher. Please try again.');
      setDeleteConfirm(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const formatDiscount = (voucher) => {
    if (voucher.discount_type === 'percentage') {
      return `${voucher.discount_value}% OFF`;
    } else {
      return `$${voucher.discount_value} OFF`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiry';
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <div className="admin-voucher-management">
        <div className="voucher-header">
          <h2>Voucher Management</h2>
        </div>
        <div className="loading-state">
          <Loading text="Loading vouchers..." />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-voucher-management">
      <div className="voucher-header">
        <h2>Voucher Management</h2>
        <button onClick={handleAddNew} className="btn-add-new">
          + Create New Voucher
        </button>
      </div>

      {error && (
        <ErrorMessage 
          message={error}
          type="error"
          onDismiss={() => setError('')}
        />
      )}

      <div className="vouchers-list">
        {vouchers.length === 0 ? (
          <div className="empty-state">
            <p>No vouchers yet. Create your first voucher to get started!</p>
          </div>
        ) : (
          vouchers.map(voucher => (
            <div key={voucher.id} className={`voucher-card ${!voucher.is_active ? 'inactive' : ''} ${isExpired(voucher.expiry_date) ? 'expired' : ''}`}>
              <div className="voucher-card-header">
                <div className="voucher-code">{voucher.code}</div>
                <div className="voucher-status">
                  {!voucher.is_active && <span className="status-badge inactive-badge">Inactive</span>}
                  {voucher.is_active && isExpired(voucher.expiry_date) && <span className="status-badge expired-badge">Expired</span>}
                  {voucher.is_active && !isExpired(voucher.expiry_date) && <span className="status-badge active-badge">Active</span>}
                </div>
              </div>
              
              <div className="voucher-card-body">
                <h3>{voucher.title}</h3>
                {voucher.description && <p className="voucher-description">{voucher.description}</p>}
                
                <div className="voucher-details">
                  <div className="detail-row">
                    <span className="detail-label">Discount:</span>
                    <span className="detail-value discount-value">{formatDiscount(voucher)}</span>
                  </div>
                  {voucher.minimum_order > 0 && (
                    <div className="detail-row">
                      <span className="detail-label">Minimum Order:</span>
                      <span className="detail-value">{voucher.minimum_order.toFixed(2)} EGP</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Expiry Date:</span>
                    <span className="detail-value">{formatDate(voucher.expiry_date)}</span>
                  </div>
                  {voucher.usage_limit !== null && (
                    <div className="detail-row">
                      <span className="detail-label">Usage:</span>
                      <span className="detail-value">{voucher.used_count || 0} / {voucher.usage_limit}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="voucher-actions">
                <button onClick={() => handleEdit(voucher)} className="btn-edit">
                  Edit
                </button>
                <button onClick={() => handleDeleteClick(voucher)} className="btn-delete">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="voucher-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingVoucher ? 'Edit Voucher' : 'Create New Voucher'}</h3>
              <button className="close-button" onClick={handleCloseForm}>×</button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="voucher-form">
              <div className="form-group">
                <label htmlFor="code">Voucher Code *</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., SAVE10"
                  disabled={!!editingVoucher}
                />
              </div>

              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Save 10%"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Optional description"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="discountType">Discount Type *</label>
                  <select
                    id="discountType"
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="discountValue">Discount Value *</label>
                  <input
                    type="number"
                    id="discountValue"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder={formData.discountType === 'percentage' ? '10' : '5.00'}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="minimumOrder">Minimum Order ($)</label>
                  <input
                    type="number"
                    id="minimumOrder"
                    name="minimumOrder"
                    value={formData.minimumOrder}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="usageLimit">Usage Limit</label>
                  <input
                    type="number"
                    id="usageLimit"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Unlimited (leave empty)"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="expiryDate">Expiry Date</label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                />
              </div>

              {editingVoucher && (
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <span>Active (visible to users)</span>
                  </label>
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={handleCloseForm} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingVoucher ? 'Update Voucher' : 'Create Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={handleDeleteCancel}>
          <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete voucher "{deleteConfirm.code}"?</p>
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

export default AdminVoucherManagement;
