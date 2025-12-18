# Signup Issue Fix

## Problem
Error: "Failed to execute 'json' on 'Response': Unexpected end of JSON input"

## Root Cause
The frontend couldn't connect to the backend API because:
1. Missing proxy configuration in `vite.config.js`
2. Backend might not be running

## Fixes Applied

### 1. Added Proxy Configuration
Updated `frontend/vite.config.js` to proxy API requests to backend:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
}
```

### 2. Improved Error Handling
Updated `AuthModal.jsx` to provide better error messages:
- Checks if response has content
- Provides clear error if backend is not running
- Logs response for debugging

## How to Fix

### Step 1: Restart Frontend Server

**IMPORTANT**: You must restart the frontend server for the proxy changes to take effect.

```bash
# Stop the current frontend server (Ctrl+C)
# Then restart it:
cd frontend
npm run dev
```

### Step 2: Ensure Backend is Running

Make sure the backend server is running on port 5000:

```bash
# In a separate terminal:
cd backend
npm start
```

You should see:
```
Server running on port 5000
Connected to Supabase successfully
```

### Step 3: Test Signup Again

1. Go to http://localhost:5173
2. Add items to cart
3. Click "Proceed to Checkout"
4. Modal should appear
5. Fill in signup form
6. Click "Sign Up & Continue"

## Verification Checklist

- [ ] Backend server is running on port 5000
- [ ] Frontend server is restarted (after proxy config change)
- [ ] Can see backend logs when submitting form
- [ ] Signup completes successfully
- [ ] Modal closes after signup
- [ ] Checkout form is pre-filled

## Common Issues

### Issue: "Server returned empty response"
**Solution**: Backend is not running. Start it with `cd backend && npm start`

### Issue: "Invalid server response"
**Solution**: Backend is returning HTML instead of JSON. Check backend logs for errors.

### Issue: "Network error"
**Solution**: 
- Check if backend is on port 5000
- Restart frontend server after proxy config change
- Check firewall settings

### Issue: "CORS error"
**Solution**: The proxy should handle this. Make sure frontend is restarted.

## Testing Backend Directly

Test if backend is working:

```bash
curl -X POST http://localhost:5000/api/auth/user/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "address": "123 Test St",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "fullName": "Test User",
    "phone": "1234567890",
    "address": "123 Test St"
  }
}
```

## Debug Mode

To see detailed error messages:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try signup again
4. Check console for detailed error logs

The improved error handling will show:
- Response text if JSON parsing fails
- Clear message if backend is not running
- Detailed error from backend if request fails

## Summary

**Main fix**: Added proxy configuration to `vite.config.js`

**Action required**: **Restart the frontend server** for changes to take effect!

```bash
# Stop frontend (Ctrl+C)
# Restart:
cd frontend
npm run dev
```

After restarting, signup should work correctly!
