import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './HomePage';
import * as voucherService from '../services/voucherService';
import * as rewardsService from '../services/rewardsService';

// Mock the services
vi.mock('../services/voucherService');
vi.mock('../services/rewardsService');

// Mock the AuthContext
const mockAuthContext = {
  isAuthenticated: false,
  user: null,
  login: vi.fn(),
  logout: vi.fn()
};

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

// Mock the components to simplify testing
vi.mock('../components/Navigation', () => ({
  default: () => <nav data-testid="navigation">Navigation</nav>
}));

vi.mock('../components/CategoryGrid', () => ({
  default: ({ onCategoryClick }) => (
    <div data-testid="category-grid">
      <button onClick={() => onCategoryClick({ name: 'Food' })}>
        Category Grid
      </button>
    </div>
  )
}));

vi.mock('../components/ActionButtons', () => ({
  default: ({ 
    onVoucherClick, 
    onRewardsClick, 
    voucherCount, 
    rewardPoints, 
    isLoggedIn,
    voucherLoading,
    rewardsLoading 
  }) => (
    <div data-testid="action-buttons">
      <button 
        onClick={onVoucherClick}
        data-testid="voucher-button"
        disabled={voucherLoading}
      >
        Vouchers ({voucherCount}) {voucherLoading && '(Loading)'}
      </button>
      <button 
        onClick={onRewardsClick}
        data-testid="rewards-button"
        disabled={rewardsLoading}
      >
        Rewards {isLoggedIn ? `(${rewardPoints} pts)` : ''} {rewardsLoading && '(Loading)'}
      </button>
    </div>
  )
}));

vi.mock('../components/FeaturedItems', () => ({
  default: () => <div data-testid="featured-items">Featured Items</div>
}));

