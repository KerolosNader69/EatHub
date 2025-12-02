/**
 * Analytics tracking utility
 * Supports Google Analytics, Plausible, or custom analytics
 */

class Analytics {
  constructor() {
    this.enabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
    this.provider = import.meta.env.VITE_ANALYTICS_PROVIDER || 'none';
    this.trackingId = import.meta.env.VITE_ANALYTICS_TRACKING_ID;
  }

  /**
   * Initialize analytics
   */
  init() {
    if (!this.enabled) {
      console.log('Analytics disabled');
      return;
    }

    switch (this.provider) {
      case 'google':
        this.initGoogleAnalytics();
        break;
      case 'plausible':
        this.initPlausible();
        break;
      default:
        console.log('No analytics provider configured');
    }
  }

  /**
   * Initialize Google Analytics
   */
  initGoogleAnalytics() {
    if (!this.trackingId) {
      console.warn('Google Analytics tracking ID not provided');
      return;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.trackingId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', this.trackingId, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });

    console.log('Google Analytics initialized');
  }

  /**
   * Initialize Plausible Analytics
   */
  initPlausible() {
    const domain = import.meta.env.VITE_ANALYTICS_DOMAIN || window.location.hostname;
    
    const script = document.createElement('script');
    script.defer = true;
    script.setAttribute('data-domain', domain);
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);

    console.log('Plausible Analytics initialized');
  }

  /**
   * Track page view
   */
  trackPageView(path, title) {
    if (!this.enabled) return;

    switch (this.provider) {
      case 'google':
        if (window.gtag) {
          window.gtag('event', 'page_view', {
            page_path: path,
            page_title: title
          });
        }
        break;
      case 'plausible':
        if (window.plausible) {
          window.plausible('pageview');
        }
        break;
      default:
        console.log('Page view:', path, title);
    }
  }

  /**
   * Track custom event
   */
  trackEvent(eventName, eventData = {}) {
    if (!this.enabled) return;

    switch (this.provider) {
      case 'google':
        if (window.gtag) {
          window.gtag('event', eventName, eventData);
        }
        break;
      case 'plausible':
        if (window.plausible) {
          window.plausible(eventName, { props: eventData });
        }
        break;
      default:
        console.log('Event:', eventName, eventData);
    }
  }

  /**
   * Track order placement
   */
  trackOrder(orderNumber, totalAmount, itemCount) {
    this.trackEvent('order_placed', {
      order_number: orderNumber,
      value: totalAmount,
      items: itemCount
    });
  }

  /**
   * Track add to cart
   */
  trackAddToCart(itemName, itemPrice) {
    this.trackEvent('add_to_cart', {
      item_name: itemName,
      value: itemPrice
    });
  }

  /**
   * Track menu item view
   */
  trackMenuItemView(itemName, category) {
    this.trackEvent('view_item', {
      item_name: itemName,
      item_category: category
    });
  }

  /**
   * Track search
   */
  trackSearch(searchTerm) {
    this.trackEvent('search', {
      search_term: searchTerm
    });
  }

  /**
   * Track error
   */
  trackError(errorMessage, errorCode) {
    this.trackEvent('error', {
      error_message: errorMessage,
      error_code: errorCode
    });
  }
}

// Create singleton instance
const analytics = new Analytics();

export default analytics;
