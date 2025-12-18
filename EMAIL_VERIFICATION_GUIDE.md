# Email Verification Guide

## Current Behavior

After signup, users will see a message:

```
📧 Check Your Email

We've sent a verification link to:
user@example.com

Please check your email and click the verification link 
to activate your account. After verifying, come back 
and login to continue your order.

[Go to Login]
```

## How It Works

### Signup Flow with Email Verification

1. User fills signup form
2. Clicks "Sign Up & Continue"
3. Account created in Supabase
4. **Email verification screen appears**
5. User checks email
6. Clicks verification link in email
7. Returns to site
8. Clicks "Go to Login"
9. Logs in with verified account
10. Continues to checkout

### What Happens Behind the Scenes

```
User Signup
    ↓
Supabase creates account
    ↓
Sends verification email
    ↓
Returns success (no token)
    ↓
Frontend shows "Check Email" message
    ↓
User clicks link in email
    ↓
Email verified in Supabase
    ↓
User can now login
```

## Option 1: Keep Email Verification (Recommended for Production)

**Pros**:
- ✅ Prevents fake accounts
- ✅ Ensures valid email addresses
- ✅ Better security
- ✅ Reduces spam

**Cons**:
- ⚠️ Extra step for users
- ⚠️ Requires email service
- ⚠️ Users might not check email immediately

**No changes needed** - this is already implemented!

## Option 2: Disable Email Verification (For Development/Testing)

If you want instant signup without email verification:

### Step 1: Disable in Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: `opcblscxvueihdkiraqt`
3. Navigate to **Authentication** → **Settings**
4. Find **Email Confirmation**
5. **Uncheck** "Enable email confirmations"
6. Click **Save**

### Step 2: Update Backend (Optional)

The backend already handles both cases:
- If email verification is enabled: Returns success without token
- If email verification is disabled: Returns token for auto-login

No code changes needed!

### Step 3: Test

After disabling email verification:
1. User fills signup form
2. Clicks "Sign Up & Continue"
3. **Immediately logged in** (no email check)
4. Modal closes
5. Continues to checkout

## Email Verification Settings in Supabase

### Current Settings

Check your Supabase settings:

**Authentication → Settings → Email Confirmation**

Options:
- ✅ **Enable email confirmations** (default)
  - Users must verify email before login
  - Sends verification email
  - Shows "Check Email" message

- ⬜ **Disable email confirmations**
  - Users can login immediately
  - No verification email sent
  - Auto-login after signup

### Email Templates

If email verification is enabled, customize the email template:

1. Go to **Authentication** → **Email Templates**
2. Select **Confirm signup**
3. Customize the email content
4. Use variables:
   - `{{ .ConfirmationURL }}` - Verification link
   - `{{ .SiteURL }}` - Your site URL
   - `{{ .Email }}` - User's email

Example template:
```html
<h2>Welcome to EatHub!</h2>
<p>Thanks for signing up! Please confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Email</a></p>
```

## Testing Email Verification

### With Email Verification Enabled

1. **Signup**:
   ```
   Name: Test User
   Email: test@example.com
   Phone: 1234567890
   Address: 123 Test St
   Password: password123
   ```

2. **Check Email**:
   - Look for email from Supabase
   - Subject: "Confirm Your Signup"
   - Click verification link

3. **Login**:
   - Return to site
   - Click "Go to Login"
   - Enter email and password
   - Continue to checkout

### With Email Verification Disabled

1. **Signup**:
   - Fill form
   - Click "Sign Up & Continue"
   - **Immediately logged in**
   - Modal closes
   - Continue to checkout

## Troubleshooting

### Issue: Not receiving verification email

**Solutions**:
1. Check spam/junk folder
2. Verify email address is correct
3. Check Supabase email settings
4. Check Supabase email quota (free tier has limits)

### Issue: Verification link doesn't work

**Solutions**:
1. Check link hasn't expired (usually 24 hours)
2. Verify Site URL is set correctly in Supabase
3. Check redirect URL settings

### Issue: Want to resend verification email

**Solution**: User needs to signup again, or you can manually verify in Supabase Dashboard:
1. Go to Authentication → Users
2. Find the user
3. Click on user
4. Manually set `email_confirmed_at` timestamp

## Recommended Setup

### For Development
- **Disable** email verification
- Faster testing
- No email service needed

### For Production
- **Enable** email verification
- Better security
- Prevents fake accounts
- Ensures valid contact info

## Current Implementation

The code already handles both scenarios:

```javascript
// Backend returns different responses
if (emailVerificationEnabled) {
  return {
    success: true,
    message: 'Check your email for verification'
    // No token
  };
} else {
  return {
    success: true,
    token: 'jwt_token_here',
    user: { ... }
  };
}

// Frontend handles both
if (data.success && !data.token) {
  // Show email verification message
  setShowEmailVerification(true);
} else if (data.token && data.user) {
  // Auto-login
  login(data.token, data.user);
  onSuccess();
}
```

## Summary

✅ **Email verification is now handled**
- Shows "Check Email" message after signup
- Provides clear instructions
- Switches to login tab after
- Works with both enabled/disabled verification

**To disable email verification** (optional):
1. Go to Supabase Dashboard
2. Authentication → Settings
3. Uncheck "Enable email confirmations"
4. Save

**No code changes needed** - the implementation handles both cases automatically!
