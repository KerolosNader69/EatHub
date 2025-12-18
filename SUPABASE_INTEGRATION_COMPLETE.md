# Supabase Integration - Complete Guide

## ✅ Integration Status: FULLY IMPLEMENTED

Your signup and login are **already integrated with Supabase** and storing user data in the cloud!

## How It Works

### Architecture Overview

```
Frontend (React)
    ↓
Backend API (Express)
    ↓
Supabase Auth Service
    ↓
Supabase Database (PostgreSQL)
```

## Current Implementation

### 1. Supabase Configuration

**File**: `backend/config/supabase.js`

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
```

**Environment Variables** (`.env`):
```env
SUPABASE_URL=https://opcblscxvueihdkiraqt.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. User Signup Flow

**Endpoint**: `POST /api/auth/user/signup`

**What Happens**:
1. User fills signup form (name, email, phone, address, password)
2. Frontend sends data to backend
3. Backend calls `supabase.auth.signUp()` with:
   - Email and password (for authentication)
   - User metadata (fullName, phone, address, role)
4. Supabase creates user account and stores data
5. Returns JWT token for auto-login
6. User data stored in Supabase Auth users table

**Code**:
```javascript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      fullName,    // Stored in user_metadata
      phone,       // Stored in user_metadata
      address,     // Stored in user_metadata
      role: 'user' // Stored in user_metadata
    }
  }
});
```

### 3. User Login Flow

**Endpoint**: `POST /api/auth/user/login`

**What Happens**:
1. User enters email and password
2. Frontend sends credentials to backend
3. Backend calls `supabase.auth.signInWithPassword()`
4. Supabase verifies credentials
5. Returns JWT token and user data
6. User data retrieved from Supabase

**Code**:
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// Returns user with metadata
const user = {
  id: data.user.id,
  email: data.user.email,
  fullName: data.user.user_metadata?.fullName,
  phone: data.user.user_metadata?.phone,
  address: data.user.user_metadata?.address
};
```

### 4. User Profile Update

**Endpoint**: `PUT /api/auth/user/update`

**What Happens**:
1. User edits profile in settings page
2. Frontend sends updated data with JWT token
3. Backend verifies token with Supabase
4. Backend calls `supabase.auth.updateUser()`
5. Supabase updates user metadata
6. Returns updated user data

**Code**:
```javascript
const { data, error } = await supabase.auth.updateUser({
  email,
  data: {
    fullName,
    phone,
    address
  }
});
```

## Data Storage in Supabase

### Where User Data is Stored

**Supabase Auth Users Table**:
```
auth.users
├── id (UUID) - Unique user identifier
├── email (string) - User email (for login)
├── encrypted_password (string) - Hashed password
├── created_at (timestamp)
├── updated_at (timestamp)
└── user_metadata (JSONB) - Custom user data
    ├── fullName
    ├── phone
    ├── address
    └── role
```

### Accessing User Data

**In Supabase Dashboard**:
1. Go to https://supabase.com/dashboard
2. Select your project: `opcblscxvueihdkiraqt`
3. Navigate to "Authentication" → "Users"
4. View all registered users and their metadata

## API Endpoints Summary

### User Authentication Endpoints

| Endpoint | Method | Purpose | Supabase Method |
|----------|--------|---------|-----------------|
| `/api/auth/user/signup` | POST | Create new user | `supabase.auth.signUp()` |
| `/api/auth/user/login` | POST | Login user | `supabase.auth.signInWithPassword()` |
| `/api/auth/user/update` | PUT | Update profile | `supabase.auth.updateUser()` |
| `/api/auth/verify` | POST | Verify token | `supabase.auth.getUser()` |

### Admin Authentication Endpoints

| Endpoint | Method | Purpose | Supabase Method |
|----------|--------|---------|-----------------|
| `/api/auth/signup` | POST | Create admin | `supabase.auth.signUp()` |
| `/api/auth/login` | POST | Login admin | `supabase.auth.signInWithPassword()` |

## Security Features

### ✅ Implemented Security

1. **Password Hashing**: Supabase automatically hashes passwords
2. **JWT Tokens**: Secure token-based authentication
3. **Token Verification**: All protected routes verify tokens
4. **HTTPS**: Supabase uses encrypted connections
5. **Environment Variables**: Sensitive keys stored in .env
6. **Input Validation**: Backend validates all inputs

### Token Flow

```
1. User signs up/logs in
   ↓