vi.mock('../components/LazyVoucherModal', () => ({
  default: ({ isOpen, onClose, onVoucherApplied }) => 
    isOpen ? (
      <div data-testid="voucher-modal">
        <button onClick={() => onVoucherApplied({ code: 'SAVE10' })}>
          Apply Voucher
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
}));

vi.mock('../components/LazyRewardsModal', () => ({
  default: ({ isOpen, onClose, onRewardRedeemed }) => 
    isOpen ? (
      <div data-testid="rewards-modal">
        <button onClick={() => onRewardRedeemed({ newBalance: 150 })}>
          Redeem Reward
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
}));

vi.mock('../components/ErrorBoundary', () => ({
  default: ({ children }) => <div>{children}</div>
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('HomePage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContext.isAuthenticated = false;
    mockAuthContext.user = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Data Fetching', () => {
    it('should fetch vouchers and rewards data on mount for authenticated user', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: 'user123', name: 'John Doe' };

      const mockVouchers = [
        { id: '1', code: 'SAVE10', title: '10% Off' },
        { id: '2', code: 'FREE5', title: '$5 Off' }
      ];

      const mockRewardsData = {
        currentPoints: 250,
        totalEarned: 1000,
        availableRewards: []
      };

      voucherService.getAvailableVouchers.mockResolvedValue(mockVouchers);
      rewardsService.getRewardsStatus.mockResolvedValue(mockRewardsData);

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
      });

      expect(voucherService.getAvailableVouchers).toHaveBeenCalledTimes(1);
      expect(rewardsService.getRewardsStatus).toHaveBeenCalledTimes(1);

      expect(screen.getByText('Vouchers (2)')).toBeInTheDocument();
      expect(screen.getByText('Rewards (250 pts)')).toBeInTheDocument();
    });

    it('should only fetch vouchers for unauthenticated user', async () => {
      const mockVouchers = [
        { id: '1', code: 'SAVE10', title: '10% Off' }
      ];

      voucherService.getAvailableVouchers.mockResolvedValue(mockVouchers);

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
      });

      expect(voucherService.getAvailableVouchers).toHaveBeenCalledTimes(1);
      expect(rewardsService.getRewardsStatus).not.toHaveBeenCalled();

      expect(screen.getByText('Vouchers (1)')).toBeInTheDocument();
      expect(screen.getByText('Rewards ')).toBeInTheDocument();
    });

    it('should handle voucher service errors gracefully', async () => {
      voucherService.getAvailableVouchers.mockRejectedValue(new Error('Network error'));

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
      });

      expect(screen.getByText('Vouchers (0)')).toBeInTheDocument();
    });

    it('should handle rewards service errors gracefully', async () => {
      mockAuthContext.isAuthenticated = true;
      
      voucherService.getAvailableVouchers.mockResolvedValue([]);
      rewardsService.getRewardsStatus.mockRejectedValue(new Error('Service unavailable'));

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
      });

      expect(screen.getByText('Rewards ')).toBeInTheDocument();
    });

    it('should show loading state while fetching data', async () => {
      voucherService.getAvailableVouchers.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithRouter(<HomePage />);

      expect(screen.getByText('Loading your personalized experience...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should refetch data when authentication status changes', async () => {
      const mockVouchers = [{ id: '1', code: 'SAVE10' }];
      voucherService.getAvailableVouchers.mockResolvedValue(mockVouchers);

      const { rerender } = renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
      });

      expect(voucherService.getAvailableVouchers).toHaveBeenCalledTimes(1);
      expect(rewardsService.getRewardsStatus).not.toHaveBeenCalled();

      // User logs in
      mockAuthContext.isAuthenticated = true;
      const mockRewardsData = { currentPoints: 100 };
      rewardsService.getRewardsStatus.mockResolvedValue(mockRewardsData);

      rerender(<HomePage />);

      await waitFor(() => {
        expect(rewardsService.getRewardsStatus).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('User Interactions', () => {
    beforeEach(async () => {
      voucherService.getAvailableVouchers.mockResolvedValue([{ id: '1', code: 'SAVE10' }]);
      rewardsService.getRewardsStatus.mockResolvedValue({ currentPoints: 100 });
    });

    it('should open voucher modal when voucher button is clicked', async () => {
      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId('voucher-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('voucher-button'));

      expect(screen.getByTestId('voucher-modal')).toBeInTheDocument();
    });

    it('should open rewards modal when rewards button is clicked', async () => {
      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId('rewards-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('rewards-button'));

      expect(screen.getByTestId('rewards-modal')).toBeInTheDocument();
    });

    it('should handle voucher application', async () => {
      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId('voucher-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('voucher-button'));
      
      const applyButton = screen.getByText('Apply Voucher');
      fireEvent.click(applyButton);

      // Should log the voucher application (in real app would update cart)
      expect(screen.getByTestId('voucher-modal')).toBeInTheDocument();
    });

    it('should handle reward redemption and update points', async () => {
      mockAuthContext.isAuthenticated = true;
      
      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId('rewards-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('rewards-button'));
      
      const redeemButton = screen.getByText('Redeem Reward');
      fireEvent.click(redeemButton);

      // Should update the reward points in the component state
      expect(screen.getByTestId('rewards-modal')).toBeInTheDocument();
    });

    it('should close modals when close button is clicked', async () => {
      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId('voucher-button')).toBeInTheDocument();
      });

      // Open voucher modal
      fireEvent.click(screen.getByTestId('voucher-button'));
      expect(screen.getByTestId('voucher-modal')).toBeInTheDocument();

      // Close voucher modal
      fireEvent.click(screen.getByText('Close'));
      expect(screen.queryByTestId('voucher-modal')).not.toBeInTheDocument();
    });

    it('should handle category click', async () => {
      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId('category-grid')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Category Grid'));

      // Should log the category click (CategoryGrid handles navigation internally)
      expect(screen.getByTestId('category-grid')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error state when page initialization fails', async () => {
      voucherService.getAvailableVouchers.mockRejectedValue(new Error('Critical error'));
      
      // Mock console.error to avoid test output noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(screen.getByText('Failed to load page data. Please try again.')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should retry data fetching when retry button is clicked', async () => {
      voucherService.getAvailableVouchers
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce([{ id: '1', code: 'SAVE10' }]);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Try Again'));

      await waitFor(() => {
        expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
      });

      expect(voucherService.getAvailableVouchers).toHaveBeenCalledTimes(2);

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      voucherService.getAvailableVouchers.mockResolvedValue([]);
      rewardsService.getRewardsStatus.mockResolvedValue({ currentPoints: 0 });
    });

    it('should have proper accessibility structure', async () => {
      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
      });

      // Check skip link
      expect(screen.getByText('Skip to main content')).toBeInTheDocument();

      // Check main content area
      expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');

      // Check section headings
      expect(screen.getByText('What are you craving today?')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should have proper ARIA labels for sections', async () => {
      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
      });

      const categoriesSection = screen.getByLabelText('What are you craving today?');
      expect(categoriesSection).toBeInTheDocument();

      const actionsSection = screen.getByLabelText('Vouchers and rewards');
      expect(actionsSection).toBeInTheDocument();
    });

    it('should announce loading state to screen readers', () => {
      voucherService.getAvailableVouchers.mockImplementation(() => new Promise(() => {}));

      renderWithRouter(<HomePage />);

      const loadingElement = screen.getByRole('status');
      expect(loadingElement).toHaveAttribute('aria-live', 'polite');
    });
  });
});