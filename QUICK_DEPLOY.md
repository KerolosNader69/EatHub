# Quick Deploy Guide - Eat Hub

This is a condensed version of the deployment guide for quick reference.

## 1. MongoDB Atlas (5 minutes)

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free M0 cluster
3. Database Access → Add user (save credentials!)
4. Network Access → Allow 0.0.0.0/0
5. Get connection string: `mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/eathub?retryWrites=true&w=majority`

## 2. Deploy Backend to Railway (5 minutes)

1. Sign up at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub → Select your repo
3. Add environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
   JWT_EXPIRE=24h
   FRONTEND_URL=<will-add-later>
   ```
4. Copy your Railway URL (e.g., `https://your-app.up.railway.app`)

## 3. Deploy Frontend to Vercel (5 minutes)

1. Sign up at [vercel.com](https://vercel.com)
2. New Project → Import from GitHub
3. Configure:
   - Root Directory: `frontend`
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables:
   ```
   VITE_API_URL=<your-railway-url>/api
   VITE_APP_NAME=Eat Hub
   ```
5. Copy your Vercel URL (e.g., `https://your-app.vercel.app`)

## 4. Update CORS (1 minute)

1. Go back to Railway
2. Update `FRONTEND_URL` to your Vercel URL
3. Wait for automatic redeploy

## 5. Create Admin User (2 minutes)

**Option A - Using Script (Recommended):**
```bash
cd backend
# Create .env with production MONGODB_URI
node scripts/createAdminUser.js admin YourSecurePassword123!
```

**Option B - Manual:**
1. Generate hash: `node backend/scripts/hashPassword.js YourPassword`
2. MongoDB Atlas → Browse Collections → Insert document:
   ```json
   {
     "username": "admin",
     "password": "<paste-hash-here>",
     "role": "admin"
   }
   ```

## 6. Test (5 minutes)

- ✅ Visit Vercel URL - intro should play
- ✅ Visit `<railway-url>/api/health` - should return JSON
- ✅ Login at `<vercel-url>/admin/login`
- ✅ Add a menu item
- ✅ View menu on homepage
- ✅ Complete an order

## Done! 🎉

Your app is live at:
- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-app.up.railway.app`

## Common Issues

**CORS Error?**
- Check `FRONTEND_URL` in Railway matches Vercel URL exactly

**Can't connect to database?**
- Verify MongoDB connection string
- Check IP whitelist (0.0.0.0/0)

**Build failed?**
- Check platform logs
- Verify environment variables are set

## Free Tier Limits

- MongoDB Atlas: 512 MB storage
- Railway: $5 credit/month (~500 hours)
- Vercel: 100 GB bandwidth

## Need Help?

See full guide: `DEPLOYMENT_GUIDE.md`
