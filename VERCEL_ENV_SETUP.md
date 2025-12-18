# Vercel Environment Variables Setup Guide

## Quick Links

**Backend Settings:** https://vercel.com/kerolosnader69s-projects/backend/settings/environment-variables

**Frontend Settings:** https://vercel.com/kerolosnader69s-projects/frontend/settings/environment-variables

---

## Backend Environment Variables

Go to: https://vercel.com/kerolosnader69s-projects/backend/settings/environment-variables

Add these variables (click "Add" for each one):

### 1. SUPABASE_URL
```
Value: https://opcblscxvueihdkiraqt.supabase.co
Environment: Production, Preview, Development (select all)
```

### 2. SUPABASE_ANON_KEY
```
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wY2Jsc2N4dnVlaWhka2lyYXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODk3NTcsImV4cCI6MjA4MDI2NTc1N30.Ny6V2mumvuClnktJht7y6rtJZ2gjuQxyqEufdBfivSQ
Environment: Production, Preview, Development (select all)
```

### 3. NODE_ENV
```
Value: production
Environment: Production only
```

### 4. FRONTEND_URL
```
Value: https://frontend-abghhe5ew-kerolosnader69s-projects.vercel.app
Environment: Production, Preview, Development (select all)
```

### 5. JWT_SECRET
```
Value: 6f5b1bb1f10772a18a9383ec647378b8e4250dd69c93c6004556021523826dcc7d6bbe4b079ec4772d3918d7fd8a4cc4500c5e3a3f3dea15434078dcd146ce1d
Environment: Production, Preview, Development (select all)
```

### 6. JWT_EXPIRE
```
Value: 24h
Environment: Production, Preview, Development (select all)
```

### 7. LOG_LEVEL (Optional)
```
Value: info
Environment: Production, Preview, Development (select all)
```

---

## Frontend Environment Variables

Go to: https://vercel.com/kerolosnader69s-projects/frontend/settings/environment-variables

Add these variables:

### 1. VITE_API_URL
```
Value: https://backend-lmp1c5ng6-kerolosnader69s-projects.vercel.app/api
Environment: Production, Preview, Development (select all)
```

### 2. VITE_SUPABASE_URL
```
Value: https://opcblscxvueihdkiraqt.supabase.co
Environment: Production, Preview, Development (select all)
```

### 3. VITE_SUPABASE_ANON_KEY
```
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wY2Jsc2N4dnVlaWhka2lyYXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODk3NTcsImV4cCI6MjA4MDI2NTc1N30.Ny6V2mumvuClnktJht7y6rtJZ2gjuQxyqEufdBfivSQ
Environment: Production, Preview, Development (select all)
```

### 4. VITE_APP_NAME
```
Value: Eat Hub
Environment: Production, Preview, Development (select all)
```

### 5. VITE_ERROR_TRACKING_ENABLED (Optional)
```
Value: false
Environment: Production, Preview, Development (select all)
```

### 6. VITE_ANALYTICS_ENABLED (Optional)
```
Value: false
Environment: Production, Preview, Development (select all)
```

---

## Step-by-Step Instructions

### For Backend:

1. Go to https://vercel.com/kerolosnader69s-projects/backend/settings/environment-variables
2. Click "Add New" button
3. For each variable above:
   - Enter the **Name** (e.g., `SUPABASE_URL`)
   - Enter the **Value** (copy from above)
   - Select **Environments**: Check all three (Production, Preview, Development)
   - Click "Save"
4. After adding all variables, click "Redeploy" to apply changes

### For Frontend:

1. Go to https://vercel.com/kerolosnader69s-projects/frontend/settings/environment-variables
2. Click "Add New" button
3. For each variable above:
   - Enter the **Name** (e.g., `VITE_API_URL`)
   - Enter the **Value** (copy from above)
   - Select **Environments**: Check all three (Production, Preview, Development)
   - Click "Save"
4. After adding all variables, click "Redeploy" to apply changes

---

## Important Notes

### Security
- ⚠️ **NEVER** commit `.env` files to Git
- ⚠️ The `SUPABASE_ANON_KEY` is safe to expose (it's public)
- ⚠️ Keep `JWT_SECRET` and `SUPABASE_SERVICE_KEY` private

### CORS Configuration
- The `FRONTEND_URL` in backend must match your actual frontend URL
- This allows the backend to accept requests from your frontend

### API URL
- The `VITE_API_URL` in frontend must point to your backend URL
- Include `/api` at the end of the URL

### After Adding Variables
- You MUST redeploy both projects for changes to take effect
- Click "Redeploy" button in Vercel dashboard, or run:
  ```bash
  cd backend && vercel --prod --yes
  cd frontend && vercel --prod --yes
  ```

---

## Verification

After setting environment variables and redeploying:

### Test Backend
```bash
curl https://backend-lmp1c5ng6-kerolosnader69s-projects.vercel.app/api/monitoring/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": "...",
  "database": "connected"
}
```

### Test Frontend
Visit: https://frontend-abghhe5ew-kerolosnader69s-projects.vercel.app

Should load without errors in browser console.

---

## Troubleshooting

### Backend Issues
- **500 Error**: Check if all environment variables are set
- **CORS Error**: Verify `FRONTEND_URL` matches your frontend domain
- **Database Error**: Check Supabase credentials

### Frontend Issues
- **API Connection Failed**: Verify `VITE_API_URL` is correct
- **Blank Page**: Check browser console for errors
- **Auth Issues**: Verify Supabase keys match backend

### Check Logs
```bash
# Backend logs
cd backend
vercel logs --follow

# Frontend logs
cd frontend
vercel logs --follow
```

---

## Summary Checklist

Backend (7 variables):
- [ ] SUPABASE_URL
- [ ] SUPABASE_ANON_KEY
- [ ] NODE_ENV
- [ ] FRONTEND_URL
- [ ] JWT_SECRET
- [ ] JWT_EXPIRE
- [ ] LOG_LEVEL (optional)

Frontend (6 variables):
- [ ] VITE_API_URL
- [ ] VITE_SUPABASE_URL
- [ ] VITE_SUPABASE_ANON_KEY
- [ ] VITE_APP_NAME
- [ ] VITE_ERROR_TRACKING_ENABLED (optional)
- [ ] VITE_ANALYTICS_ENABLED (optional)

After Setup:
- [ ] Redeploy backend
- [ ] Redeploy frontend
- [ ] Test backend health endpoint
- [ ] Test frontend loads correctly
- [ ] Test feedback submission
- [ ] Test admin login and feedback view

---

**Last Updated:** December 6, 2025
