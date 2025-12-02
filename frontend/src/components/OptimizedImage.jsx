import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './OptimizedImage.css';

/**
 * OptimizedImage component with lazy loading and WebP support
 * Automatically handles WebP format with JPEG fallback
 * Implements intersection observer for lazy loading
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  lazy = true,
  placeholder = null,
  onError,
  onLoad,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // Convert image URL to WebP version
  const getWebPUrl = (url) => {
    if (!url || url.startsWith('data:')) return null;
    // If it's already a WebP, return as is
    if (url.endsWith('.webp')) return url;
    // Replace extension with .webp
    return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  };

  const webpSrc = getWebPUrl(src);
  const fallbackSrc = src;

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [lazy]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  // Show placeholder while loading
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={`optimized-image-placeholder ${className}`}
        style={{ width, height }}
        {...props}
      >
        {placeholder || <div className="image-skeleton" />}
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div
        className={`optimized-image-error ${className}`}
        style={{ width, height }}
        {...props}
      >
        {placeholder || (
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        )}
      </div>
    );
  }

  return (
    <picture ref={imgRef} className={`optimized-image-wrapper ${className}`}>
      {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
      <img
        src={fallbackSrc}
        alt={alt}
        className={`optimized-image ${isLoaded ? 'loaded' : 'loading'}`}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        loading={lazy ? 'lazy' : 'eager'}
        {...props}
      />
    </picture>
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  lazy: PropTypes.bool,
  placeholder: PropTypes.node,
  onError: PropTypes.func,
  onLoad: PropTypes.func,
};

export default OptimizedImage;
