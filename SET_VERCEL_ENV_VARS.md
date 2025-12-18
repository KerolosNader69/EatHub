# URGENT: Set Environment Variables in Vercel Dashboard

## The Problem

Your frontend is using an OLD backend URL because environment variables aren't set in Vercel.

**Current (Wrong):** `backend-lmp1c5ng6` (old deployment)
**Should Be:** `backend-5lpl9e255` (latest deployment)

## SOLUTION: Set Environment Variables in Vercel Dashboard

### Step 1: Set Backend Environment Variables

1. **Go to Backend Settings:**
   https://vercel.com/kerolosnader69s-projects/backend/settings/environment-variables

2. **Click "Add New" and add each variable:**

   **Variable 1:**
   - Name: `SUPABASE_URL`
   - Value: `https://opcblscxvueihdkiraqt.supabase.co`
   - Environments: ✅ Production ✅ Preview ✅ Development

   **Variable 2:**
   - Name: `SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wY2Jsc2N4dnVlaWhka2lyYXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODk3NTcsImV4cCI6MjA4MDI2NTc1N30.Ny6V2mumvuClnktJht7y6rtJZ2gjuQxyqEufdBfivSQ`
   - Environments: ✅ Production ✅ Preview ✅ Development

   **Variable 3:**
   - Name: `NODE_ENV`
   - Value: `production`
   - Environments: ✅ Production only

   **Variable 4:**
   - Name: `JWT_SECRET`
   - Value: `6f5b1bb1f10772a18a9383ec647378b8e4250dd69c93c6004556021523826dcc7d6bbe4b079ec4772d3918d7fd8a4cc4500c5e3a3f3dea15434078dcd146ce1d`
   - Environments: ✅ Production ✅ Preview ✅ Development

   **Variable 5:**
   - Name: `JWT_EXPIRE`
   - Value: `24h`
   - Environments: ✅ Production ✅ Preview ✅ Development

3. **Click "Save" after adding all variables**

4. **Click "Redeploy" button** at the top of the page

---

### Step 2: Set Frontend Environment Variables

1. **Go to Frontend Settings:**
   https://vercel.com/kerolosnader69s-projects/frontend/settings/environment-variables

2. **Click "Add New" and add each variable:**

   **Variable 1:**
   - Name: `VITE_API_URL`
   - Value: `https://backend-5lpl9e255-kerolosnader69s-projects.vercel.app/api`
   - Environments: ✅ Production ✅ Preview ✅ Development

   **Variable 2:**
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://opcblscxvueihdkiraqt.supabase.co`
   - Environments: ✅ Production ✅ Preview ✅ Development

   **Variable 3:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wY2Jsc2N4dnVlaWhka2lyYXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODk3NTcsImV4cCI6MjA4MDI2NTc1N30.Ny6V2mumvuClnktJht7y6rtJZ2gjuQxyqEufdBfivSQ`
   - Environments: ✅ Production ✅ Preview ✅ Development

   **Variable 4:**
   - Name: `VITE_APP_NAME`
   - Value: `Eat Hub`
   - Environments: ✅ Production ✅ Preview ✅ Development

3. **Click "Save" after adding all variables**

4. **Click "Redeploy" button** at the top of the page

---

## Step 3: Wait for Redeployment

After clicking "Redeploy" on both projects:
- Wait 1-2 minutes for deployment to complete
- You'll see a success message
- New deployment URLs will be generated

---

## Step 4: Test Your App

After redeployment, visit your frontend URL and you should see:
- ✅ Menu items loading
- ✅ No CORS errors
- ✅ No connection errors
- ✅ All features working

---

## Why This is Necessary

**Important:** Vercel does NOT use `.env` files in production!

- `.env` files are for local development only
- Production uses environment variables set in Vercel dashboard
- That's why your app is still using old URLs

---

## Quick Checklist

Backend (5 variables):
- [ ] SUPABASE_URL
- [ ] SUPABASE_ANON_KEY
- [ ] NODE_ENV
- [ ] JWT_SECRET
- [ ] JWT_EXPIRE
- [ ] Click "Redeploy"

Frontend (4 variables):
- [ ] VITE_API_URL
- [ ] VITE_SUPABASE_URL
- [ ] VITE_SUPABASE_ANON_KEY
- [ ] VITE_APP_NAME
- [ ] Click "Redeploy"

---

## Alternative: Use Vercel CLI

If you prefer command line:

```bash
# Backend
cd backend
vercel env add SUPABASE_URL production
# Paste: https://opcblscxvueihdkiraqt.supabase.co

vercel env add SUPABASE_ANON_KEY production
# Paste the key

# ... repeat for all variables

# Then redeploy
vercel --prod --yes

# Frontend
cd frontend
vercel env add VITE_API_URL production
# Paste: https://backend-5lpl9e255-kerolosnader69s-projects.vercel.app/api

# ... repeat for all variables

# Then redeploy
vercel --prod --yes
```

---

## After Setting Variables

Your app will work on ANY Vercel URL because:
1. Environment variables are set in Vercel
2. CORS allows all `*.vercel.app` domains
3. Latest backend URL is configured

---

## Need Help?

If you're still seeing errors after setting variables:
1. Make sure you clicked "Redeploy" after adding variables
2. Wait for deployment to complete (check deployment status)
3. Hard refresh your browser (Ctrl+Shift+R)
4. Check the new deployment URL in Vercel dashboard

---

**This is the ONLY way to fix the issue permanently!**

The `.env` files in your code are ignored by Vercel in production.
You MUST set environment variables in the Vercel dashboard.
