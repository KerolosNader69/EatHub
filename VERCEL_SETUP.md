# Vercel Deployment Setup

## Current Status
- Frontend URL: https://eathub-swart.vercel.app
- Backend URL: https://eathub-production.up.railway.app

## Fix 404 Error

### Option 1: Update Vercel Project Settings (Recommended)

1. Go to your Vercel project dashboard
2. Click **Settings** → **General**
3. Find **Root Directory**
4. Change from `frontend` to `.` (root) or leave empty
5. Scroll down to **Build & Development Settings**
6. Set:
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `cd frontend && npm install`
7. Click **Save**
8. Go to **Deployments** → Click the 3 dots on latest → **Redeploy**

### Option 2: Keep Root Directory as `frontend`

If you want to keep Root Directory as `frontend`:

1. Make sure `frontend/vercel.json` exists (already created)
2. In Vercel Settings → **Build & Development Settings**:
   - **Build Command**: `npm run build` (or leave empty)
   - **Output Directory**: `dist` (or leave empty)
   - **Install Command**: `npm install` (or leave empty)
3. Redeploy

## Environment Variables

Make sure these are set in Vercel:

1. Go to **Settings** → **Environment Variables**
2. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://eathub-production.up.railway.app/api`
   - **Environment**: Production, Preview, Development (select all)
3. Click **Save**
4. Redeploy if needed

## Railway Backend CORS Setup

Add your Vercel URL to Railway:

1. Go to https://railway.app
2. Open your `eathub-production` project
3. Click your backend service
4. Go to **Variables** tab
5. Add:
   - **Name**: `FRONTEND_URL`
   - **Value**: `https://eathub-swart.vercel.app`
6. Railway will auto-redeploy

## Test Your Deployment

Once redeployed, test these URLs:

```bash
# Test homepage
curl https://eathub-swart.vercel.app

# Test admin login page (should return HTML, not 404)
curl https://eathub-swart.vercel.app/admin/login

# Test backend API
curl https://eathub-production.up.railway.app/api/menu
```

## Admin Credentials

Check your Railway backend environment variables for:
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Use these to login at: https://eathub-swart.vercel.app/admin/login
