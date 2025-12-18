# User Authentication System

## Overview
Added complete user authentication system with signup, login, and settings pages for EatHub customers. Users can browse the menu freely but must create an account or login when they try to checkout.

## Authentication Flow

```
Menu (Browse) → Add to Cart → Proceed to Checkout
                                      ↓
                              [Auth Check]
                                      ↓
                    ┌─────────────────┴─────────────────┐
                    ↓                                   ↓
            Not Authenticated                   Authenticated
                    ↓                                   ↓
            Signup/Login Page                   Checkout Page
         (with context message)              (pre-filled form)
                    ↓
            Create Account/Login
                    ↓
            Auto-redirect to Checkout
         (form pre-filled with user data)
```

## Features Implemented

### 1. User Signup (`/user/signup`)
- Full name, email, phone, address, and password fields
- Form validation with error messages
- Auto-login after successful signup
- Link to login page for existing users
- Context-aware messaging (shows different message when coming from checkout)
- Automatic redirect back to checkout after signup

### 2. User Login (`/user/login`)
- Email and password authentication
- Form validation
- Error handling for invalid credentials
- Link to signup page for new users
- Context-aware messaging (shows different message when coming from checkout)
- Automatic redirect back to checkout after login

### 3. User Settings (`/user/settings`)
- View and edit profile information
- Update full name, email, phone, and address
- Protected route (requires authentication)
- Logout functionality
- Success/error messages for updates

### 4. Checkout Integration
- Automatically checks authentication when user tries to checkout
- Redirects to signup if not authenticated
- Stores intended destination (checkout) in session
- Pre-fills checkout form with user data after authentication
- Seamless flow from cart → signup/login → checkout

### 4. Navigation Integration
- Shows "Login" button when not authenticated
- Shows user icon with name when authenticated
- Links to settings page for logged-in users
- Responsive mobile menu support

## Backend API Endpoints

### POST `/api/auth/user/signup`
Creates a new user account with profile information.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "address": "123 Main St",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "fullName": "John Doe",
    "phone": "1234567890",
    "address": "123 Main St"
  }
}
```

### POST `/api/auth/user/login`
Authenticates existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "fullName": "John Doe",
    "phone": "1234567890",
    "address": "123 Main St"
  }
}
```

### PUT `/api/auth/user/update`
Updates user profile information (requires authentication).

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "fullName": "John Doe Updated",
  "email": "john.new@example.com",
  "phone": "9876543210",
  "address": "456 New St"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "user_id",
    "email": "john.new@example.com",
    "fullName": "John Doe Updated",
    "phone": "9876543210",
    "address": "456 New St"
  }
}
```

## User Flow

1. **Guest Browsing:**
   - Users can browse menu and add items to cart without authentication
   - No signup/login required for browsing

2. **Checkout Trigger:**
   - When user clicks "Proceed to Checkout" with items in cart
   - System checks if user is authenticated
   - If not authenticated, redirects to signup page
   - Message shows: "Create an account to complete your order"

3. **New User Signup:**
   - Fill in registration form (name, email, phone, address, password)
   - Auto-login after successful signup
   - Automatically redirected back to checkout page
   - Form pre-filled with user information

4. **Existing User Login:**
   - Can click "Login here" link from signup page
   - Enter credentials
   - Automatically redirected back to checkout page
   - Form pre-filled with saved user information

5. **Authenticated User:**
   - See their name in navigation
   - Click to access settings page
   - Edit profile information
   - Logout when done
   - Can proceed directly to checkout on future orders

## Security Features

- Passwords stored securely via Supabase Auth
- JWT token-based authentication
- Protected routes require valid token
- Token stored in localStorage
- Auto-logout on invalid token

## Styling

All pages feature:
- Modern gradient backgrounds
- Responsive design for mobile/tablet/desktop
- Smooth transitions and hover effects
- Clear error messages
- Accessible form inputs

## Next Steps

To use the authentication system:

1. Ensure Supabase is configured in `backend/.env`
2. Start the backend server
3. Start the frontend development server
4. Navigate to `/user/signup` to create an account
5. Test login and settings functionality

## Files Created/Modified

**New Files:**
- `frontend/src/pages/UserSignup.jsx`
- `frontend/src/pages/UserSignup.css`
- `frontend/src/pages/UserLogin.jsx`
- `frontend/src/pages/UserLogin.css`
- `frontend/src/pages/UserSettings.jsx`
- `frontend/src/pages/UserSettings.css`

**Modified Files:**
- `backend/routes/auth.js` - Added user auth endpoints
- `frontend/src/App.jsx` - Added user auth routes
- `frontend/src/components/Navigation.jsx` - Added user menu
- `frontend/src/components/Navigation.css` - Added user styles
