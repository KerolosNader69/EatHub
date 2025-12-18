/**
 * Lazy loading utilities for code splitting and performance optimization
 */

import { lazy, Suspense } from 'react';

/**
 * Create a lazy-loaded component with error boundary
 * @param {Function} importFunc - Dynamic import function
 * @param {Object} fallback - Loading component
 * @returns {Function} - Lazy component wrapper
 */
export const createLazyComponent = (importFunc, fallback = null) => {
  const LazyComponent = lazy(importFunc);
  
  return (props) => (
    <Suspense fallback={fallback || <div className="loading-spinner">Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Preload a lazy component
 * @param {Function} importFunc - Dynamic import function
 */
export const preloadComponent = (importFunc) => {
  importFunc();
};

/**
 * Intersection Observer for lazy loading elements
 * @param {Element} element - Element to observe
 * @param {Function} callback - Callback when element is in view
 * @param {Object} options - Observer options
 */
export const observeElement = (element, callback, options = {}) => {
  const defaultOptions = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
        observer.unobserve(entry.target);
      }
    });
  }, defaultOptions);
  
  observer.observe(element);
  
  return observer;
};