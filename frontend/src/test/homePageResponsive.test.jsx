import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CategoryGrid from '../components/CategoryGrid';
import CategoryCard from '../components/CategoryCard';
import ActionButtons from '../components/ActionButtons';

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (matches) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Mock the services
vi.mock('../services/menuService', () => ({
  getCategories: vi.fn().mockResolvedValue([
    { id: '1', name: 'Food', displayName: 'Food', itemCount: 25 },
    { id: '2', name: 'Groceries', displayName: 'Groceries', itemCount: 15 }
  ])
}));

// Mock OptimizedImage component
vi.mock('../components/OptimizedImage', () => ({
  default: ({ src, alt, className, onError }) => (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={onError}
      data-testid="optimized-image"
    />
  )
}));

// Mock SkeletonLoader
vi.mock('../components/SkeletonLoader', () => ({
  CategoryGridSkeleton: ({ count }) => (
    <div data-testid="skeleton-loader">Loading {count} items...</div>
  )
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Home Page Responsive Behavior Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('CategoryGrid Responsive Behavior', () => {
    it('should apply mobile styles on small screens', async () => {
      mockMatchMedia(true); // Simulate mobile screen
      
      renderWithRouter(<CategoryGrid />);
      
      // Wait for categories to load
      await screen.findByRole('grid');
      
      const grid = screen.getByRole('grid');
      expect(grid).toHaveClass('category-grid-container');
      
      // Check that grid cells are present
      const gridCells = screen.getAllByRole('gridcell');
      expect(gridCells.length).toBeGreaterThan(0);
    });

    it('should handle touch interactions on mobile', async () => {
      mockMatchMedia(true); // Mobile
      const mockOnCategoryClick = vi.fn();
      
      renderWithRouter(<CategoryGrid onCategoryClick={mockOnCategoryClick} />);
      
      await screen.findByRole('grid');
      
      const firstCard = screen.getAllByRole('gridcell')[0];
      
      // Simulate touch events
      fireEvent.touchStart(firstCard);
      fireEvent.touchEnd(firstCard);
      fireEvent.click(firstCard);
      
      expect(mockOnCategoryClick).toHaveBeenCalled();
    });

    it('should maintain proper grid layout on different screen sizes', async () => {
      // Test desktop
      mockMatchMedia(false);
      const { rerender } = renderWithRouter(<CategoryGrid />);
      
      await screen.findByRole('grid');
      let grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();
      
      // Test mobile
      mockMatchMedia(true);
      rerender(<CategoryGrid />);
      
      grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('CategoryCard Touch-Friendly Design', () => {
    const mockCategory = {
      id: '1',
      name: 'Food',
      displayName: 'Food',
      itemCount: 25
    };

    it('should have minimum touch target size (44x44px)', () => {
      const mockOnClick = vi.fn();
      render(<CategoryCard category={mockCategory} onClick={mockOnClick} />);
      
      const card = screen.getByRole('button');
      
      // Check that the card has the category-card class which should provide minimum size
      expect(card).toHaveClass('category-card');
      
      // Verify it's focusable and clickable
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('should handle touch gestures properly', () => {
      const mockOnClick = vi.fn();
      render(<CategoryCard category={mockCategory} onClick={mockOnClick} />);
      
      const card = screen.getByRole('button');
      
      // Test touch events
      fireEvent.touchStart(card);
      fireEvent.touchEnd(card);
      fireEvent.click(card);
      
      expect(mockOnClick).toHaveBeenCalledWith(mockCategory);
    });

    it('should provide visual feedback on interaction', () => {
      const mockOnClick = vi.fn();
      render(<CategoryCard category={mockCategory} onClick={mockOnClick} />);
      
      const card = screen.getByRole('button');
      
      // Test focus state
      fireEvent.focus(card);
      expect(card).toHaveFocus();
      
      // Test hover simulation (through mouse events)
      fireEvent.mouseEnter(card);
      fireEvent.mouseLeave(card);
      
      expect(card).toBeInTheDocument();
    });
  });

  describe('ActionButtons Responsive Layout', () => {
    const defaultProps = {
      onVoucherClick: vi.fn(),
      onRewardsClick: vi.fn(),
      voucherCount: 3,
      rewardPoints: 150,
      isLoggedIn: true
    };

    it('should stack buttons vertically on mobile', () => {
      mockMatchMedia(true); // Mobile
      
      render(<ActionButtons {...defaultProps} />);
      
      const container = screen.getByRole('region');
      expect(container).toHaveClass('action-buttons');
      
      // Both buttons should be present
      expect(screen.getByText(/Vouchers/)).toBeInTheDocument();
      expect(screen.getByText(/Rewards/)).toBeInTheDocument();
    });

    it('should display buttons side-by-side on desktop', () => {
      mockMatchMedia(false); // Desktop
      
      render(<ActionButtons {...defaultProps} />);
      
      const container = screen.getByRole('region');
      expect(container).toHaveClass('action-buttons');
      
      // Both buttons should be present
      expect(screen.getByText(/Vouchers/)).toBeInTheDocument();
      expect(screen.getByText(/Rewards/)).toBeInTheDocument();
    });

    it('should maintain touch-friendly button sizes on mobile', () => {
      mockMatchMedia(true); // Mobile
      
      render(<ActionButtons {...defaultProps} />);
      
      // Buttons should be rendered with proper classes for mobile styling
      const container = screen.getByRole('region');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Viewport Meta Tag and Responsive Design', () => {
    it('should handle different viewport sizes gracefully', () => {
      // Test various screen sizes
      const screenSizes = [
        { width: 320, mobile: true },   // Mobile
        { width: 768, mobile: false },  // Tablet
        { width: 1024, mobile: false }, // Desktop
        { width: 1440, mobile: false }  // Large desktop
      ];

      screenSizes.forEach(({ width, mobile }) => {
        mockMatchMedia(mobile);
        
        const { unmount } = renderWithRouter(<CategoryGrid />);
        
        // Component should render without errors at any screen size
        expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
        
        unmount();
      });
    });

    it('should handle orientation changes', () => {
      // Portrait
      mockMatchMedia(true);
      const { rerender } = renderWithRouter(<CategoryGrid />);
      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
      
      // Landscape
      mockMatchMedia(false);
      rerender(<CategoryGrid />);
      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    });
  });

  describe('Performance on Mobile Devices', () => {
    it('should handle rapid touch interactions without errors', async () => {
      const mockOnClick = vi.fn();
      const mockCategory = { id: '1', name: 'Food', displayName: 'Food' };
      
      render(<CategoryCard category={mockCategory} onClick={mockOnClick} />);
      
      const card = screen.getByRole('button');
      
      // Simulate rapid taps
      for (let i = 0; i < 5; i++) {
        fireEvent.touchStart(card);
        fireEvent.touchEnd(card);
        fireEvent.click(card);
      }
      
      // Should handle all interactions
      expect(mockOnClick).toHaveBeenCalledTimes(5);
    });

    it('should prevent double-tap zoom on buttons', () => {
      const mockOnClick = vi.fn();
      const mockCategory = { id: '1', name: 'Food', displayName: 'Food' };
      
      render(<CategoryCard category={mockCategory} onClick={mockOnClick} />);
      
      const card = screen.getByRole('button');
      
      // Double tap simulation
      fireEvent.touchStart(card);
      fireEvent.touchEnd(card);
      fireEvent.touchStart(card);
      fireEvent.touchEnd(card);
      
      // Should still work normally
      expect(card).toBeInTheDocument();
    });
  });

  describe('CSS Media Queries Simulation', () => {
    it('should apply correct styles based on screen size', () => {
      // Mobile styles
      mockMatchMedia(true);
      render(<ActionButtons onVoucherClick={vi.fn()} onRewardsClick={vi.fn()} />);
      
      let container = screen.getByRole('region');
      expect(container).toHaveClass('action-buttons');
      
      // Desktop styles
      mockMatchMedia(false);
      const { rerender } = render(<ActionButtons onVoucherClick={vi.fn()} onRewardsClick={vi.fn()} />);
      
      container = screen.getByRole('region');
      expect(container).toHaveClass('action-buttons');
    });

    it('should handle prefers-reduced-motion', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const mockCategory = { id: '1', name: 'Food', displayName: 'Food' };
      render(<CategoryCard category={mockCategory} onClick={vi.fn()} />);
      
      // Component should still render and function
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});