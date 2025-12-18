import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getMenuItems } from '../services/menuService';
import MenuListCard from '../components/MenuListCard';
import MenuItemDetail from '../components/MenuItemDetail';
import ErrorMessage from '../components/ErrorMessage';
import { MenuGridSkeleton } from '../components/SkeletonLoader';
import { useCart } from '../context/CartContext';
import Toast from '../components/Toast';
import './Menu.css';

// Helper function to format category names for display
const formatCategoryLabel = (category) => {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { addItem } = useCart();
  const { category } = useParams(); // Get category from URL
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we're in a category-specific view
  const isInCategoryView = Boolean(category);
  const currentCategoryLabel = category ? formatCategoryLabel(category) : '';

  useEffect(() => {
    fetchMenuItems();
  }, [category]); // Re-fetch when category changes

  // Handle opening item from navigation state (e.g., from promo banner)
  useEffect(() => {
    if (location.state?.openItem) {
      setSelectedItem(location.state.openItem);
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await getMenuItems();
      setMenuItems(items);
      
      // Extract unique categories from menu items
      const uniqueCategories = [...new Set(items.map(item => item.category))];
      const categoryOptions = uniqueCategories.map(category => ({
        id: category,
        label: formatCategoryLabel(category)
      }));
      setCategories(categoryOptions);
      
    } catch (err) {
      setError('Failed to load menu items. Please try again later.');
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to normalize category names for comparison
  // Converts to lowercase and replaces spaces and hyphens with underscores
  const normalizeCategoryName = (catName) => {
    if (!catName) return '';
    return catName.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
  };

  // Filter items based on category parameter
  const filteredItems = isInCategoryView
    ? menuItems.filter(item => {
        // Compare normalized category names to handle different formats
        const itemCategory = normalizeCategoryName(item.category);
        const urlCategory = normalizeCategoryName(category);
        return itemCategory === urlCategory;
      })
    : menuItems; // Show all items on main menu page

  const handleAddToCart = (item, quantity = 1) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity
    });
    
    // Show toast notification
    setToastMessage(`${quantity}x ${item.name} added to cart!`);
    setShowToast(true);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const handleBackClick = () => {
    navigate('/');
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/menu/${categoryId}`);
  };

  if (loading) {
    return (
      <div className="menu-page">
        <div className="container">
          {isInCategoryView ? (
            <div className="category-header">
              <button className="back-button" disabled>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
              <h1 className="menu-title">{currentCategoryLabel}</h1>
            </div>
          ) : (
            <h1 className="menu-title">Our Menu</h1>
          )}
          <MenuGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-error">
        <ErrorMessage 
          message={error}
          type="error"
          title="Failed to Load Menu"
          onRetry={fetchMenuItems}
        />
      </div>
    );
  }

  return (
    <div className="menu-page">
      <div className="container">
        {/* Header: Show back button + category name OR just title */}
        {isInCategoryView ? (
          <div className="category-header">
            <button 
              className="back-button" 
              onClick={handleBackClick}
              aria-label="Back to homepage"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 className="menu-title">{currentCategoryLabel}</h1>
          </div>
        ) : (
          <>
            <h1 className="menu-title">Our Menu</h1>
            
            {/* Category Tabs - Only show on main menu page */}
            <div className="category-tabs">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className="category-tab"
                  onClick={() => handleCategoryClick(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Menu Items List */}
        {filteredItems.length === 0 ? (
          <div className="no-items">
            <p>No items available{isInCategoryView ? ' in this category' : ''}.</p>
          </div>
        ) : (
          <div className="menu-list">
            {filteredItems.map(item => (
              <MenuListCard
                key={item.id}
                item={item}
                onAddToCart={handleAddToCart}
                onClick={handleItemClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type="success"
      />

      {/* Menu Item Detail Modal */}
      {selectedItem && (
        <MenuItemDetail
          item={selectedItem}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
};

export default Menu;
