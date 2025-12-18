import VoucherButton from './VoucherButton';
import RewardsButton from './RewardsButton';
import './ActionButtons.css';

const ActionButtons = ({
  onVoucherClick,
  onRewardsClick,
  voucherCount = 0,
  rewardPoints = null,
  isLoggedIn = false,
  voucherLoading = false,
  rewardsLoading = false,
  voucherDisabled = false,
  rewardsDisabled = false,
  className = ''
}) => {
  return (
    <div className={`action-buttons ${className}`} role="region" aria-label="Vouchers and rewards actions">
      <div className="action-buttons__container">
        <VoucherButton
          onClick={onVoucherClick}
          voucherCount={voucherCount}
          loading={voucherLoading}
          disabled={voucherDisabled}
          className="action-buttons__voucher"
        />
        
        <RewardsButton
          onClick={onRewardsClick}
          rewardPoints={rewardPoints}
          isLoggedIn={isLoggedIn}
          loading={rewardsLoading}
          disabled={rewardsDisabled}
          className="action-buttons__rewards"
        />
      </div>
    </div>
  );
};

export default ActionButtons;