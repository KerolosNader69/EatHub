# Quick Deploy Commands

Copy and paste these commands to deploy your application.

## Step 1: Push to GitHub

First, create a repository at https://github.com/new named `eat-hub`

Then run these commands (replace YOUR_USERNAME with your GitHub username):

```powershell
git remote add origin https://github.com/YOUR_USERNAME/eat-hub.git
git branch -M main
git push -u origin main
```

## Step 2: Verify Push

```powershell
git remote -v
git log --oneline -1
```

You should see your commit: "Add monitoring and logging system - Task 17.3 complete"

## Step 3: Deploy to Railway

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `eat-hub` repository
5. Railway will auto-detect Node.js

### Configure Railway

In Railway dashboard:

1. Go to Settings → Root Directory → Set to `backend`
2. Go to Variables → Add these:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
FRONTEND_URL=https://your-frontend.vercel.app
LOG_LEVEL=info
```

3. Click "Deploy"

## Step 4: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your `eat-hub` repository
4. Configure:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Add Environment Variables

```
VITE_API_URL=https://your-backend.railway.app/api
VITE_ERROR_TRACKING_ENABLED=true
VITE_ANALYTICS_ENABLED=false
```

5. Click "Deploy"

## Step 5: Update CORS

After Vercel deployment:

1. Copy your Vercel URL
2. Go back to Railway
3. Update `FRONTEND_URL` variable with your Vercel URL
4. Redeploy

## Step 6: Test Deployment

Replace URLs with your actual deployment URLs:

```powershell
# Test backend health
curl https://your-backend.railway.app/api/monitoring/health

# Test backend metrics
curl https://your-backend.railway.app/api/monitoring/metrics

# Test frontend
curl https://your-frontend.vercel.app
```

## Step 7: Set Up Monitoring

1. Go to https://uptimerobot.com
2. Sign up (free)
3. Add New Monitor:
   - Type: HTTP(s)
   - URL: `https://your-backend.railway.app/api/monitoring/health`
   - Interval: 5 minutes
4. Add email for alerts

## Troubleshooting Commands

### Check Git Status
```powershell
git status
git log --oneline -5
```

### Check Remote
```powershell
git remote -v
```

### Force Push (if needed)
```powershell
git push -f origin main
```

### View Commit History
```powershell
git log --oneline --graph --all
```

## Environment Variables Reference

### Backend (Railway)
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/eathub
JWT_SECRET=your_secret_key_here
FRONTEND_URL=https://your-app.vercel.app
LOG_LEVEL=info
```

### Frontend (Vercel)
```bash
VITE_API_URL=https://your-app.railway.app/api
VITE_ERROR_TRACKING_ENABLED=true
VITE_ANALYTICS_ENABLED=false
```

## Quick Links

- GitHub: https://github.com/new
- Railway: https://railway.app
- Vercel: https://vercel.com
- UptimeRobot: https://uptimerobot.com
- MongoDB Atlas: https://cloud.mongodb.com

## After Deployment

Test your monitoring endpoints:

```powershell
# Health check (should return 200)
curl https://your-backend.railway.app/api/monitoring/health

# Metrics
curl https://your-backend.railway.app/api/monitoring/metrics

# Full status
curl https://your-backend.railway.app/api/monitoring/status
```

## Success Indicators

✅ Backend health check returns `{"status":"healthy"}`
✅ Frontend loads without errors
✅ Can view menu items
✅ Can add to cart
✅ UptimeRobot shows "Up"
✅ Logs visible in Railway dashboard

## Need Help?

See these guides:
- `DEPLOY_WITH_MONITORING.md` - Detailed walkthrough
- `DEPLOYMENT_STATUS.md` - Current status
- `DEPLOYMENT_TROUBLESHOOTING.md` - Fix issues
- `MONITORING_SETUP.md` - Configure monitoring

## Estimated Time

- Push to GitHub: 2 minutes
- Deploy to Railway: 10 minutes
- Deploy to Vercel: 5 minutes
- Set up monitoring: 5 minutes

**Total: ~25 minutes**