2. Supabase generates JWT token
   ↓
3. Token sent to frontend
   ↓
4. Frontend stores in localStorage
   ↓
5. Frontend sends token with requests
   ↓
6. Backend verifies with Supabase
   ↓
7. Request processed if valid
```

## Testing the Integration

### 1. Test Signup

```bash
# Using curl
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

**Expected Response**:
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "john@example.com",
    "fullName": "John Doe",
    "phone": "1234567890",
    "address": "123 Main St"
  }
}
```

### 2. Test Login

```bash
curl -X POST http://localhost:5000/api/auth/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Verify in Supabase Dashboard

1. Go to Supabase Dashboard
2. Authentication → Users
3. See your newly created user
4. Click on user to view metadata (fullName, phone, address)

## Frontend Integration

### How Frontend Uses Supabase Data

**Signup Page** (`frontend/src/pages/UserSignup.jsx`):
```javascript
const response = await fetch('/api/auth/user/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName, email, phone, address, password
  })
});

const data = await response.json();
// Data comes from Supabase
login(data.token, data.user);
```

**Login Page** (`frontend/src/pages/UserLogin.jsx`):
```javascript
const response = await fetch('/api/auth/user/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();
// User data retrieved from Supabase
login(data.token, data.user);
```

**Settings Page** (`frontend/src/pages/UserSettings.jsx`):
```javascript
const response = await fetch('/api/auth/user/update', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ fullName, email, phone, address })
});

// Updates Supabase user metadata
```

## Database Schema

### Supabase Auth Schema (Automatic)

Supabase automatically creates and manages these tables:

```sql
-- Users table (managed by Supabase)
CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  encrypted_password VARCHAR(255) NOT NULL,
  email_confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  user_metadata JSONB DEFAULT '{}'::jsonb,
  -- Other Supabase fields...
);
```

### User Metadata Structure

```json
{
  "fullName": "John Doe",
  "phone": "1234567890",
  "address": "123 Main St",
  "role": "user"
}
```

## Advantages of Current Setup

✅ **Secure**: Industry-standard authentication
✅ **Scalable**: Supabase handles millions of users
✅ **Managed**: No need to manage auth infrastructure
✅ **JWT Tokens**: Stateless authentication
✅ **Metadata**: Flexible user data storage
✅ **Real-time**: Can add real-time features later
✅ **Backup**: Automatic backups by Supabase
✅ **Free Tier**: 50,000 monthly active users

## Monitoring Users

### View Users in Supabase Dashboard

1. **Login**: https://supabase.com/dashboard
2. **Select Project**: opcblscxvueihdkiraqt
3. **Navigate**: Authentication → Users
4. **View**:
   - Total users
   - User emails
   - Sign up dates
   - User metadata
   - Last sign in

### Query Users Programmatically

```javascript
// Get user by ID
const { data: user } = await supabase.auth.getUser(token);

// User data includes metadata
console.log(user.user_metadata.fullName);
console.log(user.user_metadata.phone);
console.log(user.user_metadata.address);
```

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution**: Ensure `.env` file has:
```env
SUPABASE_URL=https://opcblscxvueihdkiraqt.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### Issue: "Invalid credentials"

**Solution**: 
- Check email/password are correct
- Verify user exists in Supabase dashboard
- Check if email is confirmed (if email confirmation enabled)

### Issue: "Token verification failed"

**Solution**:
- Check token is being sent in Authorization header
- Verify token hasn't expired
- Check Supabase project is active

## Next Steps (Optional Enhancements)

### 1. Email Verification
Enable in Supabase Dashboard → Authentication → Settings

### 2. Password Reset
Add forgot password functionality using Supabase

### 3. Social Login
Add Google/GitHub login via Supabase

### 4. User Profiles Table
Create separate table for extended user data:
```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id),
  avatar_url TEXT,
  bio TEXT,
  preferences JSONB
);
```

### 5. Row Level Security
Add RLS policies for user data protection

## Summary

Your application is **fully integrated with Supabase**:

✅ User signup stores data in Supabase Auth
✅ User login authenticates via Supabase
✅ User data (name, phone, address) stored in user_metadata
✅ JWT tokens generated and verified by Supabase
✅ Profile updates modify Supabase user data
✅ Secure, scalable, and production-ready

**No additional setup needed** - your authentication is working with Supabase right now!
