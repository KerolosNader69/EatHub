# Eat Hub - Production Deployment Steps

## Overview

This document provides the actual deployment steps for Task 17.2. Follow these steps to deploy the Eat Hub application to production.

**Estimated Time**: 30-45 minutes  
**Cost**: $0/month (free tier)

## Prerequisites Checklist

Before starting deployment:

- [ ] All code is committed to Git
- [ ] Code is pushed to GitHub repository
- [ ] You have a GitHub account
- [ ] You have an email address for creating accounts

## Deployment Architecture

- **Database**: MongoDB Atlas (Free M0 tier)
- **Backend API**: Railway (Free tier with $5 credit/month)
- **Frontend**: Vercel (Free tier)

---

## Step 1: Build and Test Locally

### 1.1 Test Backend Build

```bash
cd backend
npm install
npm start
```

Verify the server starts without errors. Press Ctrl+C to stop.

### 1.2 Test Frontend Build

```bash
cd frontend
npm install
npm run build
```

Verify the build completes successfully.

### 1.3 Run Pre-Deployment Script

**Windows:**
```powershell
.\deploy.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Step 2: Deploy Database (MongoDB Atlas)

### 2.1 Create MongoDB Atlas Account

1. Visit: https://www.mongodb.com/cloud/atlas
2. Click "Try Free" and sign up
3. Verify your email

### 2.2 Create Database Cluster

1. Click "Build a Database"
2. Select **M0 FREE** tier
3. Choose **AWS** as provider
4. Select region closest to your users
5. Cluster Name: `EatHubCluster`
6. Click "Create Cluster" (takes 3-5 minutes)

### 2.3 Configure Database Access

1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Username: `eathub_admin`
4. Click "Autogenerate Secure Password"
5. **SAVE THE PASSWORD SECURELY**
6. Privileges: "Read and write to any database"
7. Click "Add User"

### 2.4 Configure Network Access

1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 2.5 Get Connection String

1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Select "Connect your application"
4. Driver: Node.js, Version: 5.5 or later
5. Copy the connection string
6. Replace `<password>` with your actual password
7. Add database name: `/eathub` before the `?`

**Example:**
```
mongodb+srv://eathub_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/eathub?retryWrites=true&w=majority
```

**SAVE THIS CONNECTION STRING** - you'll need it for Railway.

---

## Step 3: Deploy Backend API (Railway)

### 3.1 Create Railway Account

1. Visit: https://railway.app
2. Click "Login"
3. Sign in with GitHub
4. Authorize Railway

### 3.2 Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your Eat Hub repository
4. Railway auto-detects Node.js project

### 3.3 Configure Service

1. Click on the deployed service
2. Go to "Settings" tab
3. Verify:
   - Root Directory: (empty - auto-detected)
   - Build Command: `npm install`
   - Start Command: `npm start`

### 3.4 Set Environment Variables

1. Go to "Variables" tab
2. Click "New Variable" for each:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=<paste-your-mongodb-connection-string>
JWT_SECRET=<generate-using-command-below>
JWT_EXPIRE=24h
FRONTEND_URL=https://temporary-placeholder.com
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

3. Save all variables
4. Railway will automatically deploy

### 3.5 Get Backend URL

1. Go to "Settings" tab
2. Scroll to "Domains" section
3. Railway provides: `https://your-app-name.up.railway.app`
4. **SAVE THIS URL**

### 3.6 Test Backend

Visit: `https://your-app-name.up.railway.app/api/health`

Should return:
```json
{
  "status": "healthy",
  "environment": "production",
  "uptime": 123
}
```

---

## Step 4: Deploy Frontend (Vercel)

### 4.1 Create Vercel Account

1. Visit: https://vercel.com
2. Click "Sign Up"
3. Sign in with GitHub
4. Authorize Vercel

### 4.2 Import Project

1. Click "Add New..." → "Project"
2. Find your Eat Hub repository
3. Click "Import"

### 4.3 Configure Build Settings

1. Framework Preset: **Vite** (auto-detected)
2. Root Directory: Click "Edit" → Enter `frontend`
3. Build Command: `npm run build` (auto-detected)
4. Output Directory: `dist` (auto-detected)
5. Install Command: `npm install` (auto-detected)

### 4.4 Set Environment Variables

1. Expand "Environment Variables"
2. Add these variables:

```
VITE_API_URL=<your-railway-url>/api
VITE_APP_NAME=Eat Hub
```

**Example:**
```
VITE_API_URL=https://your-app-name.up.railway.app/api
VITE_APP_NAME=Eat Hub
```

3. Click "Deploy"
4. Wait 2-3 minutes for deployment

### 4.5 Get Frontend URL

1. After deployment completes
2. Vercel shows: `https://your-app-name.vercel.app`
3. **SAVE THIS URL**
4. Click "Visit" to see your app

---

## Step 5: Update CORS Configuration

### 5.1 Update Railway Environment Variable

1. Go back to Railway dashboard
2. Open your backend project
3. Go to "Variables" tab
4. Find `FRONTEND_URL`
5. Update with your Vercel URL: `https://your-app-name.vercel.app`
6. **No trailing slash!**
7. Railway automatically redeploys (1-2 minutes)

### 5.2 Verify CORS

1. Visit your Vercel frontend URL
2. Open browser DevTools (F12)
3. Go to Console tab
4. Navigate through the app
5. Verify no CORS errors appear

---

## Step 6: Create Initial Admin User

### Option A: Using Creation Script (Recommended)

1. On your local machine:

```bash
cd backend
```

2. Set MongoDB URI temporarily:

