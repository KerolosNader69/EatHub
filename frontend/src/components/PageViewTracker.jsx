import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import analytics from '../utils/analytics';

/**
 * Component to track page views with analytics
 */
function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    analytics.trackPageView(location.pathname, document.title);
  }, [location]);

  return null;
}

export default PageViewTracker;
