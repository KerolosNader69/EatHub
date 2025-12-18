import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import CategoryGrid from '../components/CategoryGrid';
import CategoryCard from '../components/CategoryCard';
import ActionButtons from '../components/ActionButtons';
import HomePage from '../pages/HomePage';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock the services
vi.mock('../services/menuService', () => ({
  getCategories: vi.fn().mockResolvedValue([
    { id: '1', name: 'Food', displayName: 'Food', itemCount: 25 },
    { id: '2', name: 'Groceries', displayName: 'Groceries', itemCount: 15 },
    { id: '3', name: 'Health', displayName: 'Health & Beauty', itemCount: 8 }
  ])
}));

vi.mock('../services/voucherService', () => ({
  getAvailableVouchers: vi.fn().mockResolvedValue([
    { id: '1', code: 'SAVE10', title: '10% Off' }
  ])
}));

vi.mock('../services/rewardsService', () => ({
  getRewardsStatus: vi.fn().mockResolvedValue({
    currentPoints: 150,
    totalEarned: 500,
    availableRewards: []
  })
}));

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 'user123', name: 'John Doe' }
  })
}));

// Mock OptimizedImage
vi.mock('../components/OptimizedImage', () => ({
  default: ({ src, alt, className }) => (
    <img src={src} alt={alt} className={className} />
  )
}));

// Mock other components for HomePage testing
vi.mock('../components/Navigation', () => ({
  default: () => <nav role="navigation" aria-label="Main navigation">Navigation</nav>
}));

vi.mock('../components/FeaturedItems', () => ({
  default: () => (
    <section aria-labelledby="featured-heading">
      <h2 id="featured-heading">Featured Items</h2>
      <div>Featured items content</div>
    </section>
  )
}));

vi.mock('../components/LazyVoucherModal', () => ({
  default: ({ isOpen }) => isOpen ? <div role="dialog" aria-label="Voucher modal">Modal</div> : null
}));

vi.mock('../components/LazyRewardsModal', () => ({
  default: ({ isOpen }) => isOpen ? <div role="dialog" aria-label="Rewards modal">Modal</div> : null
}));

vi.mock('../components/ErrorBoundary', () => ({
  default: ({ children }) => <div>{children}</div>
}));

