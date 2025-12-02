# Deploy Eat Hub with Monitoring - Step by Step

Your code is committed and ready to deploy! Follow these steps to deploy with the new monitoring features.

## Prerequisites

✅ Code committed to git
✅ Monitoring and logging implemented
✅ Environment variables configured

## Step 1: Push to GitHub (5 minutes)

### Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `eat-hub` (or your preferred name)
3. Keep it **Private** (recommended) or Public
4. **DO NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

### Push Your Code

Run these commands in your terminal:

```powershell
# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/eat-hub.git

# Push code
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend to Railway (10 minutes)

### Create Railway Account

1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign in with GitHub

### Deploy Backend

1. Click "Deploy from GitHub repo"
2. Select your `eat-hub` repository
3. Railway will detect the monorepo structure
4. Click "Add variables" and configure:

```bash
# Required Variables
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_generated_secret_key
FRONTEND_URL=https://your-frontend-url.vercel.app

# Monitoring (New!)
LOG_LEVEL=info
```

5. Click "Deploy"
6. Wait for deployment to complete (~2-3 minutes)
7. Copy your backend URL (e.g., `https://eat-hub-production.up.railway.app`)

### Configure Root Directory

1. Go to Settings
2. Find "Root Directory"
3. Set to: `backend`
4. Save changes
5. Redeploy if needed

### Test Backend Health Check

```powershell
# Replace with your Railway URL
curl https://your-backend-url.railway.app/api/monitoring/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-02T10:30:00.000Z",
  "checks": {
    "database": { "status": "connected" },
    "memory": { "status": "healthy" }
  }
}
```

## Step 3: Deploy Frontend to Vercel (5 minutes)

### Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub

### Deploy Frontend

1. Click "Add New Project"
2. Import your `eat-hub` repository
3. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variables:

```bash
# Required
VITE_API_URL=https://your-backend-url.railway.app/api

# Optional - Analytics
VITE_ANALYTICS_ENABLED=false
VITE_ANALYTICS_PROVIDER=google
VITE_ANALYTICS_TRACKING_ID=

# Optional - Error Tracking
VITE_ERROR_TRACKING_ENABLED=true
```

5. Click "Deploy"
6. Wait for deployment (~2 minutes)
7. Copy your frontend URL (e.g., `https://eat-hub.vercel.app`)

### Update Backend CORS

1. Go back to Railway
2. Update `FRONTEND_URL` variable with your Vercel URL
3. Redeploy backend

## Step 4: Set Up MongoDB Atlas (if not done)

1. Go to https://cloud.mongodb.com
2. Create free cluster
3. Create database user
4. Whitelist all IPs: `0.0.0.0/0`
5. Get connection string
6. Update `MONGODB_URI` in Railway

## Step 5: Create Admin User

### Option A: Using Railway CLI (if installed)

```powershell
railway run node backend/scripts/createAdminUser.js
```

### Option B: Using Railway Dashboard

1. Go to your Railway project
2. Click on your service
3. Go to "Deployments" tab
4. Click on latest deployment
5. Click "View Logs"
6. Look for startup logs

### Option C: Manual via MongoDB

1. Go to MongoDB Atlas
2. Browse Collections
3. Create admin user manually in `admins` collection

## Step 6: Set Up Uptime Monitoring (5 minutes)

### UptimeRobot (Free)

1. Go to https://uptimerobot.com
2. Sign up (free)
3. Click "+ Add New Monitor"
4. Configure:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Eat Hub API
   - **URL**: `https://your-backend-url.railway.app/api/monitoring/health`
   - **Monitoring Interval**: 5 minutes
5. Add your email for alerts
6. Click "Create Monitor"

### Test Alert

1. Stop your Railway service temporarily
2. Wait 5 minutes
3. You should receive an alert email
4. Restart service
5. Verify recovery alert

## Step 7: Configure Analytics (Optional)

### Google Analytics

1. Go to https://analytics.google.com
2. Create new GA4 property
3. Get tracking ID (G-XXXXXXXXXX)
4. Update Vercel environment variables:
   ```bash
   VITE_ANALYTICS_ENABLED=true
   VITE_ANALYTICS_PROVIDER=google
   VITE_ANALYTICS_TRACKING_ID=G-XXXXXXXXXX
   ```
5. Redeploy frontend

### Plausible (Privacy-friendly alternative)

