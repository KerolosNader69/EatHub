# Eat Hub - Deployment Guide

This guide will help you deploy the Eat Hub application to production without requiring a custom domain.

## Prerequisites

- GitHub account (for code repository)
- MongoDB Atlas account (free tier available)
- Vercel account (for frontend hosting - free tier)
- Railway account (for backend hosting - free tier)

## Part 1: Database Setup (MongoDB Atlas)

### 1.1 Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new project called "EatHub"
4. Click "Build a Database"
5. Choose "M0 FREE" tier
6. Select your preferred cloud provider and region
7. Click "Create Cluster"

### 1.2 Configure Database Access

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and strong password (save these!)
5. Set user privileges to "Read and write to any database"
6. Click "Add User"

### 1.3 Configure Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.4 Get Connection String

1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
5. Replace `<password>` with your actual password
6. Add database name: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/eathub?retryWrites=true&w=majority`

## Part 2: Backend Deployment (Railway)

### 2.1 Prepare Backend for Deployment

The backend is already configured for production. Railway will automatically:
- Detect Node.js application
- Install dependencies
- Run `npm start` command

### 2.2 Deploy to Railway

1. Go to [Railway](https://railway.app)
2. Sign up or log in with GitHub
3. Click "New Project"
4. Choose "Deploy from GitHub repo"
5. Select your repository
6. Choose the `backend` folder as the root directory
7. Railway will automatically deploy

### 2.3 Configure Environment Variables

1. In your Railway project, go to "Variables" tab
2. Add the following environment variables:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<generate-a-strong-random-string>
JWT_EXPIRE=24h
FRONTEND_URL=<will-add-after-frontend-deployment>
```

To generate a strong JWT_SECRET, you can use:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2.4 Get Backend URL

1. Railway will provide a public URL (e.g., `https://your-app.up.railway.app`)
2. Copy this URL - you'll need it for frontend configuration

## Part 3: Frontend Deployment (Vercel)

### 3.1 Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up or log in with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure project:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 3.2 Configure Environment Variables

1. In Vercel project settings, go to "Environment Variables"
2. Add the following:

```
VITE_API_URL=<your-railway-backend-url>/api
VITE_APP_NAME=Eat Hub
```

Example: `VITE_API_URL=https://your-app.up.railway.app/api`

3. Click "Deploy"

### 3.3 Get Frontend URL

1. Vercel will provide a URL (e.g., `https://your-app.vercel.app`)
2. Copy this URL

### 3.4 Update Backend CORS Configuration

1. Go back to Railway project
2. Update the `FRONTEND_URL` environment variable with your Vercel URL
3. Railway will automatically redeploy

## Part 4: Create Initial Admin User

### 4.1 Using MongoDB Atlas Interface

1. Go to MongoDB Atlas
2. Click "Browse Collections"
3. Select your database (`eathub`)
4. Click "Create Collection" and name it `users`
5. Click "Insert Document"
6. Add the following document:

```json
{
  "username": "admin",
  "password": "$2b$10$YourHashedPasswordHere",
  "role": "admin",
  "createdAt": {"$date": "2024-12-02T00:00:00.000Z"},
  "updatedAt": {"$date": "2024-12-02T00:00:00.000Z"}
}
```

### 4.2 Generate Hashed Password

To generate a bcrypt hash for your password, create a temporary script:

```javascript
// hashPassword.js
const bcrypt = require('bcrypt');
const password = 'YourSecurePassword123!';
bcrypt.hash(password, 10).then(hash => console.log(hash));
```

Run locally:
```bash
cd backend
node hashPassword.js
```

Copy the output hash and use it in the MongoDB document above.

## Part 5: Testing Production Deployment

### 5.1 Test Frontend

1. Visit your Vercel URL
2. Verify the intro sequence loads
3. Check that menu items load (will be empty initially)
4. Test navigation between pages

### 5.2 Test Backend API

1. Visit `<your-railway-url>/api/health` (should return health status)
2. Visit `<your-railway-url>/api/menu` (should return empty array initially)

### 5.3 Test Admin Login

1. Go to `<your-vercel-url>/admin/login`
2. Log in with your admin credentials
3. Verify you can access the admin dashboard

### 5.4 Test Full Flow

1. Add menu items via admin dashboard
2. View menu items on the main menu page
3. Add items to cart
4. Complete checkout process
5. Check order status
6. Manage orders in admin dashboard

## Part 6: Monitoring and Maintenance

### 6.1 Monitor Application

- **Railway**: Check logs in the "Deployments" tab
- **Vercel**: Check logs in the "Deployments" section
- **MongoDB Atlas**: Monitor database metrics in the "Metrics" tab

### 6.2 Automatic Deployments

Both Railway and Vercel support automatic deployments:
- Push to your GitHub repository
- Platforms automatically detect changes and redeploy
- Frontend and backend deploy independently

### 6.3 Environment-Specific Branches

Consider setting up:
- `main` branch → Production deployment
- `staging` branch → Staging environment (optional)
- `dev` branch → Development (local only)

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:
1. Verify `FRONTEND_URL` in Railway matches your Vercel URL exactly
2. Ensure no trailing slashes
3. Check Railway logs for CORS-related messages

### Database Connection Issues

If backend can't connect to MongoDB:
1. Verify MongoDB Atlas connection string is correct
2. Check that IP whitelist includes 0.0.0.0/0
3. Ensure database user has correct permissions
4. Check Railway logs for connection errors

### Build Failures

**Frontend build fails:**
1. Check Vercel build logs
2. Verify all dependencies are in `package.json`
3. Ensure environment variables are set

**Backend deployment fails:**
1. Check Railway logs
2. Verify `package.json` has correct start script
3. Ensure all required environment variables are set

### API Not Responding

1. Check Railway deployment status
2. Verify backend URL is correct in frontend env vars
3. Check Railway logs for errors
4. Test API endpoints directly using browser or Postman

## Security Checklist

- ✅ Strong JWT_SECRET generated
- ✅ MongoDB Atlas network access configured
- ✅ Admin password is strong and hashed
- ✅ CORS configured for specific frontend domain
- ✅ Environment variables not committed to repository
- ✅ HTTPS enabled (automatic with Railway and Vercel)

## Cost Considerations

**Free Tier Limits:**
- **MongoDB Atlas M0**: 512 MB storage, shared RAM
- **Railway**: $5 free credit per month, ~500 hours
- **Vercel**: 100 GB bandwidth, unlimited deployments

For production use with real traffic, consider upgrading to paid tiers.

## Next Steps

1. Set up custom domain (optional)
2. Configure email notifications for orders
3. Set up monitoring and alerting
4. Implement backup strategy for database
5. Add analytics tracking
6. Set up error tracking (e.g., Sentry)

## Support

If you encounter issues:
- Check platform-specific documentation
- Review application logs
- Verify all environment variables are correct
- Test API endpoints independently
