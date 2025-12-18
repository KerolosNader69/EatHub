# Supabase Data Flow Visualization

## Complete User Authentication Flow

### 1. User Signup Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER SIGNUP                             │
└─────────────────────────────────────────────────────────────────┘

Frontend (UserSignup.jsx)
    │
    │ User fills form:
    │ - Full Name: "John Doe"
    │ - Email: "john@example.com"
    │ - Phone: "1234567890"
    │ - Address: "123 Main St"
    │ - Password: "password123"
    │
    ▼
POST /api/auth/user/signup
    │
    │ Request Body:
    │ {
    │   "fullName": "John Doe",
    │   "email": "john@example.com",
    │   "phone": "1234567890",
    │   "address": "123 Main St",
    │   "password": "password123"
    │ }
    │
    ▼
Backend (auth.js)
    │
    │ Validates input
    │
    ▼
supabase.auth.signUp({
  email: "john@example.com",
  password: "password123",
  options: {
    data: {
      fullName: "John Doe",
      phone: "1234567890",
      address: "123 Main St",
      role: "user"
    }
  }
})
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE CLOUD                               │
│                                                                 │
│  Creates user in auth.users table:                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ id: "550e8400-e29b-41d4-a716-446655440000"              │  │
│  │ email: "john@example.com"                                │  │
│  │ encrypted_password: "$2a$10$..."                         │  │
│  │ created_at: "2024-12-04T10:30:00Z"                       │  │
│  │ user_metadata: {                                         │  │
│  │   "fullName": "John Doe",                                │  │
│  │   "phone": "1234567890",                                 │  │
│  │   "address": "123 Main St",                              │  │
│  │   "role": "user"                                         │  │
│  │ }                                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Generates JWT Token:                                           │
│  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...                       │
└─────────────────────────────────────────────────────────────────┘
    │
    │ Returns:
    │ {
    │   "success": true,
    │   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    │   "user": {
    │     "id": "550e8400-e29b-41d4-a716-446655440000",
    │     "email": "john@example.com",
    │     "fullName": "John Doe",
    │     "phone": "1234567890",
    │     "address": "123 Main St"
    │   }
    │ }
    │
    ▼
Frontend (UserSignup.jsx)
    │
    │ Stores in localStorage:
    │ - eatHubToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    │ - eatHubAdmin: {"id": "...", "email": "...", ...}
    │
    │ Updates AuthContext
    │
    ▼
Navigate to /checkout (or /menu)
```

### 2. User Login Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LOGIN                              │
└─────────────────────────────────────────────────────────────────┘

Frontend (UserLogin.jsx)
    │
    │ User enters:
    │ - Email: "john@example.com"
    │ - Password: "password123"
    │
    ▼
POST /api/auth/user/login
    │
    │ Request Body:
    │ {
    │   "email": "john@example.com",
    │   "password": "password123"
    │ }
    │
    ▼
Backend (auth.js)
    │
    │ Validates input
    │
    ▼
supabase.auth.signInWithPassword({
  email: "john@example.com",
  password: "password123"
})
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE CLOUD                               │
│                                                                 │
│  1. Finds user by email                                         │
│  2. Verifies password hash                                      │
│  3. Retrieves user data from auth.users                         │
│  4. Generates new JWT token                                     │
│                                                                 │
│  Returns user with metadata:                                    │
│  {                                                              │
│    "id": "550e8400-e29b-41d4-a716-446655440000",               │
│    "email": "john@example.com",                                 │
│    "user_metadata": {                                           │
│      "fullName": "John Doe",                                    │
│      "phone": "1234567890",                                     │
│      "address": "123 Main St",                                  │
│      "role": "user"                                             │
│    }                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
    │
    │ Returns:
    │ {
    │   "success": true,
    │   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    │   "user": {
    │     "id": "550e8400-e29b-41d4-a716-446655440000",
    │     "email": "john@example.com",
    │     "fullName": "John Doe",
    │     "phone": "1234567890",
    │     "address": "123 Main St"
    │   }
    │ }
    │
    ▼
Frontend (UserLogin.jsx)
    │
    │ Stores in localStorage
    │ Updates AuthContext
    │
    ▼
Navigate to /checkout (or /menu)
```

### 3. Profile Update Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      PROFILE UPDATE                             │
└─────────────────────────────────────────────────────────────────┘

Frontend (UserSettings.jsx)
    │
    │ User edits:
    │ - Full Name: "John Doe Updated"
    │ - Phone: "9876543210"
    │ - Address: "456 New Street"
    │
    ▼
PUT /api/auth/user/update
    │
    │ Headers:
    │ Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    │
    │ Request Body:
    │ {
    │   "fullName": "John Doe Updated",
    │   "email": "john@example.com",
    │   "phone": "9876543210",
    │   "address": "456 New Street"
    │ }
    │
    ▼
Backend (auth.js)
    │
    │ 1. Extracts token from Authorization header
    │ 2. Verifies token with Supabase
    │
    ▼