**Windows:**
```powershell
$env:MONGODB_URI="<your-production-mongodb-uri>"
node scripts/createAdminUser.js admin YourSecurePassword123!
```

**Linux/Mac:**
```bash
export MONGODB_URI="<your-production-mongodb-uri>"
node scripts/createAdminUser.js admin YourSecurePassword123!
```

3. Replace `YourSecurePassword123!` with a strong password
4. **SAVE THE PASSWORD SECURELY**

### Option B: Manual Creation via MongoDB Atlas

1. Generate password hash locally:

```bash
cd backend
node scripts/hashPassword.js YourSecurePassword123!
```

2. Copy the hash output
3. Go to MongoDB Atlas dashboard
4. Click "Browse Collections"
5. If database doesn't exist, click "Create Database":
   - Database: `eathub`
   - Collection: `users`
6. Click on `users` collection
7. Click "Insert Document"
8. Switch to "JSON View"
9. Paste:

```json
{
  "username": "admin",
  "password": "<paste-hash-here>",
  "role": "admin",
  "createdAt": {"$date": "2024-12-02T00:00:00.000Z"},
  "updatedAt": {"$date": "2024-12-02T00:00:00.000Z"}
}
```

10. Click "Insert"

---

## Step 7: Test Production Deployment

### 7.1 Run Verification Script

```bash
node verify-deployment.js https://your-railway-url https://your-vercel-url
```

**Example:**
```bash
node verify-deployment.js https://eat-hub-production.up.railway.app https://eat-hub.vercel.app
```

### 7.2 Test Admin Login

1. Visit: `https://your-vercel-url/admin/login`
2. Enter admin credentials
3. Verify you can access admin dashboard

### 7.3 Test Complete User Flow

**As Admin:**
1. Log in to admin panel
2. Go to "Menu Management"
3. Add a test menu item with image
4. Verify it saves successfully
5. Toggle availability on/off

**As Customer:**
1. Visit main site
2. Watch intro sequence
3. Browse menu (should see test item)
4. Click item to view details
5. Add to cart
6. Proceed to checkout
7. Fill delivery information
8. Submit order
9. Verify order confirmation appears
10. Note order number

**As Admin:**
1. Go to "Order Management"
2. Verify order appears
3. Update order status
4. Verify status changes

### 7.4 Test on Mobile

1. Open site on mobile device
2. Verify responsive layout
3. Test touch interactions
4. Verify all features work

---

## Step 8: Set Up Custom Domain (Optional)

### 8.1 Purchase Domain

1. Buy domain from registrar (Namecheap, GoDaddy, etc.)
2. Example: `eathub.com`

### 8.2 Configure Vercel Domain

1. In Vercel project settings
2. Go to "Domains" tab
3. Click "Add Domain"
4. Enter your domain
5. Follow DNS configuration instructions
6. Wait for DNS propagation (up to 48 hours)

### 8.3 Update Backend CORS

1. After domain is active
2. Go to Railway
3. Update `FRONTEND_URL` to custom domain
4. Wait for redeploy

### 8.4 SSL Certificate

- Vercel automatically provisions SSL
- Your site will be HTTPS
- No additional configuration needed

---

## Deployment Complete! 🎉

### Your Production URLs

Record your URLs:

- **Frontend**: `https://_____________________________.vercel.app`
- **Backend**: `https://_____________________________.up.railway.app`
- **Admin Panel**: `https://_____________________________.vercel.app/admin/login`

### Save Credentials Securely

Use a password manager to store:

- MongoDB Atlas username
- MongoDB Atlas password
- Admin username
- Admin password
- JWT Secret

### Next Steps

1. [ ] Add real menu items with images
2. [ ] Test with real orders
3. [ ] Share URLs with stakeholders
4. [ ] Monitor application health
5. [ ] Set up database backups (optional)
6. [ ] Configure custom domain (optional)

---

## Monitoring

### Check Application Health

**Railway (Backend):**
- Dashboard → Your Project → Deployments
- View logs for errors
- Monitor resource usage

**Vercel (Frontend):**
- Dashboard → Your Project → Deployments
- View build logs
- Monitor bandwidth usage

**MongoDB Atlas:**
- Dashboard → Metrics
- Monitor database performance
- Check storage usage

### Automatic Deployments

- Push to GitHub `main` branch
- Railway and Vercel auto-deploy
- Monitor deployment status in dashboards

---

## Troubleshooting

### CORS Errors

**Symptom**: Browser console shows CORS errors

**Solution**:
1. Verify `FRONTEND_URL` in Railway matches Vercel URL exactly
2. No trailing slash in URL
3. Redeploy backend if needed

### Database Connection Failed

**Symptom**: Backend logs show MongoDB errors

**Solution**:
1. Verify connection string is correct
2. Check password encoding (special characters)
3. Verify IP whitelist includes 0.0.0.0/0
4. Test connection locally

### Build Failures

**Frontend**:
1. Check Vercel build logs
2. Verify environment variables
3. Test build locally: `cd frontend && npm run build`

**Backend**:
1. Check Railway logs
2. Verify environment variables
3. Test locally: `cd backend && npm start`

### Admin Login Not Working

**Solution**:
1. Verify admin user exists in MongoDB
2. Check password hash
3. Verify JWT_SECRET is set
4. Check backend logs

---

## Support Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Deployment Troubleshooting**: See DEPLOYMENT_TROUBLESHOOTING.md

---

**Deployment Date**: _________________

**Deployed By**: _________________

**Notes**:
```
[Add deployment notes here]
```
