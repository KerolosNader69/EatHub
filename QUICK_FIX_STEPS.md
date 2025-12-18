# Quick Fix for CORS and 401 Errors

## What's Wrong

Your frontend is trying to reach the wrong backend URL:
- Frontend expects: `https://backend-8nxfj32ny-kerolosnader69s-projects.vercel.app`
- But .env.production had: `https://backend-bcf6ol6h2-kerolosnader69s-projects.vercel.app`

✅ **I've already fixed the .env.production file**

## Option 1: Automated Fix (Recommended)

Run this PowerShell script:

```powershell
.\fix-deployment.ps1
```

This will:
1. Deploy frontend with correct backend URL
2. Set all backend environment variables
3. Deploy backend
4. Verify the deployment

## Option 2: Manual Fix

### Step 1: Deploy Frontend

```powershell
cd frontend
vercel --prod
```

### Step 2: Check Backend Environment Variables

Go to your Vercel dashboard for the backend project and verify these variables are set:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `JWT_SECRET`
- `JWT_EXPIRE`
- `NODE_ENV`
- `LOG_LEVEL`

If any are missing, add them via Vercel dashboard or CLI.

### Step 3: Deploy Backend

```powershell
cd backend
vercel --prod
```

### Step 4: Test

Open your frontend URL and check if the menu loads correctly.

## What I Fixed

1. ✅ Updated `frontend/.env.production` with correct backend URL
2. ✅ Created automated fix script
3. ✅ Created manual fix guide

## The 401 Error

The 401 Unauthorized error suggests your backend deployment is missing environment variables (especially Supabase keys). Make sure all environment variables are set in Vercel before redeploying.

## Analytics Warning

The "No analytics provider configured" warning is harmless - it just means you haven't set up Google Analytics or Plausible. You can ignore it or configure analytics later.
