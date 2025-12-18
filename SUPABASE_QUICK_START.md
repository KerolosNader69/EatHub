# Supabase Integration - Quick Start Guide

## ✅ Your Setup is Complete!

Your EatHub application is **already fully integrated** with Supabase for user authentication and data storage.

## What's Already Working

### 1. User Signup ✅
- Users can create accounts with name, email, phone, address, and password
- Data is stored in Supabase Auth
- Auto-login after signup

### 2. User Login ✅
- Users can login with email and password
- Credentials verified by Supabase
- JWT token generated for session

### 3. User Settings ✅
- Users can view and edit their profile
- Updates saved to Supabase
- Real-time data synchronization

### 4. Checkout Integration ✅
- Form pre-filled with user data from Supabase
- Seamless order flow

## How to Test

### Option 1: Use the Web Interface

1. **Start the servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Test signup**:
   - Open http://localhost:5173
   - Click "Sign Up" button in navigation
   - Fill in the form
   - Submit

3. **Verify in Supabase**:
   - Go to https://supabase.com/dashboard
   - Select project: `opcblscxvueihdkiraqt`
   - Navigate to Authentication → Users
   - See your newly created user!

### Option 2: Use the Test Script

```bash
# Make sure backend is running first
cd backend
npm start

# In another terminal, run the test
node test-user-auth.js
```

This will automatically test:
- ✅ User signup
- ✅ User login
- ✅ Token verification
- ✅ Profile update
- ✅ Invalid login rejection

## View Your Data in Supabase

### Access Supabase Dashboard

1. **URL**: https://supabase.com/dashboard
2. **Project**: opcblscxvueihdkiraqt
3. **Navigate**: Authentication → Users

### What You'll See

```
┌─────────────────────────────────────────────────────────────┐
│ Users                                                       │
├─────────────────────────────────────────────────────────────┤
│ Email              │ Created        │ Last Sign In         │
├─────────────────────────────────────────────────────────────┤
│ john@example.com   │ 2 hours ago    │ 1 hour ago          │
│ jane@example.com   │ 1 day ago      │ 30 minutes ago      │
└─────────────────────────────────────────────────────────────┘
```

Click on any user to see their metadata:
```json
{
  "fullName": "John Doe",
  "phone": "1234567890",
  "address": "123 Main St",
  "role": "user"
}
```

## Configuration Files

### Backend Configuration

**File**: `backend/config/supabase.js`
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
```

**Environment**: `backend/.env`
```env
SUPABASE_URL=https://opcblscxvueihdkiraqt.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## API Endpoints

All endpoints are in `backend/routes/auth.js`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/user/signup` | POST | Create new user account |
| `/api/auth/user/login` | POST | Login existing user |
| `/api/auth/user/update` | PUT | Update user profile |
| `/api/auth/verify` | POST | Verify JWT token |

## Example API Calls

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/user/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "address": "123 Main St",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Check**: `backend/.env` file exists and contains:
```env
SUPABASE_URL=https://opcblscxvueihdkiraqt.supabase.co
SUPABASE_ANON_KEY=your-key-here
```

### Issue: "Cannot connect to Supabase"

**Solutions**:
1. Check internet connection
2. Verify Supabase project is active
3. Check API keys are correct
4. Restart backend server

### Issue: "User already exists"

**Solution**: This is expected! Each email can only be used once. Use a different email or login with existing account.

## Documentation Files

Created comprehensive documentation:

1. **SUPABASE_INTEGRATION_COMPLETE.md** - Full integration guide
2. **SUPABASE_DATA_FLOW.md** - Visual data flow diagrams
3. **SUPABASE_QUICK_START.md** - This file
4. **test-user-auth.js** - Automated test script

## Next Steps (Optional)

### Enable Email Verification
1. Go to Supabase Dashboard
2. Authentication → Settings
3. Enable "Confirm email"

### Add Password Reset
Implement forgot password using Supabase's built-in password reset

### Add Social Login
Enable Google/GitHub login in Supabase settings

### Create User Profiles Table
For extended user data beyond authentication

## Summary

✅ **Supabase is configured and working**
✅ **User signup stores data in Supabase**
✅ **User login authenticates via Supabase**
✅ **User data retrieved from Supabase**
✅ **Profile updates modify Supabase data**
✅ **JWT tokens managed by Supabase**

**No additional setup needed!** Your authentication system is production-ready and using Supabase as the backend.

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Project URL**: https://opcblscxvueihdkiraqt.supabase.co

Your application is successfully integrated with Supabase! 🎉
