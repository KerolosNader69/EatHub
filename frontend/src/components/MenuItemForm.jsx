import { useState, useEffect } from 'react';
import { processImageForUpload, formatFileSize, MAX_IMAGE_SIZE } from '../utils/imageOptimization';
import OptimizedImage from './OptimizedImage';
import './MenuItemForm.css';

const MenuItemForm = ({ item, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'chicken_burgers',
    ingredients: '',
    portionSize: '',
    available: true,
    // Announcement fields
    isAnnouncement: false,
    announcementTitle: '',
    announcementSubtitle: '',
    announcementPrice: '',
    announcementPriority: 1,
    announcementActive: true
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        price: item.price || '',
        category: item.category || 'chicken_burgers',
        ingredients: Array.isArray(item.ingredients) ? item.ingredients.join(', ') : '',
        portionSize: item.portionSize || item.portion_size || '',
        available: item.available !== undefined ? item.available : true,
        // Announcement fields
        isAnnouncement: item.is_announcement || false,
        announcementTitle: item.announcement_title || '',
        announcementSubtitle: item.announcement_subtitle || '',
        announcementPrice: item.announcement_price || '',
        announcementPriority: item.announcement_priority || 1,
        announcementActive: item.announcement_active !== undefined ? item.announcement_active : true
      });
      
      if (item.image) {
        setImagePreview(item.image);
      }
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Process and optimize image
        const { file: processedFile, size, compressed } = await processImageForUpload(file);
        
        setImageFile(processedFile);
        setErrors(prev => ({
          ...prev,
          image: ''
        }));
        
        // Show compression info if image was compressed
        if (compressed) {
          console.log(`Image compressed from ${formatFileSize(file.size)} to ${formatFileSize(size)}`);
        }
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(processedFile);
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          image: error.message
        }));
        setImageFile(null);
        setImagePreview('');
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be 100 characters or less';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Price must be a valid positive number';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
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
    setSubmitError('');
    
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('price', parseFloat(formData.price));
      submitData.append('category', formData.category);
      // Ensure boolean is sent as string for FormData
      submitData.append('available', formData.available ? 'true' : 'false');
      
      if (formData.ingredients.trim()) {
        const ingredientsArray = formData.ingredients
          .split(',')
          .map(i => i.trim())
          .filter(i => i);
        submitData.append('ingredients', JSON.stringify(ingredientsArray));
      }
      
      if (formData.portionSize.trim()) {
        submitData.append('portionSize', formData.portionSize.trim());
      }

      // Announcement fields
      submitData.append('isAnnouncement', formData.isAnnouncement ? 'true' : 'false');
      if (formData.isAnnouncement) {
        submitData.append('announcementTitle', formData.announcementTitle || formData.name);
        submitData.append('announcementSubtitle', formData.announcementSubtitle || formData.description);
        submitData.append('announcementPrice', formData.announcementPrice || formData.price);
        submitData.append('announcementPriority', formData.announcementPriority || 1);
        submitData.append('announcementActive', formData.announcementActive ? 'true' : 'false');
      }
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }
      
      await onSubmit(submitData);
    } catch (err) {
      console.error('Error submitting form:', err);
      setSubmitError(err.message || 'Failed to save menu item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="menu-item-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h3>{item ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
          <button onClick={onClose} className="btn-close-modal">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="menu-item-form">
          {submitError && (
            <div className="error-message" role="alert">
              {submitError}
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                disabled={isSubmitting}
                maxLength={100}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={errors.description ? 'error' : ''}
                disabled={isSubmitting}
                rows={4}
                maxLength={500}
              />
              {errors.description && <span className="field-error">{errors.description}</span>}
            </div>
          </div>
          
          <div className="form-row two-columns">
            <div className="form-group">
              <label htmlFor="price">Price ($) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={errors.price ? 'error' : ''}
                disabled={isSubmitting}
                step="0.01"
                min="0"
              />
              {errors.price && <span className="field-error">{errors.price}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? 'error' : ''}
                disabled={isSubmitting}
              >
                <option value="chicken_burgers">Chicken Burgers</option>
                <option value="beef_burgers">Beef Burgers</option>
                <option value="box_deals">Box Deals</option>
                <option value="drinks">Drinks</option>
                <option value="potatoes">Potatoes</option>
                <option value="deals_night">Deals Night</option>
              </select>
              {errors.category && <span className="field-error">{errors.category}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ingredients">Ingredients (comma-separated)</label>
              <input
                type="text"
                id="ingredients"
                name="ingredients"
                value={formData.ingredients}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="e.g., Tomatoes, Cheese, Basil"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="portionSize">Portion Size</label>
              <input
                type="text"
                id="portionSize"
                name="portionSize"
                value={formData.portionSize}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="e.g., Serves 2-3"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="image">Image</label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                disabled={isSubmitting}
              />
              <small className="field-hint">
                Images will be automatically optimized to {formatFileSize(MAX_IMAGE_SIZE)} or less
              </small>
              {errors.image && <span className="field-error">{errors.image}</span>}
              {imagePreview && (
                <div className="image-preview">
                  <OptimizedImage src={imagePreview} alt="Preview" lazy={false} />
                </div>
              )}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="availability-checkbox">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      available: e.target.checked
                    }));
                  }}
                  disabled={isSubmitting}
                  style={{
                    width: '24px',
                    height: '24px',
                    marginRight: '12px',
                    cursor: 'pointer',
                    accentColor: '#C41E3A'
                  }}
                />
                <span>Available for ordering</span>
              </label>
            </div>
          </div>

          {/* Announcement Offer Section */}
          <div className="form-section announcement-section">
            <h4>🔥 Announcement Offer (Promo Banner)</h4>
            <div className="form-row">
              <div className="form-group">
                <label className="availability-checkbox">
                  <input
                    type="checkbox"
                    name="isAnnouncement"
                    checked={formData.isAnnouncement}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        isAnnouncement: e.target.checked
                      }));
                    }}
                    disabled={isSubmitting}
                    style={{
                      width: '24px',
                      height: '24px',
                      marginRight: '12px',
                      cursor: 'pointer',
                      accentColor: '#C41E3A'
                    }}
                  />
                  <span>Show as Promo Banner on Home Page</span>
                </label>
              </div>
            </div>

            {formData.isAnnouncement && (
              <>
                <div className="form-row two-columns">
                  <div className="form-group">
                    <label htmlFor="announcementTitle">Banner Title</label>
                    <input
                      type="text"
                      id="announcementTitle"
                      name="announcementTitle"
                      value={formData.announcementTitle}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      placeholder="e.g., Special BBQ Deal!"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="announcementPrice">Banner Price (EGP)</label>
                    <input
                      type="number"
                      id="announcementPrice"
                      name="announcementPrice"
                      value={formData.announcementPrice}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      step="0.01"
                      min="0"
                      placeholder="Leave empty to use item price"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="announcementSubtitle">Banner Subtitle</label>
                    <input
                      type="text"
                      id="announcementSubtitle"
                      name="announcementSubtitle"
                      value={formData.announcementSubtitle}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      placeholder="e.g., Get 3 burgers for the price of 2!"
                    />
                  </div>
                </div>
                <div className="form-row two-columns">
                  <div className="form-group">
                    <label htmlFor="announcementPriority">Priority (lower = higher)</label>
                    <input
                      type="number"
                      id="announcementPriority"
                      name="announcementPriority"
                      value={formData.announcementPriority}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      min="1"
                    />
                  </div>
                  <div className="form-group">
                    <label className="availability-checkbox" style={{ marginTop: '28px' }}>
                      <input
                        type="checkbox"
                        name="announcementActive"
                        checked={formData.announcementActive}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            announcementActive: e.target.checked
                          }));
                        }}
                        disabled={isSubmitting}
                        style={{
                          width: '20px',
                          height: '20px',
                          marginRight: '8px',
                          cursor: 'pointer',
                          accentColor: '#C41E3A'
                        }}
                      />
                      <span>Banner Active</span>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (item ? 'Update Item' : 'Add Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemForm;
