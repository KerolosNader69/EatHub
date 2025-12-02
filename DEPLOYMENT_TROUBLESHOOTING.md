# Deployment Troubleshooting Guide

Common issues and solutions when deploying Eat Hub to production.

## CORS Errors

### Symptom
Browser console shows:
```
Access to XMLHttpRequest at 'https://backend.railway.app/api/menu' from origin 'https://frontend.vercel.app' has been blocked by CORS policy
```

### Solutions

1. **Check FRONTEND_URL in Railway**
   - Go to Railway → Your Project → Variables
   - Verify `FRONTEND_URL` matches your Vercel URL exactly
   - No trailing slash: ✅ `https://your-app.vercel.app` ❌ `https://your-app.vercel.app/`
   - Save and wait for automatic redeploy

2. **Check CORS Configuration**
   - Verify `backend/server.js` has correct CORS setup
   - Should use `process.env.FRONTEND_URL`

3. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or open in incognito/private window

## Database Connection Issues

### Symptom
Railway logs show:
```
MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster
```

### Solutions

1. **Verify Connection String**
   - Check `MONGODB_URI` in Railway variables
   - Format: `mongodb+srv://username:password@cluster.xxxxx.mongodb.net/eathub?retryWrites=true&w=majority`
   - Ensure password doesn't contain special characters (or URL encode them)
   - Database name should be `/eathub` not `/test`

2. **Check MongoDB Atlas Network Access**
   - MongoDB Atlas → Network Access
   - Ensure 0.0.0.0/0 is in the IP whitelist
   - If not, add it and wait 2-3 minutes

3. **Verify Database User**
   - MongoDB Atlas → Database Access
   - User should have "Read and write to any database" permission
   - Password should be correct (no typos)

4. **Test Connection Locally**
   ```bash
   cd backend
   # Add MONGODB_URI to .env
   node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected!')).catch(err => console.error(err));"
   ```

## Frontend Build Failures

### Symptom
Vercel deployment fails with build errors

### Solutions

1. **Check Build Logs**
   - Vercel → Your Project → Deployments → Click failed deployment
   - Read error messages carefully

2. **Missing Environment Variables**
   - Vercel → Settings → Environment Variables
   - Ensure `VITE_API_URL` is set
   - Format: `https://your-backend.railway.app/api` (with `/api`)

3. **Dependency Issues**
   - Ensure all dependencies are in `frontend/package.json`
   - Not in `devDependencies` if needed for build

4. **Test Build Locally**
   ```bash
   cd frontend
   npm run build
   ```
   - If it fails locally, fix errors first
   - If it works locally but fails on Vercel, check Node version

5. **Node Version Mismatch**
   - Add to `frontend/package.json`:
   ```json
   "engines": {
     "node": ">=16.0.0"
   }
   ```

## Backend Deployment Failures

### Symptom
Railway deployment fails or crashes immediately

### Solutions

1. **Check Railway Logs**
   - Railway → Your Project → Deployments → View Logs
   - Look for error messages

2. **Missing Environment Variables**
   - Railway → Variables tab
   - Ensure all required variables are set:
     - `NODE_ENV=production`
     - `PORT=5000`
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `JWT_EXPIRE`
     - `FRONTEND_URL`

3. **Port Configuration**
   - Railway automatically assigns a port
   - Ensure `backend/server.js` uses `process.env.PORT`
   - Should be: `const PORT = process.env.PORT || 5000;`

4. **Start Command**
   - Railway should use `npm start`
   - Verify `package.json` has: `"start": "node server.js"`

5. **Test Locally**
   ```bash
   cd backend
   NODE_ENV=production npm start
   ```

## API Not Responding

### Symptom
Frontend loads but API calls fail with network errors

### Solutions

1. **Verify Backend is Running**
   - Visit `https://your-backend.railway.app/api/health`
   - Should return JSON with status

2. **Check API URL in Frontend**
   - Vercel → Settings → Environment Variables
   - `VITE_API_URL` should be: `https://your-backend.railway.app/api`
   - Must include `/api` at the end

3. **Redeploy Frontend**
   - After changing environment variables
   - Vercel → Deployments → Click "..." → Redeploy

4. **Check Railway Status**
   - Railway dashboard shows if service is running
   - Green = running, Red = crashed

## Admin Login Not Working

### Symptom
Cannot log in with admin credentials

### Solutions

1. **Verify Admin User Exists**
   - MongoDB Atlas → Browse Collections
   - Check `users` collection
   - Should have document with `role: "admin"`

2. **Check Password Hash**
   - Password should be bcrypt hash (starts with `$2b$`)
   - Not plain text password

3. **Recreate Admin User**
   ```bash
   cd backend
   # Set MONGODB_URI in .env
   node scripts/createAdminUser.js admin NewPassword123!
   ```

