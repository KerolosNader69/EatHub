# Update Vercel Environment Variable

The categories have been updated in the backend, but you need to update the environment variable in Vercel's dashboard to ensure it persists.

## Steps to Update VITE_API_URL in Vercel Dashboard:

1. Go to: https://vercel.com/kerolosnader69s-projects/eathub/settings/environment-variables

2. Find `VITE_API_URL` and click "Edit"

3. Update the value to:
   ```
   https://backend-czw25rnt2-kerolosnader69s-projects.vercel.app/api
   ```

4. Make sure it's set for "Production" environment

5. Click "Save"

6. Then redeploy the frontend:
   ```powershell
   cd frontend
   vercel --prod
   ```

## Or Use This Command:

Since the environment variable already exists, you need to update it via the Vercel dashboard (CLI doesn't support updating existing variables easily).

## Current Deployment URLs:

- **Backend**: https://backend-czw25rnt2-kerolosnader69s-projects.vercel.app
- **Frontend**: https://eathub-8f9ztjnrj-kerolosnader69s-projects.vercel.app

## Verify Backend Has New Categories:

```powershell
curl https://backend-czw25rnt2-kerolosnader69s-projects.vercel.app/api/categories
```

Should return:
- Beef burgers 🍔
- Box Deals 📦
- Chicken burgers 🍗
- Deals night 🌙
- Drinks 🥤
- Potatoes 🍟

## If Still Showing Old Categories:

1. **Clear browser cache**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Try incognito/private mode** to see if it's a caching issue
3. **Check the Network tab** in DevTools to see which backend URL is being called
