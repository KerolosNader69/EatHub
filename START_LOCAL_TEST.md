# Start Local Test - No Vouchers

## What I Changed

I updated `frontend/.env` to use your local backend:
```
VITE_API_URL=http://localhost:5000/api
```

## How to Test Locally

### Step 1: Start Backend

Open a terminal and run:
```bash
cd backend
npm start
```

Wait until you see: `Server running on port 5000`

### Step 2: Start Frontend (New Terminal)

Open a **new terminal** and run:
```bash
cd frontend
npm run dev
```

Wait until you see: `Local: http://localhost:5173`

### Step 3: Test

1. Open browser to `http://localhost:5173`
2. Check the homepage
3. Vouchers should show "0" or no badge
4. Click vouchers button
5. Should see "No Vouchers Available"

## Why This Works

- ✅ Local backend has correct code
- ✅ Local backend connects to Supabase (empty database)
- ✅ No caching issues
- ✅ Immediate results

## If You See Vouchers Still

1. **Hard refresh**: `Ctrl + Shift + R`
2. **Clear localStorage**: Open DevTools (F12) → Console → Run:
   ```javascript
   localStorage.clear();
   location.reload();
   ```
3. **Check backend is running**: Visit `http://localhost:5000/api/vouchers/available` in browser
   - Should return: `{"success":true,"data":[]}`

## Troubleshooting

### Backend won't start
```bash
cd backend
npm install
npm start
```

### Frontend won't start
```bash
cd frontend
npm install
npm run dev
```

### Port 5000 already in use
Kill the process:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

Then update `frontend/.env`:
```
VITE_API_URL=http://localhost:5001/api
```

## After Testing Locally

Once you confirm it works locally, we can fix the production deployment.

## Quick Commands

```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend  
cd frontend && npm run dev

# Then open: http://localhost:5173
```

That's it! The vouchers will be gone when testing locally.
