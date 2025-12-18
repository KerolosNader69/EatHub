# How to Get Your Supabase Service Key

## Current Issue

Your `.env` file has an incomplete `SUPABASE_SERVICE_KEY`:
```
SUPABASE_SERVICE_KEY=sb_secret_-62WZYmPOxYhVBSIPDW77A_iF3PaUay
```

This is only 41 characters, but a proper service key should be 200+ characters (a JWT token).

## Steps to Get the Correct Service Key

### 1. Go to Supabase Dashboard

Visit: https://supabase.com/dashboard/project/opcblscxvueihdkiraqt

### 2. Navigate to API Settings

1. Click on **Settings** (gear icon) in the left sidebar
2. Click on **API** under Project Settings

### 3. Copy the Service Role Key

You'll see two keys:
- **anon** / **public** key (this is already correct in your .env)
- **service_role** key ⚠️ **This is what you need**

The service_role key will look like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wY2Jsc2N4dnVlaWhka2lyYXF0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY4OTc1NywiZXhwIjoyMDgwMjY1NzU3fQ.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 4. Update Your .env File

Replace the current `SUPABASE_SERVICE_KEY` in `backend/.env` with the full service_role key:

```env
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wY2Jsc2N4dnVlaWhka2lyYXF0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY4OTc1NywiZXhwIjoyMDgwMjY1NzU3fQ.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 5. Update Vercel Environment Variables

If you're deploying to Vercel, also update the environment variable there:

```bash
vercel env add SUPABASE_SERVICE_KEY production
```

Then paste the full service_role key when prompted.

Or use the Vercel Dashboard:
1. Go to your project settings
2. Click **Environment Variables**
3. Find `SUPABASE_SERVICE_KEY`
4. Click **Edit** and paste the full key
5. Click **Save**
6. Redeploy your application

## Why This Matters

The service_role key:
- Bypasses Row Level Security (RLS) policies
- Allows admin operations like creating/updating/deleting vouchers
- Is required for the admin dashboard to function properly

Without the correct service key, admin operations will fail even after creating the tables.

## Security Note

⚠️ **NEVER commit the service_role key to Git or share it publicly!**

The service_role key has full access to your database and should be kept secret. Only use it in:
- Backend server code
- Environment variables
- Secure deployment platforms (like Vercel)

Never use it in frontend code or expose it to clients.
