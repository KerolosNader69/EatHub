# CORS and Deployment Fix

## Issues Found

1. **Frontend .env.production has wrong backend URL**
   - Was: `https://backend-bcf6ol6h2-kerolosnader69s-projects.vercel.app/api`
   - Should be: `https://backend-8nxfj32ny-kerolosnader69s-projects.vercel.app/api`
   - ✅ FIXED in frontend/.env.production

2. **Analytics warning** - Not critical, just informational (no provider configured)

3. **401 Unauthorized error** - This suggests the backend deployment might not have the correct environment variables

## Steps to Fix

### 1. Redeploy Frontend with Correct Backend URL

```powershell
cd frontend
vercel --prod
```

When prompted, make sure to use the production environment variables.

### 2. Verify Backend Environment Variables on Vercel

Make sure these are set in your Vercel backend project:

```bash
SUPABASE_URL=https://opcblscxvueihdkiraqt.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wY2Jsc2N4dnVlaWhka2lyYXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODk3NTcsImV4cCI6MjA4MDI2NTc1N30.Ny6V2mumvuClnktJht7y6rtJZ2gjuQxyqEufdBfivSQ
SUPABASE_SERVICE_KEY=sb_secret_-62WZYmPOxYhVBSIPDW77A_iF3PaUay
JWT_SECRET=6f5b1bb1f10772a18a9383ec647378b8e4250dd69c93c6004556021523826dcc7d6bbe4b079ec4772d3918d7fd8a4cc4500c5e3a3f3dea15434078dcd146ce1d
JWT_EXPIRE=24h
NODE_ENV=production
LOG_LEVEL=info
```

To set them:

```powershell
# Navigate to backend
cd backend

# Set each environment variable
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_KEY production
vercel env add JWT_SECRET production
vercel env add JWT_EXPIRE production
vercel env add NODE_ENV production
vercel env add LOG_LEVEL production
```

### 3. Redeploy Backend

```powershell
cd backend
vercel --prod
```

### 4. Update Frontend .env.production if Backend URL Changes

If the backend gets a new URL after redeployment, update `frontend/.env.production`:

```
VITE_API_URL=<new-backend-url>/api
```

Then redeploy frontend again.

## Quick Fix Commands

```powershell
# 1. Deploy frontend with corrected URL
cd frontend
vercel --prod

# 2. If backend needs env vars, set them and redeploy
cd ../backend
# Set env vars as shown above, then:
vercel --prod

# 3. Test the deployment
cd ..
node verify-deployment.js
```

## What Was Changed

- ✅ Updated `frontend/.env.production` with correct backend URL
- Backend CORS is already configured to allow all origins (temporary for debugging)
- Analytics warning is informational only (no action needed unless you want to configure a provider)

## Next Steps

1. Redeploy frontend immediately
2. Check if backend has all required environment variables
3. Redeploy backend if needed
4. Test the application