4. **Check JWT_SECRET**
   - Railway → Variables
   - Ensure `JWT_SECRET` is set and not empty

5. **Check Browser Console**
   - Look for specific error messages
   - 401 = wrong credentials
   - 500 = server error

## Images Not Loading

### Symptom
Menu item images show broken image icon

### Solutions

1. **Check Upload Directory**
   - Railway doesn't persist uploaded files
   - Use cloud storage (AWS S3, Cloudinary) for production
   - Or re-upload images after each deployment

2. **Temporary Solution**
   - Upload images through admin panel after deployment
   - Note: Will be lost on next deployment

3. **Permanent Solution**
   - Implement cloud storage integration
   - Update `backend/controllers/menuController.js`
   - Use Cloudinary or AWS S3

## Slow Performance

### Symptom
Application is slow or times out

### Solutions

1. **Check Free Tier Limits**
   - MongoDB Atlas M0: 512 MB storage
   - Railway: Limited CPU/RAM on free tier
   - Vercel: 100 GB bandwidth

2. **Optimize Database Queries**
   - Add indexes to frequently queried fields
   - Limit query results

3. **Enable Caching**
   - Frontend already has service worker
   - Consider Redis for backend caching

4. **Upgrade Plans**
   - If hitting limits, upgrade to paid tiers

## Environment Variables Not Working

### Symptom
Application can't read environment variables

### Solutions

1. **Frontend Variables Must Start with VITE_**
   - ✅ `VITE_API_URL`
   - ❌ `API_URL`

2. **Redeploy After Adding Variables**
   - Changes don't apply to existing deployments
   - Trigger new deployment

3. **Check Variable Names**
   - No typos
   - Case-sensitive
   - No extra spaces

4. **Verify in Build Logs**
   - Some platforms show variables in logs
   - Check they're being loaded

## SSL/HTTPS Issues

### Symptom
Mixed content warnings or SSL errors

### Solutions

1. **Use HTTPS URLs**
   - Both Railway and Vercel provide HTTPS automatically
   - Ensure `VITE_API_URL` uses `https://` not `http://`

2. **Check Browser Console**
   - Look for mixed content warnings
   - All resources should use HTTPS

3. **Update Hardcoded URLs**
   - Search codebase for `http://`
   - Replace with `https://` or use environment variables

## Deployment Takes Too Long

### Symptom
Deployments take 5+ minutes

### Solutions

1. **Check Build Logs**
   - Look for what's taking time
   - Usually dependency installation

2. **Optimize Dependencies**
   - Remove unused packages
   - Use `npm ci` instead of `npm install` (Railway does this automatically)

3. **Use Build Cache**
   - Both platforms cache dependencies
   - Should be faster after first deployment

## Can't Access Admin Dashboard

### Symptom
404 error when visiting `/admin/login`

### Solutions

1. **Check Vercel Routing**
   - Ensure `vercel.json` has rewrite rules
   - Should redirect all routes to `index.html`

2. **Verify React Router**
   - Check `frontend/src/App.jsx` has admin routes
   - Should have `/admin/login` route

3. **Clear Browser Cache**
   - Hard refresh or incognito mode

## Database Data Lost

### Symptom
Menu items or orders disappear

### Solutions

1. **Check MongoDB Atlas**
   - Data should persist in Atlas
   - Verify you're looking at correct cluster/database

2. **Set Up Backups**
   - MongoDB Atlas → Backup
   - Enable automatic backups (available on paid tiers)

3. **Export Data Regularly**
   - MongoDB Atlas → Collections → Export
   - Keep local backups

## Getting Help

If you're still stuck:

1. **Check Platform Status**
   - [Railway Status](https://status.railway.app/)
   - [Vercel Status](https://www.vercel-status.com/)
   - [MongoDB Atlas Status](https://status.mongodb.com/)

2. **Review Logs**
   - Railway: Deployment logs
   - Vercel: Build and function logs
   - Browser: Console and Network tab

3. **Search Documentation**
   - [Railway Docs](https://docs.railway.app/)
   - [Vercel Docs](https://vercel.com/docs)
   - [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)

4. **Community Support**
   - Railway Discord
   - Vercel Discord
   - Stack Overflow

## Prevention Checklist

Avoid issues by following these practices:

- ✅ Test locally before deploying
- ✅ Use environment variables for all config
- ✅ Keep `.env` files in `.gitignore`
- ✅ Document all environment variables
- ✅ Monitor application logs regularly
- ✅ Set up alerts for errors
- ✅ Keep dependencies updated
- ✅ Test in production-like environment
- ✅ Have rollback plan ready
- ✅ Back up database regularly