1. Go to https://plausible.io
2. Sign up and add your domain
3. Update Vercel environment variables:
   ```bash
   VITE_ANALYTICS_ENABLED=true
   VITE_ANALYTICS_PROVIDER=plausible
   VITE_ANALYTICS_DOMAIN=your-domain.vercel.app
   ```
4. Redeploy frontend

## Step 8: Verify Deployment

### Test Backend

```powershell
# Health check
curl https://your-backend-url.railway.app/api/monitoring/health

# Metrics
curl https://your-backend-url.railway.app/api/monitoring/metrics

# Status
curl https://your-backend-url.railway.app/api/monitoring/status
```

### Test Frontend

1. Open your Vercel URL in browser
2. Check console for errors
3. Test menu loading
4. Test cart functionality
5. Test checkout flow

### Check Logs

**Railway Logs**:
1. Go to Railway dashboard
2. Click on your service
3. View logs in real-time
4. Look for Winston log entries

**Vercel Logs**:
1. Go to Vercel dashboard
2. Click on your project
3. Go to "Logs" tab
4. Check for errors

## Step 9: Monitor Your Application

### View Logs

**Backend Logs** (Railway):
- Go to Railway dashboard
- Click "View Logs"
- Filter by log level

**Frontend Errors** (Vercel):
- Go to Vercel dashboard
- Check "Logs" tab
- Look for runtime errors

### Check Metrics

```powershell
# Get current metrics
curl https://your-backend-url.railway.app/api/monitoring/metrics
```

### Monitor Uptime

- Check UptimeRobot dashboard
- View uptime percentage
- Check response times
- Review alert history

## Troubleshooting

### Backend Not Starting

1. Check Railway logs
2. Verify environment variables
3. Check MongoDB connection string
4. Verify PORT is set to 5000

### Frontend Build Failing

1. Check Vercel build logs
2. Verify `VITE_API_URL` is set
3. Check for TypeScript errors
4. Verify root directory is `frontend`

### CORS Errors

1. Verify `FRONTEND_URL` in Railway matches Vercel URL
2. Include protocol (https://)
3. No trailing slash
4. Redeploy backend after changing

### Database Connection Failed

1. Check MongoDB Atlas is running
2. Verify connection string
3. Check IP whitelist (0.0.0.0/0)
4. Verify database user credentials

### Health Check Failing

1. Check database connectivity
2. Verify backend is running
3. Check memory usage
4. Review error logs

## Post-Deployment Checklist

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] MongoDB Atlas configured
- [ ] Environment variables set
- [ ] Admin user created
- [ ] CORS configured
- [ ] Health check responding
- [ ] Uptime monitoring configured
- [ ] Email alerts set up
- [ ] Analytics configured (optional)
- [ ] Application tested end-to-end
- [ ] Logs verified
- [ ] Metrics accessible

## Monitoring URLs

Save these URLs for monitoring:

```
Frontend: https://your-app.vercel.app
Backend: https://your-app.railway.app
Health Check: https://your-app.railway.app/api/monitoring/health
Metrics: https://your-app.railway.app/api/monitoring/metrics
Status: https://your-app.railway.app/api/monitoring/status
UptimeRobot: https://uptimerobot.com/dashboard
```

## Next Steps

1. **Set up custom domain** (optional)
   - Configure in Vercel and Railway
   - Update environment variables
   - Update CORS settings

2. **Configure log management** (recommended)
   - Sign up for Loggly or Papertrail
   - Add transport to Winston logger
   - Set up log alerts

3. **Add error tracking** (recommended)
   - Sign up for Sentry
   - Install Sentry SDK
   - Configure error reporting

4. **Set up CI/CD** (optional)
   - GitHub Actions for tests
   - Automatic deployments
   - Environment-specific configs

## Support

If you encounter issues:

1. Check deployment logs
2. Verify environment variables
3. Test health check endpoint
4. Review `DEPLOYMENT_TROUBLESHOOTING.md`
5. Check Railway/Vercel status pages

## Monitoring Documentation

- `MONITORING_SETUP.md` - Complete monitoring guide
- `UPTIME_MONITORING_GUIDE.md` - Uptime monitoring details
- `MONITORING_QUICK_START.md` - Quick reference
- `backend/MONITORING_README.md` - Backend monitoring details

## Success!

Your Eat Hub application is now deployed with:
✅ Comprehensive logging (Winston)
✅ System monitoring
✅ Health check endpoints
✅ Uptime monitoring
✅ Error tracking
✅ Optional analytics

Monitor your application health at:
`https://your-backend-url.railway.app/api/monitoring/health`
