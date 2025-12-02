# Eat Hub - Complete Deployment Instructions

## Overview

This document provides step-by-step instructions to deploy the Eat Hub application to production. The deployment uses free-tier services and can be completed in approximately 30-45 minutes.

## Deployment Architecture

- **Frontend**: Vercel (React/Vite application)
- **Backend**: Railway (Node.js/Express API)
- **Database**: MongoDB Atlas (Cloud database)

## Prerequisites

Before starting, ensure you have:
- [ ] GitHub account with your code repository
- [ ] All code committed and pushed to GitHub
- [ ] Email address for creating accounts

## Step 1: Database Setup (MongoDB Atlas)

### 1.1 Create MongoDB Atlas Account

1. Visit [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" and sign up with your email
3. Complete the registration process

### 1.2 Create Database Cluster

1. After login, click "Build a Database"
2. Select **M0 FREE** tier
3. Choose your preferred cloud provider (AWS recommended)
4. Select a region close to your users
5. Cluster Name: `EatHubCluster` (or keep default)
6. Click "Create Cluster" (takes 3-5 minutes)

### 1.3 Configure Database Access

1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Authentication Method: **Password**
4. Username: `eathub_admin` (or your choice)
5. Password: Click "Autogenerate Secure Password" and **SAVE IT SECURELY**
6. Database User Privileges: **Read and write to any database**
7. Click "Add User"

### 1.4 Configure Network Access

1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (adds 0.0.0.0/0)
4. Click "Confirm"

### 1.5 Get Connection String

1. Go back to "Database" in the left sidebar
2. Click "Connect" button on your cluster
3. Select "Connect your application"
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://eathub_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name at the end:
   ```
   mongodb+srv://eathub_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/eathub?retryWrites=true&w=majority
   ```
8. **SAVE THIS CONNECTION STRING** - you'll need it for backend deployment

## Step 2: Backend Deployment (Railway)

### 2.1 Create Railway Account

1. Visit [https://railway.app](https://railway.app)
2. Click "Login" and sign in with GitHub
3. Authorize Railway to access your GitHub account

### 2.2 Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your Eat Hub repository
4. Railway will automatically detect it's a Node.js project

### 2.3 Configure Build Settings

1. After project creation, click on the service
2. Go to "Settings" tab
3. **Root Directory**: Leave empty (Railway will auto-detect)
4. **Build Command**: `npm install` (auto-detected)
5. **Start Command**: `npm start` (auto-detected)

### 2.4 Set Environment Variables

1. Go to "Variables" tab
2. Click "New Variable" and add each of the following:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=<paste-your-mongodb-connection-string-here>
JWT_SECRET=<generate-below>
JWT_EXPIRE=24h
FRONTEND_URL=https://temporary-placeholder.com
```

**To generate JWT_SECRET:**
- Open a terminal on your local machine
- Run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- Copy the output and use it as JWT_SECRET

3. Click "Deploy" or wait for automatic deployment

### 2.5 Get Backend URL

1. Go to "Settings" tab
2. Scroll to "Domains" section
3. Railway provides a URL like: `https://your-app-name.up.railway.app`
4. **SAVE THIS URL** - you'll need it for frontend deployment
5. Test it by visiting: `https://your-app-name.up.railway.app/api/health`
   - Should return JSON with status "healthy"

## Step 3: Frontend Deployment (Vercel)

### 3.1 Create Vercel Account

1. Visit [https://vercel.com](https://vercel.com)
2. Click "Sign Up" and sign in with GitHub
3. Authorize Vercel to access your GitHub account

### 3.2 Import Project

1. Click "Add New..." → "Project"
2. Find and select your Eat Hub repository
3. Click "Import"

### 3.3 Configure Build Settings

1. **Framework Preset**: Vite (should auto-detect)
2. **Root Directory**: Click "Edit" and enter `frontend`
3. **Build Command**: `npm run build` (auto-detected)
4. **Output Directory**: `dist` (auto-detected)
5. **Install Command**: `npm install` (auto-detected)

### 3.4 Set Environment Variables

1. Expand "Environment Variables" section
2. Add the following variables:

```
VITE_API_URL=<your-railway-backend-url>/api
VITE_APP_NAME=Eat Hub
```

Example:
```
VITE_API_URL=https://your-app-name.up.railway.app/api
VITE_APP_NAME=Eat Hub
```

3. Click "Deploy"
4. Wait for deployment to complete (2-3 minutes)

### 3.5 Get Frontend URL

1. After deployment, Vercel shows your URL
2. It will be like: `https://your-app-name.vercel.app`
3. **SAVE THIS URL**
4. Click "Visit" to see your deployed application

## Step 4: Update CORS Configuration

### 4.1 Update Backend Environment Variable

1. Go back to Railway dashboard
2. Open your backend project
3. Go to "Variables" tab
4. Find `FRONTEND_URL` variable
5. Update it with your Vercel URL (e.g., `https://your-app-name.vercel.app`)
6. **Important**: No trailing slash!
7. Railway will automatically redeploy (takes 1-2 minutes)

### 4.2 Verify CORS

1. Visit your Vercel frontend URL
2. Open browser Developer Tools (F12)
3. Go to Console tab
4. Navigate through the app
5. Verify there are no CORS errors

## Step 5: Create Initial Admin User

You have two options to create an admin user:

### Option A: Using the Creation Script (Recommended)

1. On your local machine, navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a temporary `.env` file with your production MongoDB URI:
   ```bash
   echo "MONGODB_URI=<your-production-mongodb-uri>" > .env.temp
   ```

3. Run the admin creation script:
   ```bash
   node scripts/createAdminUser.js admin YourSecurePassword123!
   ```
   Replace `YourSecurePassword123!` with a strong password

4. Delete the temporary file:
   ```bash
   rm .env.temp
   ```

### Option B: Manual Creation via MongoDB Atlas

1. Generate a password hash locally:
   ```bash
   cd backend
   node scripts/hashPassword.js YourSecurePassword123!
   ```
   Copy the hash output

2. Go to MongoDB Atlas dashboard
3. Click "Browse Collections"
4. Click "Create Database"
   - Database name: `eathub`
   - Collection name: `users`
5. Click on the `users` collection
6. Click "Insert Document"
7. Switch to "JSON View" and paste:
   ```json
   {
     "username": "admin",
     "password": "<paste-your-hash-here>",
     "role": "admin",
     "createdAt": {"$date": "2024-12-02T00:00:00.000Z"},
     "updatedAt": {"$date": "2024-12-02T00:00:00.000Z"}
   }
   ```
8. Click "Insert"

## Step 6: Test Production Deployment

### 6.1 Test Frontend

1. Visit your Vercel URL
2. Verify:
   - [ ] Intro sequence plays
   - [ ] Navigation works
   - [ ] No console errors
   - [ ] Pages load correctly

### 6.2 Test Backend API

1. Test health endpoint:
   - Visit: `https://your-railway-url/api/health`
   - Should return JSON with status "healthy"

2. Test menu endpoint:
   - Visit: `https://your-railway-url/api/menu`
   - Should return empty array `[]` initially

### 6.3 Test Admin Login

1. Go to: `https://your-vercel-url/admin/login`
2. Enter your admin credentials
3. Verify you can access the admin dashboard

### 6.4 Test Complete User Flow

1. **Add Menu Items** (as admin):
   - Log in to admin dashboard
   - Click "Menu Management"
   - Add a test menu item with image
   - Verify it saves successfully

2. **Browse Menu** (as customer):
   - Go to main menu page
   - Verify menu item appears
   - Click on item to view details

3. **Place Order** (as customer):
   - Add items to cart
   - Proceed to checkout
   - Fill out delivery information
   - Submit order
   - Verify order confirmation appears

4. **Manage Orders** (as admin):
   - Go to admin dashboard
   - Click "Order Management"
   - Verify order appears
   - Update order status
   - Verify status updates

## Step 7: Custom Domain Setup (Optional)

### 7.1 Configure Custom Domain on Vercel

1. Purchase a domain from a registrar (Namecheap, GoDaddy, etc.)
2. In Vercel project settings, go to "Domains"
3. Click "Add Domain"
4. Enter your domain (e.g., `eathub.com`)
5. Follow Vercel's instructions to update DNS records
6. Wait for DNS propagation (can take up to 48 hours)

### 7.2 Update Backend CORS

1. After domain is active, go to Railway
2. Update `FRONTEND_URL` to your custom domain
3. Wait for automatic redeploy

### 7.3 SSL Certificate

- Vercel automatically provisions SSL certificates
- Your site will be accessible via HTTPS
- No additional configuration needed

## Deployment Complete! 🎉

Your Eat Hub application is now live!

### Your Production URLs

- **Frontend**: `https://your-app-name.vercel.app`
- **Backend API**: `https://your-app-name.up.railway.app`
- **Admin Panel**: `https://your-app-name.vercel.app/admin/login`

### Save These Credentials Securely

- MongoDB Atlas username: `_____________`
- MongoDB Atlas password: `_____________`
- Admin username: `_____________`
- Admin password: `_____________`
- JWT Secret: `_____________`

## Monitoring and Maintenance

### Check Application Health

1. **Railway Logs** (Backend):
   - Go to Railway dashboard
   - Click on your project
   - View "Deployments" tab for logs

2. **Vercel Logs** (Frontend):
   - Go to Vercel dashboard
   - Click on your project
   - View "Deployments" for build logs

3. **MongoDB Metrics**:
   - Go to MongoDB Atlas
   - View "Metrics" tab for database performance

### Automatic Deployments

Both Railway and Vercel support automatic deployments:
- Push code to GitHub `main` branch
- Platforms automatically detect changes
- Applications redeploy automatically
- Monitor deployment status in dashboards

### Free Tier Limits

- **MongoDB Atlas M0**: 512 MB storage, shared resources
- **Railway**: $5 free credit/month (~500 hours)
- **Vercel**: 100 GB bandwidth/month, unlimited deployments

## Troubleshooting

### CORS Errors

**Symptom**: Browser console shows CORS policy errors

**Solution**:
1. Verify `FRONTEND_URL` in Railway matches Vercel URL exactly
2. Ensure no trailing slash in URL
3. Check Railway logs for CORS configuration
4. Redeploy backend if needed

### Database Connection Failed

**Symptom**: Backend logs show MongoDB connection errors

**Solution**:
1. Verify MongoDB connection string is correct
2. Check password doesn't contain special characters that need encoding
3. Verify IP whitelist includes 0.0.0.0/0
4. Test connection string locally

### Build Failures

**Frontend Build Failed**:
1. Check Vercel build logs for specific errors
2. Verify all dependencies are in `package.json`
3. Ensure environment variables are set correctly
4. Try building locally: `cd frontend && npm run build`

**Backend Deployment Failed**:
1. Check Railway logs for errors
2. Verify `package.json` has correct start script
3. Ensure all environment variables are set
4. Test locally: `cd backend && npm start`

### Admin Login Not Working

**Solution**:
1. Verify admin user exists in MongoDB Atlas
2. Check password hash was generated correctly
3. Verify JWT_SECRET is set in Railway
4. Check backend logs for authentication errors

### Images Not Loading

**Solution**:
1. Verify images are uploaded correctly
2. Check Railway logs for file upload errors
3. Ensure `uploads` directory exists
4. Verify image URLs in database

## Support Resources

- **Railway Documentation**: [https://docs.railway.app](https://docs.railway.app)
- **Vercel Documentation**: [https://vercel.com/docs](https://vercel.com/docs)
- **MongoDB Atlas Documentation**: [https://docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

## Next Steps

1. [ ] Add more menu items
2. [ ] Test with real orders
3. [ ] Share URL with stakeholders
4. [ ] Set up monitoring alerts
5. [ ] Plan for scaling if needed
6. [ ] Consider custom domain
7. [ ] Set up regular database backups

---

**Deployment Date**: _______________

**Deployed By**: _______________

**Notes**:
```
[Add any deployment-specific notes here]
```
