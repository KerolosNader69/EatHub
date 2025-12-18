# Vercel Deployment Quick Reference

## Deployment Status ✅

Both frontend and backend have been successfully deployed to Vercel.

### Deployment URLs

**Backend:**
- URL: https://backend-lmp1c5ng6-kerolosnader69s-projects.vercel.app
- Dashboard: https://vercel.com/kerolosnader69s-projects/backend

**Frontend:**
- URL: https://frontend-abghhe5ew-kerolosnader69s-projects.vercel.app
- Dashboard: https://vercel.com/kerolosnader69s-projects/frontend

## Important: Configure Environment Variables

### Backend Environment Variables
Go to: https://vercel.com/kerolosnader69s-projects/backend/settings/environment-variables

Required variables:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=production
FRONTEND_URL=https://frontend-abghhe5ew-kerolosnader69s-projects.vercel.app
```

### Frontend Environment Variables
Go to: https://vercel.com/kerolosnader69s-projects/frontend/settings/environment-variables

Required variables:
```
VITE_API_URL=https://backend-lmp1c5ng6-kerolosnader69s-projects.vercel.app
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Redeploy Commands

### Deploy Backend
```bash
cd backend
vercel --prod --yes
```

### Deploy Frontend
```bash
cd frontend
vercel --prod --yes
```

### Deploy Both (from root)
```bash
# Backend
cd backend && vercel --prod --yes && cd ..

# Frontend
cd frontend && vercel --prod --yes && cd ..
```

## Check Deployment Status

```bash
# List all deployments
vercel ls

# Check specific project
vercel ls backend
vercel ls frontend
```

## View Logs

```bash
# Backend logs
cd backend
vercel logs

# Frontend logs
cd frontend
vercel logs
```

## Rollback if Needed

```bash
# Rollback backend
cd backend
vercel rollback

# Rollback frontend
cd frontend
vercel rollback
```

## Custom Domain Setup

If you want to add a custom domain:

1. Go to project settings in Vercel dashboard
2. Navigate to "Domains" section
3. Add your custom domain
4. Update DNS records as instructed

## Troubleshooting

### Backend Not Responding
1. Check environment variables are set
2. View deployment logs: `cd backend && vercel logs`
3. Check Supabase connection
4. Verify vercel.json configuration

### Frontend Not Loading
1. Check VITE_API_URL points to backend
2. View deployment logs: `cd frontend && vercel logs`
3. Check build output in Vercel dashboard
4. Verify all dependencies are installed

### CORS Issues
1. Ensure FRONTEND_URL is set in backend env vars
2. Check CORS configuration in backend/server.js
3. Verify both deployments are using HTTPS

## New Features Deployed

### Feedback System
- ✅ User feedback submission page
- ✅ Admin feedback management dashboard
- ✅ Statistics and analytics
- ✅ Filtering and sorting
- ✅ Secure admin authentication

### Access Points
- Feedback Page: `/feedback`
- Admin Dashboard: `/admin` → "Customer Feedback" tab

## Testing Checklist

After deployment, test:
- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] User can submit feedback
- [ ] Admin can login
- [ ] Admin can view feedback
- [ ] Filtering and sorting work
- [ ] Statistics display correctly

## Monitoring

Check these regularly:
- Vercel Analytics dashboard
- Error logs in Vercel
- Supabase database usage
- API response times

## Quick Links

- [Backend Dashboard](https://vercel.com/kerolosnader69s-projects/backend)
- [Frontend Dashboard](https://vercel.com/kerolosnader69s-projects/frontend)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Dashboard](https://app.supabase.com)

---

**Last Updated:** December 6, 2025
**Status:** ✅ Both deployments successful