supabase.auth.getUser(token)
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE CLOUD                               │
│                                                                 │
│  Verifies JWT token and returns user                            │
└─────────────────────────────────────────────────────────────────┘
    │
    │ Token valid ✓
    │
    ▼
supabase.auth.updateUser({
  email: "john@example.com",
  data: {
    fullName: "John Doe Updated",
    phone: "9876543210",
    address: "456 New Street"
  }
})
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE CLOUD                               │
│                                                                 │
│  Updates auth.users table:                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ id: "550e8400-e29b-41d4-a716-446655440000"              │  │
│  │ email: "john@example.com"                                │  │
│  │ updated_at: "2024-12-04T11:00:00Z"  ← Updated            │  │
│  │ user_metadata: {                                         │  │
│  │   "fullName": "John Doe Updated",   ← Updated            │  │
│  │   "phone": "9876543210",            ← Updated            │  │
│  │   "address": "456 New Street",      ← Updated            │  │
│  │   "role": "user"                                         │  │
│  │ }                                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
    │
    │ Returns updated user
    │
    ▼
Frontend (UserSettings.jsx)
    │
    │ Updates localStorage
    │ Shows success message
    │
    ▼
Profile Updated ✓
```

### 4. Checkout with Pre-filled Data

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHECKOUT FLOW                                │
└─────────────────────────────────────────────────────────────────┘

User clicks "Proceed to Checkout"
    │
    ▼
Checkout.jsx checks authentication
    │
    ├─ Not Authenticated ──→ Redirect to /user/signup
    │                        (User signs up/logs in)
    │                        (Redirects back to checkout)
    │
    └─ Authenticated ──→ Continue
                          │
                          ▼
                    Load user data from AuthContext
                          │
                          │ User data from Supabase:
                          │ {
                          │   "fullName": "John Doe",
                          │   "phone": "1234567890",
                          │   "address": "123 Main St"
                          │ }
                          │
                          ▼
                    Pre-fill checkout form
                          │
                          ┌─────────────────────────┐
                          │ Name: John Doe          │ ← From Supabase
                          │ Phone: 1234567890       │ ← From Supabase
                          │ Address: 123 Main St    │ ← From Supabase
                          │ Special Instructions:   │
                          └─────────────────────────┘
                          │
                          ▼
                    User reviews and submits order
```

## Data Storage Structure in Supabase

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                            │
│                                                                 │
│  Schema: auth                                                   │
│  Table: users                                                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Column              │ Type      │ Example                │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ id                  │ UUID      │ 550e8400-e29b-41d4...  │  │
│  │ email               │ VARCHAR   │ john@example.com       │  │
│  │ encrypted_password  │ VARCHAR   │ $2a$10$N9qo8uLO...    │  │
│  │ email_confirmed_at  │ TIMESTAMP │ 2024-12-04 10:30:00    │  │
│  │ created_at          │ TIMESTAMP │ 2024-12-04 10:30:00    │  │
│  │ updated_at          │ TIMESTAMP │ 2024-12-04 11:00:00    │  │
│  │ user_metadata       │ JSONB     │ See below ↓            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  user_metadata structure:                                       │
│  {                                                              │
│    "fullName": "John Doe",                                      │
│    "phone": "1234567890",                                       │
│    "address": "123 Main St",                                    │
│    "role": "user"                                               │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

## JWT Token Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                      JWT TOKEN                                  │
└─────────────────────────────────────────────────────────────────┘

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJpYXQiOjE3MDE2ODk0MDAsImV4cCI6MTcwMTY5MzAwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

Decoded:

Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",  ← User ID
  "email": "john@example.com",                    ← User Email
  "iat": 1701689400,                              ← Issued At
  "exp": 1701693000,                              ← Expires At
  "role": "authenticated"                         ← Supabase Role
}

Signature:
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  SUPABASE_JWT_SECRET
)
```

## Security Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                              │
└─────────────────────────────────────────────────────────────────┘

1. Password Security
   User Password → Supabase → bcrypt hash → Stored encrypted
   
2. Token Security
   Login → Supabase generates JWT → Signed with secret → Sent to client
   
3. Request Security
   Client → Sends JWT in header → Backend verifies with Supabase → Allowed/Denied
   
4. Data Security
   All data → Encrypted in transit (HTTPS) → Encrypted at rest (Supabase)
   
5. Environment Security
   Secrets → Stored in .env → Never committed to git → Server only
```

## Summary

✅ **User data flows**: Frontend → Backend → Supabase → Storage
✅ **Authentication**: Handled entirely by Supabase Auth
✅ **User metadata**: Stored in JSONB field in auth.users table
✅ **Tokens**: JWT tokens generated and verified by Supabase
✅ **Security**: Industry-standard encryption and hashing
✅ **Scalability**: Supabase handles infrastructure

Your application is using **Supabase as the single source of truth** for all user authentication and data storage!
