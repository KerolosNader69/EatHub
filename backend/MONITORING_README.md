# Backend Monitoring and Logging

This document describes the monitoring and logging system implemented in the Eat Hub backend.

## Features

### 1. Structured Logging with Winston

- **Daily log rotation**: Logs rotate daily and are kept for 14 days
- **Multiple log levels**: error, warn, info, debug
- **Separate error logs**: Errors logged to dedicated files
- **Exception handling**: Uncaught exceptions and promise rejections captured
- **JSON format**: Production logs use JSON for easy parsing

### 2. Request Logging

Every HTTP request is logged with:
- Method and URL
- IP address
- User agent
- Response status code
- Response time

### 3. Error Logging

All errors are logged with:
- Error message and stack trace
- Request context (method, URL, body, params)
- User information (IP, user agent)
- Timestamp

### 4. System Monitoring

Real-time monitoring of:
- Application uptime
- Memory usage
- Request count
- Error count and rate
- Database connectivity

### 5. Health Check Endpoints

Three endpoints for monitoring:
- `/api/monitoring/health` - Quick health check
- `/api/monitoring/metrics` - System metrics
- `/api/monitoring/status` - Comprehensive status

## Log Files

Logs are stored in `backend/logs/`:

```
logs/
├── combined-2025-12-02.log      # All logs
├── error-2025-12-02.log         # Errors only
├── exceptions-2025-12-02.log    # Uncaught exceptions
└── rejections-2025-12-02.log    # Unhandled rejections
```

## Usage

### Logging in Your Code

```javascript
const logger = require('./utils/logger');

// Info level
logger.info('User logged in', { userId: '123', email: 'user@example.com' });

// Warning level
logger.warn('High memory usage', { heapUsed: '85%' });

// Error level
logger.error('Database connection failed', { 
  error: err.message,
  stack: err.stack 
});

// Debug level (only in development)
logger.debug('Processing order', { orderId: 'EH123456' });
```

### Monitoring Endpoints

**Health Check**:
```bash
curl http://localhost:5000/api/monitoring/health
```

Response:
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

**Metrics**:
```bash
curl http://localhost:5000/api/monitoring/metrics
```

Response:
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

**Status**:
```bash
curl http://localhost:5000/api/monitoring/status
```

Returns combined health and metrics information.

## Configuration

### Environment Variables

```bash
# Set log level (error, warn, info, debug)
LOG_LEVEL=info

# Set environment
NODE_ENV=production
```

### Log Levels

- **error**: Only errors
- **warn**: Warnings and errors
- **info**: Info, warnings, and errors (default)
- **debug**: All logs including debug messages

## Monitoring Integration

### System Monitor

The `SystemMonitor` class tracks:
- Request count
- Error count
- Error rate
- System uptime
- Memory usage

Usage:
```javascript
const monitor = require('./utils/monitoring');

// Track request
monitor.trackRequest();

// Track error
monitor.trackError();

// Get metrics
const metrics = monitor.getMetrics();

// Perform health check
const health = await monitor.healthCheck(mongoose);
```

### Automatic Metrics Logging

Metrics are automatically logged every 15 minutes. This helps track:
- Memory usage trends
- Request volume patterns
- Error rate changes
- System stability

## Production Recommendations

### 1. Log Management Service

For production, use a log management service:

**Loggly**:
```javascript
// Add Loggly transport
const { Loggly } = require('winston-loggly-bulk');

logger.add(new Loggly({
  token: process.env.LOGGLY_TOKEN,
  subdomain: process.env.LOGGLY_SUBDOMAIN,
  tags: ['eat-hub', 'production'],
  json: true
}));
```

**Papertrail**:
```javascript
// Add Papertrail transport
const { Papertrail } = require('winston-papertrail');

logger.add(new Papertrail({
  host: process.env.PAPERTRAIL_HOST,
  port: process.env.PAPERTRAIL_PORT,
  hostname: 'eat-hub-api',
  program: 'node'
}));
```

### 2. Uptime Monitoring

Set up external monitoring:
- UptimeRobot (free)
- Better Uptime
- Pingdom

Monitor endpoint: `https://your-domain.com/api/monitoring/health`

### 3. Error Tracking

Consider adding Sentry for advanced error tracking:

```bash
npm install @sentry/node
```

```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// In error handler
Sentry.captureException(error);
```

### 4. APM (Application Performance Monitoring)

For detailed performance insights:
- New Relic
- Datadog
- AppDynamics

## Troubleshooting

### Logs Not Appearing

1. Check logs directory exists: `backend/logs/`
2. Check file permissions
3. Verify LOG_LEVEL environment variable
4. Check Winston configuration

### High Memory Usage

1. Check logs for memory warnings
2. Review recent code changes
3. Look for memory leaks
4. Consider scaling up

### Health Check Failing

1. Check database connection
2. Verify MongoDB is running
3. Check memory usage
4. Review error logs

## Maintenance

### Log Rotation

Logs automatically rotate daily and are kept for 14 days. Old logs are automatically deleted.

### Manual Log Cleanup

```bash
# Remove logs older than 14 days
find backend/logs -name "*.log" -mtime +14 -delete
```

### Monitoring Metrics

Regularly review:
- Error rate (should be < 1%)
- Average response time (should be < 500ms)
- Memory usage (should be < 80%)
- Uptime (should be > 99.9%)

## Development vs Production

### Development

- Logs to console with colors
- All log levels enabled
- Morgan middleware for HTTP logging
- Detailed error messages

### Production

- Logs to files only (JSON format)
- Info level and above
- Custom request logger
- Generic error messages to clients

## Security Considerations

1. **Don't log sensitive data**:
   - Passwords
   - Credit card numbers
   - API keys
   - Personal information

2. **Sanitize logs**:
   - Remove PII before logging
   - Mask sensitive fields

3. **Secure log access**:
   - Restrict file permissions
   - Use secure log management service
   - Implement access controls

## Performance Impact

The logging system is designed for minimal performance impact:
- Asynchronous file writes
- Buffered log output
- Efficient JSON serialization
- Log level filtering

Expected overhead: < 1% CPU, < 10MB memory

## Testing

### Test Logging

```bash
# Test logger
node -e "const logger = require('./utils/logger'); logger.info('Test'); logger.error('Error test');"

# Check log files
ls -la logs/
cat logs/combined-*.log
```

### Test Health Check

```bash
# Start server
npm start

# Test health endpoint
curl http://localhost:5000/api/monitoring/health

# Test metrics endpoint
curl http://localhost:5000/api/monitoring/metrics
```

## Support

For issues with monitoring and logging:
1. Check log files in `backend/logs/`
2. Verify environment variables
3. Test health check endpoint
4. Review Winston configuration
5. Contact development team
