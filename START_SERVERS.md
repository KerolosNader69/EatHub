# How to Start the Application

## Quick Start

### Terminal 1: Backend Server
```bash
cd backend
npm start
```

**Expected output**:
```
Server running on port 5000
Connected to Supabase successfully
```

### Terminal 2: Frontend Server
```bash
cd frontend
npm run dev
```

**Expected output**:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Access the Application

Open your browser and go to:
```
http://localhost:5173
```

## Testing Signup

1. Browse the menu
2. Add items to cart
3. Click "Proceed to Checkout"
4. Modal appears with signup form
5. Fill in:
   - Full Name
   - Email
   - Phone
   - Address
   - Password
   - Confirm Password
6. Click "Sign Up & Continue"
7. Modal closes
8. Checkout form appears with your data pre-filled

## Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Install dependencies if needed
cd backend
npm install
```

### Frontend won't start
```bash
# Check if port 5173 is in use
netstat -ano | findstr :5173

# Install dependencies if needed
cd frontend
npm install
```

### Signup not working
1. **Check backend is running** on port 5000
2. **Restart frontend** after proxy config changes
3. **Check browser console** (F12) for errors
4. **Check backend terminal** for error logs

### "Empty response" error
- Backend is not running
- Start backend: `cd backend && npm start`

### "CORS" error
- Frontend proxy not configured
- Restart frontend server

## Environment Variables

Make sure `backend/.env` exists with:
```env
SUPABASE_URL=https://opcblscxvueihdkiraqt.supabase.co
SUPABASE_ANON_KEY=your-key-here
PORT=5000
```

## Ports Used

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173
- **Supabase**: https://opcblscxvueihdkiraqt.supabase.co

## Stop Servers

Press `Ctrl+C` in each terminal to stop the servers.

## Full Reset

If things aren't working:

```bash
# Stop all servers (Ctrl+C in each terminal)

# Backend
cd backend
rm -rf node_modules
npm install
npm start

# Frontend (in new terminal)
cd frontend
rm -rf node_modules
npm install
npm run dev
```

## Verify Everything Works

1. ✅ Backend starts without errors
2. ✅ Frontend starts without errors
3. ✅ Can browse menu
4. ✅ Can add to cart
5. ✅ Modal appears on checkout
6. ✅ Can signup successfully
7. ✅ Modal closes after signup
8. ✅ Checkout form is pre-filled

## Need Help?

Check these files for more info:
- `SIGNUP_FIX.md` - Signup troubleshooting
- `SUPABASE_QUICK_START.md` - Supabase setup
- `AUTH_MODAL_UPDATE.md` - Modal documentation
