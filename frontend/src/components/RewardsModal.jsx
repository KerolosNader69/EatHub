import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRewardsStatus, redeemReward } from '../services/rewardsService';
import './RewardsModal.css';

const RewardsModal = ({ isOpen, onClose, onRewardRedeemed }) => {
  const { user, isAuthenticated } = useAuth();
  const [rewardsData, setRewardsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redeemingReward, setRedeemingReward] = useState('');
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRewardsStatus();
    }
  }, [isOpen, isAuthenticated]);

  const fetchRewardsStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getRewardsStatus();
      setRewardsData(data);
    } catch (err) {
      console.error('Error fetching rewards status:', err);
      setError(err.message || 'Failed to load rewards data');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemReward = async (reward) => {
    if (!isAuthenticated) {
      setError('Please log in to redeem rewards');
      return;
    }

    if (rewardsData.currentPoints < reward.pointsCost) {
      setError(`Insufficient points. You need ${reward.pointsCost} points but only have ${rewardsData.currentPoints}.`);
      return;
    }

    setRedeemingReward(reward.id);
    setError('');
    
    try {
      const result = await redeemReward(reward.id, reward.pointsCost);
      
      if (result.success) {
        // Update local rewards data
        setRewardsData(prev => ({
          ...prev,
          currentPoints: result.newBalance
        }));
        
        // Notify parent component
        if (onRewardRedeemed) {
          onRewardRedeemed(result);
        }
        
        // Show success message briefly then close
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(result.message || 'Failed to redeem reward');
      }
    } catch (err) {
      console.error('Error redeeming reward:', err);
      setError(err.message || 'Failed to redeem reward');
    } finally {
      setRedeemingReward('');
    }
  };

  const getRewardTypeIcon = (rewardType) => {
    switch (rewardType) {
      case 'discount':
        return '💰';
      case 'free_item':
        return '🎁';
      case 'upgrade':
        return '⭐';
      default:
        return '🏆';
    }
  };

  const formatRewardDescription = (reward) => {
    switch (reward.rewardType) {
      case 'discount':
        return `Get ${reward.discountValue || '10'}% off your next order`;
      case 'free_item':
        return `Get a free ${reward.itemName || 'item'} with your order`;
      case 'upgrade':
        return `Upgrade your ${reward.upgradeType || 'order'} for free`;
      default:
        return reward.description || 'Special reward';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="rewards-modal-overlay" onClick={onClose}>
      <div className="rewards-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="rewards-modal-close" onClick={onClose}>×</button>
        
        <div className="rewards-modal-header">
          <div className="rewards-icon">🏆</div>
          <h2>Rewards Program</h2>
          <p>Earn points with every order and redeem for great rewards!</p>
        </div>

        <div className="rewards-modal-body">
          {loading && (
            <div className="rewards-loading">
              <div className="loading-spinner"></div>
              <p>Loading rewards...</p>
            </div>
          )}

          {error && (
            <div className="rewards-error">
              <p>{error}</p>
              <button onClick={fetchRewardsStatus} className="retry-button">
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && !isAuthenticated && (
            <div className="not-logged-in">
              <div className="login-icon">🔐</div>
              <h3>Login Required</h3>
              <p>Please log in to view your rewards and earn points with your orders.</p>
              <div className="rewards-info">
                <h4>How it works:</h4>
                <ul>
                  <li>Earn 1 point for every 10 EGP spent</li>
                  <li>Get bonus points on special items</li>
                  <li>Redeem points for discounts and free items</li>
                  <li>Exclusive rewards for loyal customers</li>
                </ul>
              </div>
            </div>
          )}

          {!loading && !error && isAuthenticated && rewardsData && (
            <>
              {/* Points Summary */}
              <div className="points-summary">
                <div className="points-card current-points">
                  <div className="points-icon">💎</div>
                  <div className="points-info">
                    <h3>{rewardsData.currentPoints}</h3>
                    <p>Current Points</p>
                  </div>
                </div>
                <div className="points-card total-earned">
                  <div className="points-icon">🎯</div>
                  <div className="points-info">
                    <h3>{rewardsData.totalEarned}</h3>
                    <p>Total Earned</p>
                  </div>
                </div>
              </div>

              {/* Available Rewards */}
              <div className="rewards-section">
                <div className="section-header">
                  <h3>Available Rewards</h3>
                  {user && (
                    <button
                      className="history-toggle"
                      onClick={() => setShowTransactionHistory(!showTransactionHistory)}
                    >
                      {showTransactionHistory ? 'Hide History' : 'View History'}
                    </button>
                  )}
                </div>

                {showTransactionHistory ? (
                  <div className="transaction-history">
                    <h4>Recent Transactions</h4>
                    <div className="history-placeholder">
                      <p>Transaction history feature coming soon!</p>
                      <p>Your recent point earnings and redemptions will appear here.</p>
                    </div>
                  </div>
                ) : (
                  <div className="rewards-list">
                    {rewardsData.availableRewards && rewardsData.availableRewards.length > 0 ? (
                      rewardsData.availableRewards.map((reward) => (
                        <div key={reward.id} className="reward-card">
                          <div className="reward-card-header">
                            <div className="reward-icon">
                              {getRewardTypeIcon(reward.rewardType)}
                            </div>
                            <div className="reward-points">
                              {reward.pointsCost} pts
                            </div>
                          </div>

                          <div className="reward-card-body">
                            <h4 className="reward-title">{reward.title}</h4>
                            <p className="reward-description">
                              {formatRewardDescription(reward)}
                            </p>
                          </div>

                          <div className="reward-card-footer">
                            <button
                              className={`redeem-button ${
                                rewardsData.currentPoints < reward.pointsCost ? 'insufficient' : ''
                              }`}
                              onClick={() => handleRedeemReward(reward)}
                              disabled={
                                redeemingReward === reward.id ||
                                rewardsData.currentPoints < reward.pointsCost
                              }
                            >
                              {redeemingReward === reward.id ? (
                                <>
                                  <div className="button-spinner"></div>
                                  Redeeming...
                                </>
                              ) : rewardsData.currentPoints < reward.pointsCost ? (
                                `Need ${reward.pointsCost - rewardsData.currentPoints} more pts`
                              ) : (
                                'Redeem Now'
                              )}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-rewards">
                        <div className="no-rewards-icon">🎁</div>
                        <h4>No Rewards Available</h4>
                        <p>Keep ordering to unlock amazing rewards!</p>
                        <div className="earning-tips">
                          <h5>Earn more points by:</h5>
                          <ul>
                            <li>Placing regular orders</li>
                            <li>Trying new menu items</li>
                            <li>Ordering during special promotions</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* How to Earn More */}
              <div className="earn-more-section">
                <h4>How to Earn More Points</h4>
                <div className="earning-methods">
                  <div className="earning-method">
                    <div className="method-icon">🛒</div>
                    <div className="method-info">
                      <h5>Place Orders</h5>
                      <p>Earn 1 point per 10 EGP spent</p>
                    </div>
                  </div>
                  <div className="earning-method">
                    <div className="method-icon">⭐</div>
                    <div className="method-info">
                      <h5>Special Items</h5>
                      <p>Get bonus points on featured items</p>
                    </div>
                  </div>
                  <div className="earning-method">
                    <div className="method-icon">🎉</div>
                    <div className="method-info">
                      <h5>Promotions</h5>
                      <p>Double points during special events</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RewardsModal;