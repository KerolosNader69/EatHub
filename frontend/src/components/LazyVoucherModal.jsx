/**
 * Lazy-loaded VoucherModal component
 * Implements code splitting for better performance
 */

import { lazy, Suspense } from 'react';
import SkeletonLoader from './SkeletonLoader';

// Lazy load the VoucherModal component
const VoucherModal = lazy(() => import('./VoucherModal'));

const LazyVoucherModal = (props) => {
  return (
    <Suspense 
      fallback={
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <h2>Loading Vouchers...</h2>
            </div>
            <SkeletonLoader height="200px" borderRadius="8px" />
            <div style={{ marginTop: '1rem' }}>
              <SkeletonLoader height="40px" borderRadius="4px" />
            </div>
          </div>
        </div>
      }
    >
      <VoucherModal {...props} />
    </Suspense>
  );
};

export default LazyVoucherModal;