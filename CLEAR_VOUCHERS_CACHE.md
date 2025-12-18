# Clear Vouchers Cache - User Guide

## Problem

You deleted vouchers from the admin panel, but users still see them on the frontend.

## Why This Happens

Even though the database is empty, users might still see vouchers due to:

1. **Browser Cache** - The browser cached the API response
2. **Service Worker Cache** - If you have a service worker, it might cache API calls
3. **LocalStorage Cache** - Frontend might have cached data in localStorage
4. **CDN Cache** - If using Vercel or a CDN, the API responses might be cached

## Solutions

### For Users (Quick Fix)

Tell users to do a **hard refresh**:

- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

Or clear browser cache:
1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### For Developers (Permanent Fix)

#### Option 1: Clear LocalStorage (Recommended)

Add this code to your browser console on the user-facing site:

```javascript
// Clear all EatHub cache
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('eathub_cache_')) {
    localStorage.removeItem(key);
  }
});
console.log('Cache cleared! Refresh the page.');
```

#### Option 2: Add Cache-Control Headers

Update your API to prevent caching of voucher endpoints.

In `backend/routes/vouchers.js`, add this middleware:

```javascript
// Add this at the top of the file
const noCacheMiddleware = (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
};

// Apply to public routes
router.get('/available', noCacheMiddleware, getAvailableVouchers);
```

#### Option 3: Force Refresh with Query Parameter

Modify the frontend to add a timestamp to API calls:

In `frontend/src/services/voucherService.js`:

```javascript
const getAvailableVouchersBase = async () => {
  try {
    // Add timestamp to prevent caching
    const timestamp = Date.now();
    const response = await api.get(`/vouchers/available?_t=${timestamp}`);
    return response.data.data || response.data;
  } catch (error) {
    // ... rest of the code
  }
};
```

#### Option 4: Verify Deployment

If you're testing on production (Vercel), make sure:

1. The latest code is deployed
2. Environment variables are correct
3. The database changes are reflected

Check your deployment:
```bash
# Check what's in production database
node backend/check-vouchers-status.js
```

### Testing

After applying fixes, test:

1. Open browser in **Incognito/Private mode**
2. Navigate to your site
3. Click on "Vouchers" button
4. Verify "No Vouchers Available" message appears

## Recommended Solution

I recommend **Option 2** (Cache-Control headers) as it prevents the issue from happening again in the future.

Here's the complete fix:
