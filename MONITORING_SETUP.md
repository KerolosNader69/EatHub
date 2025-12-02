# Monitoring and Logging Setup

This document describes the monitoring and logging infrastructure for the Eat Hub application.

## Backend Logging

### Winston Logger

The application uses Winston for structured logging with the following features:

- **Daily log rotation**: Logs are rotated daily and kept for 14 days
- **Multiple log levels**: error, warn, info, debug
- **Separate error logs**: Errors are logged to dedicated files
- **Exception handling**: Uncaught exceptions and unhandled rejections are logged
- **JSON format**: Production logs use JSON format for easy parsing

### Log Files

Logs are stored in `backend/logs/`:

- `combined-YYYY-MM-DD.log`: All logs
- `error-YYYY-MM-DD.log`: Error logs only
- `exceptions-YYYY-MM-DD.log`: Uncaught exceptions
- `rejections-YYYY-MM-DD.log`: Unhandled promise rejections

### Configuration

Set the log level via environment variable:

```bash
LOG_LEVEL=info  # Options: error, warn, info, debug
```

## System Monitoring

### Health Check Endpoints

**GET /api/monitoring/health**
- Returns health status of the application
- Checks database connectivity
- Checks memory usage
- Returns 200 for healthy, 503 for unhealthy

Example response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-02T10:30:00.000Z",
  "checks": {
    "database": {
      "status": "connected",
      "state": 1
    },
    "memory": {
      "status": "healthy",
      "heapUsedPercent": "45.23%"
    }
  }
}
```

**GET /api/monitoring/metrics**
- Returns system metrics
- Includes uptime, memory usage, request counts

Example response:
```json
{
  "uptime": {
    "seconds": 3600,
    "formatted": "1h 0m 0s"
  },
  "memory": {
    "rss": "150MB",
    "heapTotal": "100MB",
    "heapUsed": "75MB",
    "external": "5MB"
  },
  "requests": {
    "total": 1234,
    "errors": 12,
    "errorRate": "0.97%"
  },
  "timestamp": "2025-12-02T10:30:00.000Z"
}
```

**GET /api/monitoring/status**
- Returns comprehensive status including health and metrics
- Includes environment and version information

### Automatic Metrics Logging

The system automatically logs metrics every 15 minutes to help track:
- Memory usage trends
- Request volume
- Error rates
- System uptime

## Uptime Monitoring

### Recommended Services

Configure one of these services to monitor your application:

#### 1. UptimeRobot (Free)
- URL: https://uptimerobot.com
- Monitor endpoint: `https://your-domain.com/api/monitoring/health`
- Check interval: 5 minutes
- Alert via: Email, SMS, Slack

#### 2. Pingdom
- URL: https://www.pingdom.com
- Monitor endpoint: `https://your-domain.com/api/monitoring/health`
- Check interval: 1 minute
- Advanced monitoring features

#### 3. Better Uptime
- URL: https://betteruptime.com
- Monitor endpoint: `https://your-domain.com/api/monitoring/health`
- Check interval: 30 seconds
- Status page included

### Setup Instructions

1. Sign up for an uptime monitoring service
2. Add a new monitor with URL: `https://your-domain.com/api/monitoring/health`
3. Set check interval (recommended: 5 minutes)
4. Configure alerts (email, SMS, Slack, etc.)
5. Set up status page (optional)

## Frontend Error Tracking

### Error Tracker

The frontend includes an error tracking utility that:

- Captures JavaScript errors
- Captures unhandled promise rejections
- Logs errors to console
- Optionally sends errors to backend

### Configuration

Enable error tracking in `.env`:

```bash
VITE_ERROR_TRACKING_ENABLED=true
VITE_API_URL=https://your-api-domain.com
```

### Usage

The error tracker is automatically initialized. You can also manually track errors:

```javascript
import errorTracker from './utils/errorTracking';

// Track custom error
errorTracker.trackError('Something went wrong', { context: 'checkout' });

// Track API error
errorTracker.trackApiError('/api/orders', 500, 'Server error');
```

## Analytics Tracking (Optional)

### Supported Providers

The application supports:
- Google Analytics
- Plausible Analytics
- Custom analytics

### Configuration

#### Google Analytics

1. Create a Google Analytics property
2. Get your tracking ID (G-XXXXXXXXXX)
3. Configure in `.env`:

```bash
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_PROVIDER=google
VITE_ANALYTICS_TRACKING_ID=G-XXXXXXXXXX
```

#### Plausible Analytics

1. Sign up at https://plausible.io
2. Add your domain
3. Configure in `.env`:

```bash
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_PROVIDER=plausible
VITE_ANALYTICS_DOMAIN=your-domain.com
```

### Tracked Events

The analytics utility tracks:
- Page views
- Order placements
- Add to cart actions
- Menu item views
- Search queries
- Errors

### Usage

```javascript
import analytics from './utils/analytics';

// Initialize (done automatically in App.jsx)
analytics.init();

// Track page view
analytics.trackPageView('/menu', 'Menu Page');

// Track order
analytics.trackOrder('EH123456', 45.99, 3);

// Track add to cart
analytics.trackAddToCart('Chicken Biryani', 12.99);
```

## Production Recommendations

### 1. Log Management

For production, consider using a log management service:

- **Loggly**: https://www.loggly.com
- **Papertrail**: https://www.papertrail.com
- **Datadog**: https://www.datadoghq.com
- **New Relic**: https://newrelic.com

These services provide:
- Centralized log storage
- Log search and filtering
- Alerts on error patterns
- Log retention policies

### 2. Application Performance Monitoring (APM)

Consider adding APM for deeper insights:

- **New Relic APM**
- **Datadog APM**
- **AppDynamics**
- **Elastic APM**

### 3. Error Tracking Services

For advanced error tracking:

- **Sentry**: https://sentry.io
  - Automatic error grouping
  - Stack trace analysis
  - Release tracking
  - User context

- **Rollbar**: https://rollbar.com
  - Real-time error tracking
  - Deploy tracking
  - Custom grouping rules

### 4. Uptime Monitoring Best Practices

- Monitor from multiple locations
- Set up escalation policies
- Monitor both frontend and backend
- Check SSL certificate expiration
- Monitor API response times
- Set up status page for customers

## Environment Variables

### Backend

```bash
# Logging
LOG_LEVEL=info

# Node environment
NODE_ENV=production
```

### Frontend

```bash
# Error tracking
VITE_ERROR_TRACKING_ENABLED=true
VITE_API_URL=https://your-api-domain.com

# Analytics (optional)
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_PROVIDER=google
VITE_ANALYTICS_TRACKING_ID=G-XXXXXXXXXX
```

## Monitoring Checklist

- [ ] Winston logger configured and working
- [ ] Log files rotating properly
- [ ] Health check endpoint responding
- [ ] Uptime monitoring service configured
- [ ] Alert notifications set up
- [ ] Frontend error tracking enabled
- [ ] Analytics configured (optional)
- [ ] Log retention policy defined
- [ ] Monitoring dashboard set up
- [ ] Team notified of monitoring setup

## Troubleshooting

### Logs not appearing

1. Check logs directory exists: `backend/logs/`
2. Check file permissions
3. Verify LOG_LEVEL environment variable
4. Check Winston configuration in `backend/utils/logger.js`

### Health check failing

1. Check database connection
2. Verify MongoDB is running
3. Check memory usage
4. Review error logs

### Analytics not tracking

1. Verify VITE_ANALYTICS_ENABLED=true
2. Check tracking ID is correct
3. Open browser console for errors
4. Verify analytics script loaded
5. Check ad blockers aren't blocking

## Support

For issues with monitoring and logging:
1. Check application logs in `backend/logs/`
2. Review health check endpoint response
3. Check system metrics endpoint
4. Contact development team
