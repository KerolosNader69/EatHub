/**
 * Lazy-loaded RewardsModal component
 * Implements code splitting for better performance
 */

import { lazy, Suspense } from 'react';
import SkeletonLoader from './SkeletonLoader';

// Lazy load the RewardsModal component
const RewardsModal = lazy(() => import('./RewardsModal'));

const LazyRewardsModal = (props) => {
  return (
    <Suspense 
      fallback={
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <h2>Loading Rewards...</h2>
            </div>
            <SkeletonLoader height="200px" borderRadius="8px" />
            <div style={{ marginTop: '1rem' }}>
              <SkeletonLoader height="40px" borderRadius="4px" />
            </div>
          </div>
        </div>
      }
    >
      <RewardsModal {...props} />
    </Suspense>
  );
};

export default LazyRewardsModal;