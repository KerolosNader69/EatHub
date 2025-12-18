import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryCard from './CategoryCard';

// Mock the OptimizedImage component
vi.mock('./OptimizedImage', () => ({
  default: ({ src, alt, onError, placeholder, className }) => {
    const handleError = () => {
      if (onError) onError();
    };
    
    return (
      <div data-testid="optimized-image" className={className}>
        <img 
          src={src} 
          alt={alt} 
          onError={handleError}
          data-testid="category-image"
        />
        {placeholder && <div data-testid="image-placeholder">{placeholder}</div>}
      </div>
    );
  }
}));

describe('CategoryCard Component', () => {
  const mockCategory = {
    id: '1',
    name: 'Food',
    displayName: 'Food',
    itemCount: 25,
    icon: '/icons/categories/food.svg'
  };

  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render category card with all information', () => {
    render(<CategoryCard category={mockCategory} onClick={mockOnClick} />);
    
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('25 items')).toBeInTheDocument();
    expect(screen.getByTestId('category-image')).toHaveAttribute('src', '/icons/categories/food.svg');
  });

  it('should render category card without item count when not provided', () => {
    const categoryWithoutCount = { ...mockCategory };
    delete categoryWithoutCount.itemCount;
    
    render(<CategoryCard category={categoryWithoutCount} onClick={mockOnClick} />);
    
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.queryByText(/items/)).not.toBeInTheDocument();
  });

  it('should handle singular item count correctly', () => {
    const categoryWithOneItem = { ...mockCategory, itemCount: 1 };
    
    render(<CategoryCard category={categoryWithOneItem} onClick={mockOnClick} />);
    
    expect(screen.getByText('1 item')).toBeInTheDocument();
  });

  it('should use displayName when available, fallback to name', () => {
    const categoryWithDisplayName = {
      ...mockCategory,
      name: 'health_beauty',
      displayName: 'Health & Beauty'
    };
    
    render(<CategoryCard category={categoryWithDisplayName} onClick={mockOnClick} />);
    
    expect(screen.getByText('Health & Beauty')).toBeInTheDocument();
    expect(screen.queryByText('health_beauty')).not.toBeInTheDocument();
  });

  it('should call onClick when card is clicked', () => {
    render(<CategoryCard category={mockCategory} onClick={mockOnClick} />);
    
    const card = screen.getByRole('button');
    fireEvent.click(card);
    
    expect(mockOnClick).toHaveBeenCalledWith(mockCategory);
  });

  it('should handle keyboard navigation (Enter key)', () => {
    render(<CategoryCard category={mockCategory} onClick={mockOnClick} />);
    
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    
    expect(mockOnClick).toHaveBeenCalledWith(mockCategory);
  });

  it('should handle keyboard navigation (Space key)', () => {
    render(<CategoryCard category={mockCategory} onClick={mockOnClick} />);
    
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: ' ' });
    
    expect(mockOnClick).toHaveBeenCalledWith(mockCategory);
  });

  it('should not trigger onClick for other keys', () => {
    render(<CategoryCard category={mockCategory} onClick={mockOnClick} />);
    
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Tab' });
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('should have proper accessibility attributes', () => {
    render(<CategoryCard category={mockCategory} onClick={mockOnClick} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');
    expect(card).toHaveAttribute('aria-label', 'Browse Food category (25 items)');
  });

  it('should have proper accessibility attributes without item count', () => {
    const categoryWithoutCount = { ...mockCategory };
    delete categoryWithoutCount.itemCount;
    
    render(<CategoryCard category={categoryWithoutCount} onClick={mockOnClick} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', 'Browse Food category');
  });

  it('should show default icon when image fails to load', () => {
    render(<CategoryCard category={mockCategory} onClick={mockOnClick} />);
    
    // Simulate image error
    const image = screen.getByTestId('category-image');
    fireEvent.error(image);
    
    // Should show default SVG icon
    expect(screen.getByRole('button')).toContainHTML('svg');
  });

  it('should use correct icon path for known categories', () => {
    const categories = [
      { name: 'food', expectedIcon: '/icons/categories/food.svg' },
      { name: 'groceries', expectedIcon: '/icons/categories/groceries.svg' },
      { name: 'health', expectedIcon: '/icons/categories/health.svg' },
      { name: 'health & beauty', expectedIcon: '/icons/categories/health.svg' },
      { name: 'gift', expectedIcon: '/icons/categories/gift.svg' },
      { name: 'gift & donate', expectedIcon: '/icons/categories/gift.svg' },
      { name: 'store', expectedIcon: '/icons/categories/store.svg' }
    ];
    
    categories.forEach(({ name, expectedIcon }) => {
      const category = { id: '1', name, displayName: name };
      const { unmount } = render(<CategoryCard category={category} onClick={mockOnClick} />);
      
      expect(screen.getByTestId('category-image')).toHaveAttribute('src', expectedIcon);
      unmount();
    });
  });

  it('should use default icon for unknown categories', () => {
    const unknownCategory = { id: '1', name: 'unknown', displayName: 'Unknown' };
    
    render(<CategoryCard category={unknownCategory} onClick={mockOnClick} />);
    
    expect(screen.getByTestId('category-image')).toHaveAttribute('src', '/icons/categories/default.svg');
  });

  it('should use provided icon over default mapping', () => {
    const categoryWithCustomIcon = {
      ...mockCategory,
      icon: '/custom/icon.svg'
    };
    
    render(<CategoryCard category={categoryWithCustomIcon} onClick={mockOnClick} />);
    
    expect(screen.getByTestId('category-image')).toHaveAttribute('src', '/custom/icon.svg');
  });
});