# Monitoring Quick Start Guide

Quick reference for monitoring and logging in Eat Hub.

## Health Check

```bash
# Check if application is healthy
curl https://your-domain.com/api/monitoring/health

# Expected response (200 OK):
{
  "status": "healthy",
  "timestamp": "2025-12-02T10:30:00.000Z",
  "checks": {
    "database": { "status": "connected" },
    "memory": { "status": "healthy" }
  }
}
```

## View Logs

```bash
# View all logs
tail -f backend/logs/combined-*.log

# View errors only
tail -f backend/logs/error-*.log

# Search logs
grep "error" backend/logs/combined-*.log
```

## System Metrics

```bash
# Get current metrics
curl https://your-domain.com/api/monitoring/metrics

# Response includes:
# - Uptime
# - Memory usage
# - Request count
# - Error rate
```

## Set Up Uptime Monitoring (5 minutes)

1. Go to https://uptimerobot.com
2. Sign up (free)
3. Add monitor:
   - URL: `https://your-domain.com/api/monitoring/health`
   - Interval: 5 minutes
4. Add email alert
5. Done!

## Enable Analytics (Optional)

### Google Analytics

1. Get tracking ID from https://analytics.google.com
2. Add to `.env`:
   ```bash
   VITE_ANALYTICS_ENABLED=true
   VITE_ANALYTICS_PROVIDER=google
   VITE_ANALYTICS_TRACKING_ID=G-XXXXXXXXXX
   ```
3. Deploy

### Plausible (Privacy-friendly)

1. Sign up at https://plausible.io
2. Add to `.env`:
   ```bash
   VITE_ANALYTICS_ENABLED=true
   VITE_ANALYTICS_PROVIDER=plausible
   VITE_ANALYTICS_DOMAIN=your-domain.com
   ```
3. Deploy

## Common Issues

### Logs not appearing
- Check `backend/logs/` directory exists
- Verify `LOG_LEVEL` environment variable
- Check file permissions

### Health check failing
- Verify database is connected
- Check memory usage
- Review error logs

### High memory usage
- Check logs for memory warnings
- Restart application
- Consider scaling up

## Monitoring Endpoints

| Endpoint | Purpose | Status Codes |
|----------|---------|--------------|
| `/api/monitoring/health` | Quick health check | 200, 503 |
| `/api/monitoring/metrics` | System metrics | 200 |
| `/api/monitoring/status` | Full status | 200 |

## Log Levels

Set via `LOG_LEVEL` environment variable:

- `error` - Only errors
- `warn` - Warnings and errors
- `info` - Info, warnings, errors (default)
- `debug` - All logs

## Alert Thresholds

Recommended alert settings:

- **Downtime**: Alert after 2 minutes
- **Error rate**: Alert if > 5%
- **Memory**: Alert if > 90%
- **Response time**: Alert if > 5 seconds

## Quick Commands

```bash
# Start server with logging
npm start

# View live logs
tail -f backend/logs/combined-*.log

# Test health check
curl http://localhost:5000/api/monitoring/health

# Test metrics
curl http://localhost:5000/api/monitoring/metrics

# Check log file size
du -sh backend/logs/

# Clean old logs (older than 14 days)
find backend/logs -name "*.log" -mtime +14 -delete
```

## Production Checklist

- [ ] Uptime monitoring configured
- [ ] Email alerts set up
- [ ] Log level set to `info`
- [ ] Analytics configured (optional)
- [ ] Error tracking enabled
- [ ] Health check responding
- [ ] Logs rotating properly
- [ ] Team notified of monitoring URLs

## Support

- **Documentation**: See `MONITORING_SETUP.md`
- **Uptime Guide**: See `UPTIME_MONITORING_GUIDE.md`
- **Backend Details**: See `backend/MONITORING_README.md`

## Resources

- UptimeRobot: https://uptimerobot.com
- Better Uptime: https://betteruptime.com
- Google Analytics: https://analytics.google.com
- Plausible: https://plausible.io
