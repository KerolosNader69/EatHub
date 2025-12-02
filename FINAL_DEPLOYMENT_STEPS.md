# Final Deployment Steps

## Current Status
✅ Backend deployed on Railway: `https://eathub-production.up.railway.app`
✅ Frontend deployed on Vercel: `https://eat-hub-q6fs.vercel.app`
✅ MongoDB connected
⚠️ CORS issue - needs Railway to finish redeploying

## Issue
CORS error because Railway backend still has old frontend URL cached.

## Solution

### 1. Wait for Railway Redeploy (2-3 minutes)
After changing `FRONTEND_URL` in Railway, wait for the deployment to complete.

Check Railway deployment status:
- Go to https://railway.app
- Open your project
- Look for "Deploying..." status to change to "Active"

### 2. Create Admin User
Once Railway finishes deploying, create the admin user:

```powershell
cd backend
node createAdmin.js
```

This creates:
- **Username**: `admin`
- **Password**: `admin123`

### 3. Test Login
Go to: `https://eat-hub-q6fs.vercel.app/admin/login`

Login with:
- Username: `admin`
- Password: `admin123`

## If CORS Error Persists

### Option 1: Force Railway Redeploy
1. Go to Railway dashboard
2. Click on your backend service
3. Go to "Deployments" tab
4. Click "Redeploy" on the latest deployment

### Option 2: Verify Environment Variable
1. Go to Railway → Variables tab
2. Confirm `FRONTEND_URL` = `https://eat-hub-q6fs.vercel.app`
3. If wrong, update it and wait for redeploy

### Option 3: Check Vercel Environment Variable
1. Go to Vercel → Settings → Environment Variables
2. Confirm `VITE_API_URL` = `https://eathub-production.up.railway.app/api`
3. If missing or wrong, add/update it
4. Redeploy from Vercel Deployments tab

## Summary

Your full-stack app is deployed! Just waiting for:
1. Railway to finish redeploying with new CORS settings (2-3 min)
2. Admin user to be created in database

Then you can login and start adding menu items!

## Next Steps After Login Works

1. Add menu items through Admin Dashboard
2. Test ordering flow
3. Monitor with the monitoring endpoints we built:
   - Health: `https://eathub-production.up.railway.app/api/monitoring/health`
   - Metrics: `https://eathub-production.up.railway.app/api/monitoring/metrics`
