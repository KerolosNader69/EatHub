import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ActionButtons from './ActionButtons';

// Mock the button components
vi.mock('./VoucherButton', () => ({
  default: ({ onClick, voucherCount, loading, disabled, className }) => (
    <button
      data-testid="voucher-button"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      Vouchers {loading ? '(Loading...)' : `(${voucherCount})`}
    </button>
  )
}));

vi.mock('./RewardsButton', () => ({
  default: ({ onClick, rewardPoints, isLoggedIn, loading, disabled, className }) => (
    <button
      data-testid="rewards-button"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      Rewards {loading ? '(Loading...)' : isLoggedIn ? `(${rewardPoints} pts)` : ''}
    </button>
  )
}));

describe('ActionButtons Component', () => {
  const mockOnVoucherClick = vi.fn();
  const mockOnRewardsClick = vi.fn();

  const defaultProps = {
    onVoucherClick: mockOnVoucherClick,
    onRewardsClick: mockOnRewardsClick,
    voucherCount: 3,
    rewardPoints: 150,
    isLoggedIn: true,
    voucherLoading: false,
    rewardsLoading: false,
    voucherDisabled: false,
    rewardsDisabled: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render both voucher and rewards buttons', () => {
    render(<ActionButtons {...defaultProps} />);
    
    expect(screen.getByTestId('voucher-button')).toBeInTheDocument();
    expect(screen.getByTestId('rewards-button')).toBeInTheDocument();
  });

  it('should pass correct props to VoucherButton', () => {
    render(<ActionButtons {...defaultProps} />);
    
    const voucherButton = screen.getByTestId('voucher-button');
    expect(voucherButton).toHaveTextContent('Vouchers (3)');
    expect(voucherButton).not.toBeDisabled();
    expect(voucherButton).toHaveClass('action-buttons__voucher');
  });

  it('should pass correct props to RewardsButton', () => {
    render(<ActionButtons {...defaultProps} />);
    
    const rewardsButton = screen.getByTestId('rewards-button');
    expect(rewardsButton).toHaveTextContent('Rewards (150 pts)');
    expect(rewardsButton).not.toBeDisabled();
    expect(rewardsButton).toHaveClass('action-buttons__rewards');
  });

  it('should handle voucher button click', () => {
    render(<ActionButtons {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('voucher-button'));
    
    expect(mockOnVoucherClick).toHaveBeenCalledTimes(1);
  });

  it('should handle rewards button click', () => {
    render(<ActionButtons {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('rewards-button'));
    
    expect(mockOnRewardsClick).toHaveBeenCalledTimes(1);
  });

  it('should show loading states correctly', () => {
    render(
      <ActionButtons 
        {...defaultProps} 
        voucherLoading={true}
        rewardsLoading={true}
      />
    );
    
    expect(screen.getByTestId('voucher-button')).toHaveTextContent('Vouchers (Loading...)');
    expect(screen.getByTestId('rewards-button')).toHaveTextContent('Rewards (Loading...)');
  });

  it('should handle disabled states correctly', () => {
    render(
      <ActionButtons 
        {...defaultProps} 
        voucherDisabled={true}
        rewardsDisabled={true}
      />
    );
    
    expect(screen.getByTestId('voucher-button')).toBeDisabled();
    expect(screen.getByTestId('rewards-button')).toBeDisabled();
  });

  it('should handle logged out state for rewards', () => {
    render(
      <ActionButtons 
        {...defaultProps} 
        isLoggedIn={false}
        rewardPoints={null}
      />
    );
    
    const rewardsButton = screen.getByTestId('rewards-button');
    expect(rewardsButton).toHaveTextContent('Rewards ');
    expect(rewardsButton).not.toHaveTextContent('pts');
  });

  it('should handle zero voucher count', () => {
    render(<ActionButtons {...defaultProps} voucherCount={0} />);
    
    expect(screen.getByTestId('voucher-button')).toHaveTextContent('Vouchers (0)');
  });

  it('should handle zero reward points', () => {
    render(<ActionButtons {...defaultProps} rewardPoints={0} />);
    
    expect(screen.getByTestId('rewards-button')).toHaveTextContent('Rewards (0 pts)');
  });

  it('should apply custom className', () => {
    render(<ActionButtons {...defaultProps} className="custom-class" />);
    
    const container = screen.getByRole('region');
    expect(container).toHaveClass('action-buttons', 'custom-class');
  });

  it('should have proper accessibility attributes', () => {
    render(<ActionButtons {...defaultProps} />);
    
    const container = screen.getByRole('region');
    expect(container).toHaveAttribute('aria-label', 'Vouchers and rewards actions');
  });

  it('should use default values when props are not provided', () => {
    render(
      <ActionButtons 
        onVoucherClick={mockOnVoucherClick}
        onRewardsClick={mockOnRewardsClick}
      />
    );
    
    expect(screen.getByTestId('voucher-button')).toHaveTextContent('Vouchers (0)');
    expect(screen.getByTestId('rewards-button')).toHaveTextContent('Rewards ');
    expect(screen.getByTestId('voucher-button')).not.toBeDisabled();
    expect(screen.getByTestId('rewards-button')).not.toBeDisabled();
  });

  it('should handle null reward points correctly', () => {
    render(
      <ActionButtons 
        {...defaultProps} 
        rewardPoints={null}
        isLoggedIn={true}
      />
    );
    
    const rewardsButton = screen.getByTestId('rewards-button');
    expect(rewardsButton).toHaveTextContent('Rewards (null pts)');
  });
});