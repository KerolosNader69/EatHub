import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryCard from './CategoryCard';
import { CategoryGridSkeleton } from './SkeletonLoader';
import { getCategories } from '../services/menuService';
import './CategoryGrid.css';

const CategoryGrid = ({ onCategoryClick }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Mouse drag to scroll functionality
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      startXRef.current = e.pageX - container.offsetLeft;
      scrollLeftRef.current = container.scrollLeft;
      container.style.cursor = 'grabbing';
      container.style.userSelect = 'none';
    };

    const handleMouseLeave = () => {
      isDraggingRef.current = false;
      container.style.cursor = 'grab';
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      container.style.cursor = 'grab';
      container.style.userSelect = 'auto';
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startXRef.current) * 2; // Scroll speed multiplier
      container.scrollLeft = scrollLeftRef.current - walk;
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const categoriesData = await getCategories(true); // Force refresh to bypass cache
      setCategories(categoriesData || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    // Call the optional callback prop
    if (onCategoryClick) {
      onCategoryClick(category);
    }
    
    // Navigate to menu page filtered by category using route parameter
    // Convert category name to match the expected format (lowercase with underscores)
    // Handle both spaces and hyphens by converting them to underscores
    const categoryId = category.name.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
    navigate(`/menu/${categoryId}`);
  };

  const handleRetry = () => {
    fetchCategories();
  };

  if (loading) {
    return (
      <div className="category-grid">
        <div 
          className="category-grid-container"
          aria-label="Loading categories" 
          aria-live="polite"
        >
          <CategoryGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-grid">
        <div className="category-error" role="alert">
          <p className="category-error-message">{error}</p>
          <button 
            className="category-retry-button"
            onClick={handleRetry}
            aria-label="Retry loading categories"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="category-grid">
        <div className="category-empty">
          <p>No categories available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-grid">
      <div 
        ref={scrollContainerRef}
        className="category-grid-container"
        role="list"
        aria-label="Food categories"
        style={{ cursor: 'grab' }}
      >
        {categories.map((category) => (
          <div 
            key={category.id || category.name}
            className="category-grid-item"
            role="listitem"
          >
            <CategoryCard
              category={category}
              onClick={handleCategoryClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;