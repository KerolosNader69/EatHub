# Redeploy Backend - Simple Steps

## The Problem

Your production backend is serving old code. It needs to be manually redeployed.

## Simplest Solution: Vercel Dashboard

### Step 1: Go to Vercel

Open: https://vercel.com/kerolosnader69s-projects

### Step 2: Find Backend Project

Look for a project named something like:
- `backend`
- `backend-ljhd8p024`
- `EatHub-backend`
- Or any project with "backend" in the name

### Step 3: Redeploy

1. Click on the backend project
2. Click "Deployments" tab at the top
3. Find the most recent deployment
4. Click the three dots (⋯) on the right
5. Click "Redeploy"
6. Click "Redeploy" again to confirm
7. Wait 2-3 minutes

### Step 4: Verify

Run this command:
```bash
node backend/test-production-vouchers.js
```

**Success looks like**:
```
Cache-Control: no-store, no-cache
✅ SUCCESS: No vouchers found
```

**Still broken looks like**:
```
Cache-Control: public, max-age=0
⚠️  WARNING: 3 voucher(s) found
```

If still broken, wait another minute and test again.

## Alternative: Use Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy backend
cd backend
vercel --prod
```

## After Backend is Redeployed

1. Test production API (should show 0 vouchers)
2. Open your production website
3. Hard refresh: `Ctrl + Shift + R`
4. Vouchers should be gone!

## If You Can't Find the Backend Project

It might not exist or be disconnected. In that case:

1. Create new Vercel project for backend
2. Link it to your GitHub repo
3. Set root directory to `backend`
4. Deploy

Or just keep using local backend for development and fix production later.

## Summary

1. Go to Vercel Dashboard
2. Find backend project
3. Click Redeploy
4. Wait 2-3 minutes
5. Test with `node backend/test-production-vouchers.js`
6. Hard refresh your website
7. Done!
