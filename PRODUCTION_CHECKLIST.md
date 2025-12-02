# Production Deployment Checklist

Use this checklist to ensure your Eat Hub application is properly configured for production deployment.

## Pre-Deployment

### Code Preparation
- [ ] All code is committed to Git repository
- [ ] Repository is pushed to GitHub
- [ ] `.env` files are in `.gitignore` (not committed)
- [ ] All tests are passing locally
- [ ] Build process works locally (`npm run build` in frontend)
- [ ] Backend starts without errors (`npm start` in backend)

### Environment Files
- [ ] Created `.env.production` for backend (based on `.env.production.example`)
- [ ] Created `.env.production` for frontend (based on `.env.production.example`)
- [ ] Generated strong JWT_SECRET using crypto
- [ ] Verified all required environment variables are documented

## Database Setup (MongoDB Atlas)

- [ ] Created MongoDB Atlas account
- [ ] Created new cluster (M0 free tier)
- [ ] Created database user with strong password
- [ ] Saved database credentials securely
- [ ] Configured network access (0.0.0.0/0 for cloud hosting)
- [ ] Obtained connection string
- [ ] Replaced `<password>` in connection string
- [ ] Added database name to connection string (`/eathub`)
- [ ] Tested connection string locally (optional)

## Backend Deployment (Railway)

- [ ] Created Railway account
- [ ] Connected GitHub repository to Railway
- [ ] Created new project from GitHub repo
- [ ] Configured root directory as `backend`
- [ ] Added environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5000`
  - [ ] `MONGODB_URI` (from MongoDB Atlas)
  - [ ] `JWT_SECRET` (generated strong secret)
  - [ ] `JWT_EXPIRE=24h`
  - [ ] `FRONTEND_URL` (placeholder, will update after frontend deployment)
- [ ] Verified deployment succeeded
- [ ] Copied Railway public URL
- [ ] Tested health endpoint: `https://your-app.railway.app/api/health`
- [ ] Tested menu endpoint: `https://your-app.railway.app/api/menu`

## Frontend Deployment (Vercel)

- [ ] Created Vercel account
- [ ] Connected GitHub repository to Vercel
- [ ] Imported project from GitHub
- [ ] Configured build settings:
  - [ ] Framework: Vite
  - [ ] Root Directory: `frontend`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
- [ ] Added environment variables:
  - [ ] `VITE_API_URL` (Railway backend URL + `/api`)
  - [ ] `VITE_APP_NAME=Eat Hub`
- [ ] Verified deployment succeeded
- [ ] Copied Vercel public URL
- [ ] Tested frontend loads correctly
- [ ] Verified intro sequence plays

## CORS Configuration

- [ ] Returned to Railway project
- [ ] Updated `FRONTEND_URL` environment variable with Vercel URL
- [ ] Verified Railway redeployed automatically
- [ ] Tested frontend can communicate with backend
- [ ] Checked browser console for CORS errors (should be none)

## Admin User Setup

Choose one method:

### Method A: Using Script (Recommended)
- [ ] Set production `MONGODB_URI` in backend `.env`
- [ ] Run: `node backend/scripts/createAdminUser.js admin YourPassword123!`
- [ ] Verified admin user created successfully
- [ ] Saved admin credentials securely

### Method B: Manual MongoDB Atlas
- [ ] Generated password hash using `node backend/scripts/hashPassword.js YourPassword`
- [ ] Opened MongoDB Atlas > Browse Collections
- [ ] Created `users` collection
- [ ] Inserted admin user document with hashed password
- [ ] Verified document created successfully

## Testing Production Deployment

### Frontend Tests
- [ ] Visited Vercel URL
- [ ] Intro sequence loads and plays
- [ ] Navigation works (Home, Menu, Cart, etc.)
- [ ] No console errors
- [ ] Images load correctly
- [ ] Responsive design works on mobile

### Backend Tests
- [ ] Health endpoint responds: `/api/health`
- [ ] Menu endpoint responds: `/api/menu`
- [ ] Auth endpoint responds: `/api/auth/login`
- [ ] No errors in Railway logs

### Admin Flow Tests
- [ ] Can access admin login page
- [ ] Can log in with admin credentials
- [ ] Admin dashboard loads
- [ ] Can add new menu item
- [ ] Can upload menu item image
- [ ] Can edit menu item
- [ ] Can delete menu item
- [ ] Can view orders (empty initially)

### User Flow Tests
- [ ] Menu page displays added items
- [ ] Can view menu item details
- [ ] Can add items to cart
- [ ] Cart updates correctly
- [ ] Can proceed to checkout
- [ ] Can fill out checkout form
- [ ] Can place order
- [ ] Order confirmation page displays
- [ ] Can check order status
- [ ] Order appears in admin dashboard

### Performance Tests
- [ ] Page load time is acceptable (< 3 seconds)
- [ ] Images load efficiently
- [ ] No memory leaks in browser
- [ ] API responses are fast (< 500ms)

## Security Verification

- [ ] HTTPS is enabled (automatic with Railway and Vercel)
- [ ] JWT_SECRET is strong and unique
- [ ] Database credentials are not exposed
- [ ] CORS is configured for specific domain only
- [ ] Admin password is strong
- [ ] No sensitive data in client-side code
- [ ] Environment variables are not in repository
- [ ] API endpoints require authentication where appropriate

## Monitoring Setup

- [ ] Bookmarked Railway dashboard for backend logs
- [ ] Bookmarked Vercel dashboard for frontend logs
- [ ] Bookmarked MongoDB Atlas for database metrics
- [ ] Set up email notifications for deployment failures (optional)
- [ ] Configured error tracking service (optional, e.g., Sentry)

## Documentation

- [ ] Updated README with production URLs
- [ ] Documented deployment process
- [ ] Saved all credentials in secure password manager
- [ ] Created runbook for common issues
- [ ] Documented environment variables

## Post-Deployment

- [ ] Announced deployment to stakeholders
- [ ] Shared production URLs
- [ ] Provided admin credentials to authorized users
- [ ] Set up regular database backups (optional)
- [ ] Scheduled first maintenance window (optional)

## Ongoing Maintenance

- [ ] Monitor application logs weekly
- [ ] Check database storage usage monthly
- [ ] Review Railway and Vercel usage/costs monthly
- [ ] Update dependencies quarterly
- [ ] Test backup restoration process quarterly
- [ ] Review and rotate secrets annually

## Rollback Plan

In case of critical issues:

1. **Frontend Issues:**
   - [ ] Revert to previous deployment in Vercel dashboard
   - [ ] Or redeploy from previous Git commit

2. **Backend Issues:**
   - [ ] Revert to previous deployment in Railway dashboard
   - [ ] Or redeploy from previous Git commit

3. **Database Issues:**
   - [ ] Restore from MongoDB Atlas backup
   - [ ] Or manually fix data using MongoDB Atlas interface

## Support Contacts

- **Railway Support:** https://railway.app/help
- **Vercel Support:** https://vercel.com/support
- **MongoDB Atlas Support:** https://www.mongodb.com/support

## Notes

Add any deployment-specific notes or issues encountered:

```
[Your notes here]
```

---

**Deployment Date:** _________________

**Deployed By:** _________________

**Production URLs:**
- Frontend: _________________
- Backend: _________________
- Database: _________________