vi.mock('../components/SkeletonLoader', () => ({
  CategoryGridSkeleton: ({ count }) => (
    <div role="status" aria-label={`Loading ${count} categories`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} aria-hidden="true">Loading...</div>
      ))}
    </div>
  )
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Home Page Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('CategoryGrid Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithRouter(<CategoryGrid />);
      
      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels and roles', async () => {
      renderWithRouter(<CategoryGrid />);
      
      await waitFor(() => {
        const grid = screen.getByRole('grid');
        expect(grid).toHaveAttribute('aria-label', 'Food categories');
        
        const gridCells = screen.getAllByRole('gridcell');
        expect(gridCells.length).toBeGreaterThan(0);
        
        // Check grid positioning
        expect(gridCells[0]).toHaveAttribute('aria-rowindex');
        expect(gridCells[0]).toHaveAttribute('aria-colindex');
      });
    });

    it('should announce loading state to screen readers', () => {
      renderWithRouter(<CategoryGrid />);
      
      const loadingElement = screen.getByLabelText('Loading categories');
      expect(loadingElement).toHaveAttribute('aria-live', 'polite');
    });

    it('should provide proper error messaging', async () => {
      const { getCategories } = await import('../services/menuService');
      getCategories.mockRejectedValueOnce(new Error('Network error'));
      
      renderWithRouter(<CategoryGrid />);
      
      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent('Failed to load categories. Please try again.');
        
        const retryButton = screen.getByRole('button', { name: 'Retry loading categories' });
        expect(retryButton).toBeInTheDocument();
      });
    });
  });

  describe('CategoryCard Accessibility', () => {
    const mockCategory = {
      id: '1',
      name: 'Food',
      displayName: 'Food',
      itemCount: 25
    };

    it('should have no accessibility violations', async () => {
      const { container } = render(
        <CategoryCard category={mockCategory} onClick={vi.fn()} />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper button semantics', () => {
      render(<CategoryCard category={mockCategory} onClick={vi.fn()} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '0');
      expect(button).toHaveAttribute('aria-label', 'Browse Food category (25 items)');
    });

    it('should handle keyboard navigation', () => {
      const mockOnClick = vi.fn();
      render(<CategoryCard category={mockCategory} onClick={mockOnClick} />);
      
      const button = screen.getByRole('button');
      
      // Test Enter key
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(mockOnClick).toHaveBeenCalledWith(mockCategory);
      
      mockOnClick.mockClear();
      
      // Test Space key
      fireEvent.keyDown(button, { key: ' ' });
      expect(mockOnClick).toHaveBeenCalledWith(mockCategory);
    });

    it('should have proper focus management', () => {
      render(<CategoryCard category={mockCategory} onClick={vi.fn()} />);
      
      const button = screen.getByRole('button');
      
      fireEvent.focus(button);
      expect(button).toHaveFocus();
      
      fireEvent.blur(button);
      expect(button).not.toHaveFocus();
    });

    it('should hide decorative elements from screen readers', () => {
      render(<CategoryCard category={mockCategory} onClick={vi.fn()} />);
      
      const iconContainer = document.querySelector('.category-icon-container');
      expect(iconContainer).toHaveAttribute('aria-hidden', 'true');
      
      const itemCount = screen.getByText('25 items');
      expect(itemCount).toHaveAttribute('aria-hidden', 'true');
    });

    it('should provide accessible labels without item count', () => {
      const categoryWithoutCount = { ...mockCategory };
      delete categoryWithoutCount.itemCount;
      
      render(<CategoryCard category={categoryWithoutCount} onClick={vi.fn()} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Browse Food category');
    });
  });

  describe('ActionButtons Accessibility', () => {
    const defaultProps = {
      onVoucherClick: vi.fn(),
      onRewardsClick: vi.fn(),
      voucherCount: 3,
      rewardPoints: 150,
      isLoggedIn: true
    };

    it('should have no accessibility violations', async () => {
      const { container } = render(<ActionButtons {...defaultProps} />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper region semantics', () => {
      render(<ActionButtons {...defaultProps} />);
      
      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-label', 'Vouchers and rewards actions');
    });

    it('should maintain focus order', () => {
      render(<ActionButtons {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      
      // Test tab order
      buttons[0].focus();
      expect(buttons[0]).toHaveFocus();
      
      // Simulate tab to next button
      fireEvent.keyDown(buttons[0], { key: 'Tab' });
      buttons[1].focus();
      expect(buttons[1]).toHaveFocus();
    });
  });

  describe('HomePage Overall Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithRouter(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper document structure', async () => {
      renderWithRouter(<HomePage />);
      
      await waitFor(() => {
        // Skip link
        expect(screen.getByText('Skip to main content')).toBeInTheDocument();
        
        // Main content area
        const main = screen.getByRole('main');
        expect(main).toHaveAttribute('id', 'main-content');
        
        // Proper heading hierarchy
        const h1 = screen.getByRole('heading', { level: 1 });
        expect(h1).toHaveTextContent('What are you craving today?');
      });
    });

    it('should have proper landmark structure', async () => {
      renderWithRouter(<HomePage />);
      
      await waitFor(() => {
        // Navigation landmark
        expect(screen.getByRole('navigation')).toBeInTheDocument();
        
        // Main landmark
        expect(screen.getByRole('main')).toBeInTheDocument();
        
        // Regions for different sections
        expect(screen.getByLabelText('Vouchers and rewards actions')).toBeInTheDocument();
      });
    });

    it('should handle focus management for modals', async () => {
      renderWithRouter(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
      
      // Open voucher modal
      const voucherButton = screen.getByLabelText(/Vouchers/);
      fireEvent.click(voucherButton);
      
      await waitFor(() => {
        const modal = screen.getByRole('dialog');
        expect(modal).toBeInTheDocument();
        expect(modal).toHaveAttribute('aria-label', 'Voucher modal');
      });
    });

    it('should announce dynamic content changes', async () => {
      renderWithRouter(<HomePage />);
      
      // Loading state should be announced
      const loadingElement = screen.getByText('Loading your personalized experience...');
      const statusElement = loadingElement.closest('[role="status"]');
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
    });

    it('should provide proper section labeling', async () => {
      renderWithRouter(<HomePage />);
      
      await waitFor(() => {
        // Categories section
        const categoriesSection = screen.getByLabelText('What are you craving today?');
        expect(categoriesSection).toBeInTheDocument();
        
        // Actions section
        const actionsSection = screen.getByLabelText('Vouchers and rewards');
        expect(actionsSection).toBeInTheDocument();
      });
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should maintain focus indicators', () => {
      const mockCategory = { id: '1', name: 'Food', displayName: 'Food' };
      render(<CategoryCard category={mockCategory} onClick={vi.fn()} />);
      
      const button = screen.getByRole('button');
      
      // Focus should be visible
      fireEvent.focus(button);
      expect(button).toHaveFocus();
      
      // Should have focus styles applied via CSS
      expect(button).toHaveClass('category-card');
    });

    it('should not rely solely on color for information', () => {
      render(
        <ActionButtons 
          onVoucherClick={vi.fn()}
          onRewardsClick={vi.fn()}
          voucherCount={5}
          rewardPoints={200}
          isLoggedIn={true}
        />
      );
      
      // Information should be conveyed through text, not just color
      expect(screen.getByText(/Vouchers/)).toBeInTheDocument();
      expect(screen.getByText(/Rewards/)).toBeInTheDocument();
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('should provide meaningful text alternatives', () => {
      const mockCategory = { 
        id: '1', 
        name: 'Food', 
        displayName: 'Food',
        itemCount: 25,
        icon: '/icons/food.svg'
      };
      
      render(<CategoryCard category={mockCategory} onClick={vi.fn()} />);
      
      // Image should have empty alt text (decorative)
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', '');
      
      // Button should have descriptive label
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Browse Food category (25 items)');
    });

    it('should handle loading states accessibly', () => {
      renderWithRouter(<CategoryGrid />);
      
      const loadingRegion = screen.getByLabelText('Loading categories');
      expect(loadingRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('should provide context for interactive elements', () => {
      render(
        <ActionButtons 
          onVoucherClick={vi.fn()}
          onRewardsClick={vi.fn()}
          voucherCount={3}
          rewardPoints={150}
          isLoggedIn={true}
        />
      );
      
      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-label', 'Vouchers and rewards actions');
    });
  });
});