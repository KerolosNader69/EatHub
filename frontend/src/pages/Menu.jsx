import { useState, useEffect } from 'react';
import { getMenuItems } from '../services/menuService';
import MenuItemCard from '../components/MenuItemCard';
import MenuItemDetail from '../components/MenuItemDetail';
import ErrorMessage from '../components/ErrorMessage';
import { MenuGridSkeleton } from '../components/SkeletonLoader';
import { useCart } from '../context/CartContext';
import './Menu.css';

const CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'appetizers', label: 'Appetizers' },
  { id: 'main_courses', label: 'Main Courses' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'beverages', label: 'Beverages' }
];

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await getMenuItems();
      setMenuItems(items);
    } catch (err) {
      setError('Failed to load menu items. Please try again later.');
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const handleAddToCart = (item, quantity = 1) => {
    addItem({
      id: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity
    });
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <div className="menu-page">
        <div className="container">
          <h1 className="menu-title">Our Menu</h1>
          <div className="category-tabs">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                className="category-tab"
                disabled
              >
                {category.label}
              </button>
            ))}
          </div>
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
        <h1 className="menu-title">Our Menu</h1>
        
        {/* Category Tabs */}
        <div className="category-tabs">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="no-items">
            <p>No items available in this category.</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filteredItems.map(item => (
              <MenuItemCard
                key={item._id}
                item={item}
                onAddToCart={handleAddToCart}
                onClick={handleItemClick}
              />
            ))}
          </div>
        )}
      </div>

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
