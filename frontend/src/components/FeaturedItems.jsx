import { useState, useEffect } from 'react';
import { getFeaturedItems } from '../services/menuService';
import FeaturedItemCard from './FeaturedItemCard';
import MenuItemDetail from './MenuItemDetail';
import { FeaturedItemsGridSkeleton } from './SkeletonLoader';
import { useCart } from '../context/CartContext';
import './FeaturedItems.css';

const FeaturedItems = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const items = await getFeaturedItems();
        // Limit to 4-6 items for performance as per requirements
        const limitedItems = items.slice(0, 6);
        setFeaturedItems(limitedItems);
      } catch (err) {
        console.error('Error fetching featured items:', err);
        setError('Failed to load featured items');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const handleAddToCart = (item, quantity = 1) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity
    });
  };

  const handleQuickAddToCart = (item) => {
    handleAddToCart(item, 1);
  };

  if (loading) {
    return (
      <section className="featured-items" aria-labelledby="featured-heading">
        <div className="featured-items-container">
          <h2 id="featured-heading" className="featured-items-title">Featured Items</h2>
          <div aria-label="Loading featured items" aria-live="polite">
            <FeaturedItemsGridSkeleton count={4} />
          </div>
        </div>
      </section>
    );
  }

  const handleRetry = () => {
    const fetchFeaturedItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const items = await getFeaturedItems();
        // Limit to 4-6 items for performance as per requirements
        const limitedItems = items.slice(0, 6);
        setFeaturedItems(limitedItems);
      } catch (err) {
        console.error('Error fetching featured items:', err);
        setError('Failed to load featured items');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  };

  if (error) {
    return (
      <section className="featured-items" aria-labelledby="featured-heading">
        <div className="featured-items-container">
          <h2 id="featured-heading" className="featured-items-title">Featured Items</h2>
          <div className="featured-items-error" role="alert">
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={handleRetry}
              aria-label="Retry loading featured items"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredItems.length) {
    return null; // Hide section if no featured items
  }

  return (
    <section className="featured-items" aria-labelledby="featured-heading">
      <div className="featured-items-container">
        <h2 id="featured-heading" className="featured-items-title">Featured Items</h2>
        <div 
          className="featured-items-grid"
          role="list"
          aria-label={`${featuredItems.length} featured menu items`}
        >
          {featuredItems.map((item) => (
            <div key={item.id} role="listitem">
              <FeaturedItemCard
                item={item}
                onItemClick={handleItemClick}
                onAddToCart={handleQuickAddToCart}
              />
            </div>
          ))}
        </div>
      </div>

      {selectedItem && (
        <MenuItemDetail
          item={selectedItem}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCart}
        />
      )}
    </section>
  );
};

export default FeaturedItems;