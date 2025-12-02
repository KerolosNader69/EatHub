# Uptime Monitoring Setup Guide

This guide will help you set up uptime monitoring for your Eat Hub application.

## Quick Start

Your application now has health check endpoints ready for monitoring:

- **Health Check**: `https://your-domain.com/api/monitoring/health`
- **Metrics**: `https://your-domain.com/api/monitoring/metrics`
- **Status**: `https://your-domain.com/api/monitoring/status`

## Recommended Free Service: UptimeRobot

UptimeRobot is free and easy to set up. Follow these steps:

### Step 1: Sign Up

1. Go to https://uptimerobot.com
2. Click "Sign Up Free"
3. Create your account

### Step 2: Add Monitor

1. Click "+ Add New Monitor"
2. Fill in the details:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Eat Hub API
   - **URL**: `https://your-domain.com/api/monitoring/health`
   - **Monitoring Interval**: 5 minutes (free tier)
3. Click "Create Monitor"

### Step 3: Set Up Alerts

1. Go to "My Settings" > "Alert Contacts"
2. Add your email address
3. Verify your email
4. Optional: Add SMS, Slack, or other integrations

### Step 4: Create Status Page (Optional)

1. Go to "Status Pages"
2. Click "Add Status Page"
3. Select your monitors
4. Customize the page
5. Share the public URL with your team or customers

## Alternative Services

### Better Uptime (Recommended for Production)

**Pros**: More features, better UI, faster checks
**Free Tier**: 10 monitors, 30-second checks

1. Sign up at https://betteruptime.com
2. Add monitor with URL: `https://your-domain.com/api/monitoring/health`
3. Set check interval to 30 seconds
4. Configure incident management
5. Set up on-call schedules

### Pingdom

**Pros**: Industry standard, detailed reports
**Free Trial**: 14 days, then paid

1. Sign up at https://www.pingdom.com
2. Add uptime check
3. Configure alerts
4. Set up real user monitoring (RUM)

## Health Check Response

Your health check endpoint returns:

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

**Status Codes**:
- `200`: Application is healthy
- `503`: Application is unhealthy (database down, high memory, etc.)

## Alert Configuration

### Recommended Alert Settings

**For UptimeRobot**:
- Alert when down for: 2 minutes (2 consecutive checks)
- Alert contacts: Email + SMS (if available)
- Re-alert if still down: Every 30 minutes

**For Better Uptime**:
- Alert when down for: 1 minute (2 consecutive checks)
- Escalation: Email → SMS → Phone call
- Auto-resolve when back up

### Alert Channels

Set up multiple channels for redundancy:
1. **Email**: Primary notification
2. **SMS**: Critical alerts
3. **Slack**: Team notifications
4. **PagerDuty**: On-call rotation (for teams)

## Monitoring Best Practices

### 1. Monitor Multiple Endpoints

Don't just monitor the health check. Also monitor:
- Frontend: `https://your-frontend-domain.com`
- API root: `https://your-api-domain.com/api`
- Critical endpoints: `/api/menu`, `/api/orders`

### 2. Set Up Geographic Monitoring

Monitor from multiple locations to detect regional issues:
- North America
- Europe
- Asia

### 3. Monitor Response Time

Set alerts for slow responses:
- Warning: > 2 seconds
- Critical: > 5 seconds

### 4. SSL Certificate Monitoring

Monitor SSL certificate expiration:
- Alert 30 days before expiration
- Alert 7 days before expiration

### 5. Create Runbooks

Document what to do when alerts fire:

**Database Connection Failed**:
1. Check MongoDB Atlas status
2. Verify connection string
3. Check network connectivity
4. Restart application if needed

**High Memory Usage**:
1. Check application logs
2. Look for memory leaks
3. Restart application
4. Scale up if needed

**Slow Response Times**:
1. Check database performance
2. Review recent deployments
3. Check server resources
4. Enable caching if needed

## Testing Your Monitoring

### Test Downtime Alert

1. Stop your backend server
2. Wait for alert (should arrive within monitoring interval)
3. Verify you received the alert
4. Start server and verify recovery alert

### Test Health Check

```bash
# Should return 200 and healthy status
curl https://your-domain.com/api/monitoring/health

# Check metrics
curl https://your-domain.com/api/monitoring/metrics

# Check full status
curl https://your-domain.com/api/monitoring/status
```

## Monitoring Dashboard

Create a simple dashboard to track:
- Uptime percentage (target: 99.9%)
- Average response time
- Incident count
- Mean time to recovery (MTTR)

Most monitoring services provide built-in dashboards.

## Integration with Deployment

### Railway Deployment

Railway provides built-in health checks:
1. Go to your service settings
2. Add health check path: `/api/monitoring/health`
3. Set check interval: 30 seconds
4. Railway will restart unhealthy services

### Vercel Deployment

Vercel monitors frontend automatically:
- Deployment status
- Build errors
- Runtime errors

## Maintenance Windows

Schedule maintenance windows to avoid false alerts:
1. Notify monitoring service of planned downtime
2. Disable alerts during maintenance
3. Re-enable after maintenance complete

## Cost Considerations

**Free Tier Limits**:
- UptimeRobot: 50 monitors, 5-minute checks
- Better Uptime: 10 monitors, 30-second checks
- Pingdom: 14-day trial only

**Paid Plans** (if needed):
- UptimeRobot Pro: $7/month (1-minute checks)
- Better Uptime: $20/month (10-second checks)
- Pingdom: $10/month (1-minute checks)

## Next Steps

1. [ ] Sign up for monitoring service
2. [ ] Add health check monitor
3. [ ] Configure email alerts
4. [ ] Test alerts by stopping server
5. [ ] Add SMS alerts (optional)
6. [ ] Create status page (optional)
7. [ ] Set up Slack integration (optional)
8. [ ] Document incident response procedures
9. [ ] Schedule regular monitoring reviews

## Support

If you have issues with monitoring setup:
1. Check health check endpoint is accessible
2. Verify SSL certificate is valid
3. Check firewall rules
4. Review monitoring service documentation
5. Contact monitoring service support

## Resources

- UptimeRobot Docs: https://uptimerobot.com/help
- Better Uptime Docs: https://docs.betteruptime.com
- Pingdom Docs: https://www.pingdom.com/resources
- Health Check Best Practices: https://microservices.io/patterns/observability/health-check-api.html
