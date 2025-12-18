# Checkout Authentication Flow

## Summary
Modified the user authentication system so that signup/login is triggered when users attempt to checkout, not when they first visit the website.

## Key Changes

### 1. Checkout Page (`frontend/src/pages/Checkout.jsx`)
- Added authentication check using `useAuth` hook
- Redirects to signup page if user is not authenticated
- Stores intended destination (`/checkout`) in sessionStorage
- Pre-fills form with user data if authenticated
- Returns null while redirecting to prevent flash of content

### 2. User Signup Page (`frontend/src/pages/UserSignup.jsx`)
- Detects if user came from checkout via sessionStorage
- Shows context-aware message: "Create an account to complete your order"
- Redirects back to checkout after successful signup
- Hides "Continue browsing menu" link when coming from checkout

### 3. User Login Page (`frontend/src/pages/UserLogin.jsx`)
- Detects if user came from checkout via sessionStorage
- Shows context-aware message: "Login to complete your order"
- Redirects back to checkout after successful login
- Hides "Continue browsing menu" link when coming from checkout

## User Experience Flow

### Guest User Journey:
1. ✅ Browse menu freely (no authentication required)
2. ✅ Add items to cart (no authentication required)
3. ✅ Click "Proceed to Checkout"
4. 🔒 **Redirected to Signup Page** with message: "Create an account to complete your order"
5. ✅ Fill signup form (name, email, phone, address, password)
6. ✅ Auto-login after signup
7. ✅ **Automatically redirected back to Checkout**
8. ✅ Form pre-filled with user information
9. ✅ Complete order

### Returning User Journey:
1. ✅ Browse menu freely
2. ✅ Add items to cart
3. ✅ Click "Proceed to Checkout"
4. 🔒 **Redirected to Login Page** (can click "Login here" from signup)
5. ✅ Enter credentials
6. ✅ **Automatically redirected back to Checkout**
7. ✅ Form pre-filled with saved information
8. ✅ Complete order

### Authenticated User Journey:
1. ✅ Browse menu (sees their name in navigation)
2. ✅ Add items to cart
3. ✅ Click "Proceed to Checkout"
4. ✅ **Directly access Checkout** (no redirect)
5. ✅ Form pre-filled with saved information
6. ✅ Complete order

## Technical Implementation

### Session Storage Usage
```javascript
// Store redirect destination before redirecting to auth
sessionStorage.setItem('redirectAfterAuth', '/checkout');

// Check and redirect after successful auth
const redirectTo = sessionStorage.getItem('redirectAfterAuth');
if (redirectTo) {
  sessionStorage.removeItem('redirectAfterAuth');
  navigate(redirectTo);
}
```

### Authentication Check in Checkout
```javascript
useEffect(() => {
  if (!isAuthenticated) {
    sessionStorage.setItem('redirectAfterAuth', '/checkout');
    navigate('/user/signup');
  }
}, [isAuthenticated, navigate]);
```

### Form Pre-filling
```javascript
useEffect(() => {
  if (isAuthenticated && user) {
    setFormData(prev => ({
      ...prev,
      name: user.fullName || '',
      phone: user.phone || '',
      address: user.address || ''
    }));
  }
}, [isAuthenticated, user]);
```

## Benefits

1. **Frictionless Browsing**: Users can explore the menu without barriers
2. **Just-in-Time Authentication**: Only ask for account when necessary
3. **Seamless Flow**: Automatic redirect back to checkout after auth
4. **Better UX**: Pre-filled forms save time for users
5. **Context-Aware**: Different messages based on user journey
6. **Data Collection**: Ensures all orders have valid customer information

## Files Modified

- `frontend/src/pages/Checkout.jsx` - Added auth check and redirect
- `frontend/src/pages/UserSignup.jsx` - Added context detection and redirect
- `frontend/src/pages/UserLogin.jsx` - Added context detection and redirect
- `frontend/src/pages/UserSignup.css` - Added back-to-menu link styles
- `USER_AUTH_GUIDE.md` - Updated documentation

## Testing Checklist

- [ ] Browse menu without authentication
- [ ] Add items to cart without authentication
- [ ] Click checkout and verify redirect to signup
- [ ] Complete signup and verify redirect back to checkout
- [ ] Verify checkout form is pre-filled with user data
- [ ] Test login flow from signup page
- [ ] Verify returning users go directly to checkout
- [ ] Test logout and re-checkout flow
- [ ] Verify mobile responsiveness
