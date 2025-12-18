import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';
import Navigation from '../components/Navigation';
import CategoryGrid from '../components/CategoryGrid';
import ActionButtons from '../components/ActionButtons';
import FeaturedItems from '../components/FeaturedItems';
import LazyVoucherModal from '../components/LazyVoucherModal';
import LazyRewardsModal from '../components/LazyRewardsModal';
import { getAvailableVouchers } from '../services/voucherService';
import { getRewardsStatus } from '../services/rewardsService';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [voucherCount, setVoucherCount] = useState(0);
  const [rewardPoints, setRewardPoints] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);

  useEffect(() => {
    // Initialize page data on component mount
    initializePageData();
  }, [isAuthenticated]);

  const initializePageData = async () => {
    try {
      setPageLoading(true);
      setError(null);
      
      // Fetch vouchers and rewards data concurrently
      const promises = [fetchVouchersData()];
      if (isAuthenticated) {
        promises.push(fetchRewardsData());
      }
      
      await Promise.allSettled(promises);
    } catch (err) {
      console.error('Error initializing page data:', err);
      setError('Failed to load page data. Please try again.');
    } finally {
      setPageLoading(false);
    }
  };

  const fetchVouchersData = async () => {
    try {
      setVoucherLoading(true);
      const vouchers = await getAvailableVouchers();
      setVoucherCount(vouchers?.length || 0);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      // Don't show error for vouchers, just set count to 0
      setVoucherCount(0);
    } finally {
      setVoucherLoading(false);
    }
  };

  const fetchRewardsData = async () => {
    try {
      setRewardsLoading(true);
      const rewardsData = await getRewardsStatus();
      setRewardPoints(rewardsData?.currentPoints || 0);
    } catch (err) {
      console.error('Error fetching rewards:', err);
      // Don't show error for rewards, just set points to null
      setRewardPoints(null);
    } finally {
      setRewardsLoading(false);
    }
  };

  const handleVoucherClick = () => {
    setShowVoucherModal(true);
  };

  const handleRewardsClick = () => {
    setShowRewardsModal(true);
  };

  const handleVoucherApplied = (voucher) => {
    console.log('Voucher applied:', voucher);
    // TODO: Apply voucher to cart (will be handled in cart/checkout integration)
    // For now, just show success message or navigate to cart
  };

  const handleRewardRedeemed = (rewardResult) => {
    console.log('Reward redeemed:', rewardResult);
    // Update local reward points
    setRewardPoints(rewardResult.newBalance);
    // TODO: Handle reward application (discount, free item, etc.)
  };

  const handleCategoryClick = (category) => {
    // CategoryGrid component handles navigation internally
    console.log('Category clicked:', category.name);
  };

  const handleRetry = () => {
    initializePageData();
  };

  // Show loading state while page is initializing
  if (pageLoading) {
    return (
      <div className="home-page">
        <Navigation />
        <main className="home-page__main">
          <div className="home-page__container">
            <div className="home-page__loading" role="status" aria-live="polite">
              <div className="loading-spinner" aria-hidden="true"></div>
              <p>Loading your personalized experience...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state if page failed to load
  if (error) {
    return (
      <div className="home-page">
        <Navigation />
        <main className="home-page__main">
          <div className="home-page__container">
            <div className="home-page__error" role="alert">
              <p className="home-page__error-message">{error}</p>
              <button 
                className="home-page__retry-button"
                onClick={handleRetry}
                aria-label="Retry loading page data"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="home-page">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navigation />
      
      <main id="main-content" className="home-page__main">
        <div className="home-page__container">
          {/* Category Grid Section */}
          <ErrorBoundary>
            <section 
              className="home-page__section home-page__categories"
              aria-labelledby="categories-heading"
            >
              <div className="home-page__section-content">
                <h1 id="categories-heading" className="home-page__title">
                  What are you craving today?
                </h1>
                <CategoryGrid onCategoryClick={handleCategoryClick} />
              </div>
            </section>
          </ErrorBoundary>

          {/* Action Buttons Section */}
          <ErrorBoundary>
            <section 
              className="home-page__section home-page__actions"
              aria-label="Vouchers and rewards"
            >
              <div className="home-page__section-content">
                <ActionButtons
                  onVoucherClick={handleVoucherClick}
                  onRewardsClick={handleRewardsClick}
                  voucherCount={voucherCount}
                  rewardPoints={rewardPoints}
                  isLoggedIn={isAuthenticated}
                  voucherLoading={voucherLoading}
                  rewardsLoading={rewardsLoading}
                />
              </div>
            </section>
          </ErrorBoundary>

          {/* Featured Items Section */}
          <ErrorBoundary>
            <section 
              className="home-page__section home-page__featured"
              aria-labelledby="featured-heading"
            >
              <div className="home-page__section-content">
                <FeaturedItems />
              </div>
            </section>
          </ErrorBoundary>
        </div>
      </main>

      {/* Modals - Lazy loaded for better performance */}
      {showVoucherModal && (
        <LazyVoucherModal
          isOpen={showVoucherModal}
          onClose={() => setShowVoucherModal(false)}
          onVoucherApplied={handleVoucherApplied}
        />
      )}
      
      {showRewardsModal && (
        <LazyRewardsModal
          isOpen={showRewardsModal}
          onClose={() => setShowRewardsModal(false)}
          onRewardRedeemed={handleRewardRedeemed}
        />
      )}
    </div>
  );
};

export default HomePage;