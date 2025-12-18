# Rename Vercel Project from "frontend" to "EatHub"

## Current Status ✅

Frontend has been redeployed with correct API URL:
- **New URL:** https://frontend-qshxgm86f-kerolosnader69s-projects.vercel.app
- **API URL:** Now correctly pointing to production backend

## How to Rename Project in Vercel

### Option 1: Via Vercel Dashboard (Recommended)

1. **Go to Project Settings**
   - Visit: https://vercel.com/kerolosnader69s-projects/frontend/settings
   
2. **Navigate to General Settings**
   - Click on "General" in the left sidebar
   
3. **Change Project Name**
   - Find "Project Name" section
   - Click "Edit" button
   - Change from `frontend` to `EatHub`
   - Click "Save"

4. **Update Domain (Optional)**
   - The deployment URL will automatically update to: `eathub-xxx.vercel.app`
   - You can also add a custom domain if you have one

### Option 2: Via Vercel CLI

Unfortunately, Vercel CLI doesn't support renaming projects directly. You must use the dashboard.

### Option 3: Create New Project (Alternative)

If you want a completely fresh start:

1. **Delete current frontend project** (optional)
   - Go to: https://vercel.com/kerolosnader69s-projects/frontend/settings
   - Scroll to bottom → "Delete Project"

2. **Remove local .vercel folder**
   ```bash
   cd frontend
   Remove-Item -Recurse -Force .vercel
   ```

3. **Deploy with new name**
   ```bash
   vercel --prod
   # When prompted, choose "Create new project"
   # Enter project name: EatHub
   ```

## After Renaming

### Update Backend Environment Variable

1. Go to: https://vercel.com/kerolosnader69s-projects/backend/settings/environment-variables

2. Update `FRONTEND_URL` to new domain:
   ```
   FRONTEND_URL=https://eathub-xxx.vercel.app
   ```
   (Replace xxx with actual deployment hash)

3. Redeploy backend:
   ```bash
   cd backend
   vercel --prod --yes
   ```

### Update Frontend Environment Variable (if needed)

The backend URL should remain the same, but verify in:
https://vercel.com/kerolosnader69s-projects/frontend/settings/environment-variables

## Current Deployment URLs

### Frontend
- **Latest:** https://frontend-qshxgm86f-kerolosnader69s-projects.vercel.app
- **Dashboard:** https://vercel.com/kerolosnader69s-projects/frontend

### Backend
- **URL:** https://backend-lmp1c5ng6-kerolosnader69s-projects.vercel.app
- **Dashboard:** https://vercel.com/kerolosnader69s-projects/backend

## Environment Variables Already Set

### Frontend (.env.production)
✅ VITE_API_URL - Points to production backend
✅ VITE_SUPABASE_URL - Supabase connection
✅ VITE_SUPABASE_ANON_KEY - Supabase auth
✅ VITE_APP_NAME - "Eat Hub"

### What Was Fixed

**Problem:** Frontend was trying to connect to `localhost:5000`

**Solution:** 
1. Updated `frontend/.env` with production API URL
2. Created `frontend/.env.production` for production builds
3. Redeployed frontend with correct configuration

**Result:** Frontend now correctly connects to production backend ✅

## Testing

Visit your frontend: https://frontend-qshxgm86f-kerolosnader69s-projects.vercel.app

You should now see:
- ✅ Menu items loading correctly
- ✅ No "localhost:5000" errors
- ✅ All features working

## Quick Rename Steps

1. Visit: https://vercel.com/kerolosnader69s-projects/frontend/settings
2. Click "General" → Find "Project Name"
3. Click "Edit" → Change to "EatHub"
4. Click "Save"
5. Update `FRONTEND_URL` in backend env vars
6. Redeploy backend

Done! 🎉

---

**Note:** The deployment URL will change from `frontend-xxx.vercel.app` to `eathub-xxx.vercel.app` after renaming.
