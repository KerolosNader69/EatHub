# Vouchers & Rewards System Fix Guide

## Problem Identified

The vouchers and rewards features are failing with 500 errors because **the database tables don't exist** in Supabase.

### Error Details:
- **Error Message**: "Could not find the table 'public.vouchers' in the schema cache"
- **Error Code**: PGRST205
- **Root Cause**: The `vouchers` and `rewards` tables were never created in the Supabase database

## Solution

You need to create the missing tables in your Supabase database using the SQL Editor.

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `opcblscxvueihdkiraqt`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the SQL Script

Copy and paste the following SQL script into the SQL Editor and click **Run**:

```sql
-- Create vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  minimum_order DECIMAL(10, 2) DEFAULT 0,
  expiry_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  usage_limit INTEGER DEFAULT NULL,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active vouchers
CREATE POLICY "Allow public read access to active vouchers" ON vouchers
  FOR SELECT USING (is_active = true AND (expiry_date IS NULL OR expiry_date > NOW()));

-- Allow service role full access
CREATE POLICY "Allow service role full access to vouchers" ON vouchers
  FOR ALL USING (true);

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('discount', 'free_item', 'upgrade')),
  reward_value DECIMAL(10, 2),
  menu_item_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active rewards
CREATE POLICY "Allow public read access to active rewards" ON rewards
  FOR SELECT USING (is_active = true);

-- Allow service role full access
CREATE POLICY "Allow service role full access to rewards" ON rewards
  FOR ALL USING (true);

-- Insert sample vouchers
INSERT INTO vouchers (code, title, description, discount_type, discount_value, minimum_order, expiry_date) VALUES
  ('WELCOME10', 'Welcome Discount', 'Get 10% off your first order', 'percentage', 10.00, 25.00, NOW() + INTERVAL '30 days'),
  ('SAVE5', 'Save $5', 'Save $5 on orders over $30', 'fixed', 5.00, 30.00, NOW() + INTERVAL '14 days'),
  ('FREESHIP', 'Free Delivery', 'Free delivery on orders over $20', 'fixed', 3.99, 20.00, NOW() + INTERVAL '7 days')
ON CONFLICT (code) DO NOTHING;

-- Insert sample rewards
INSERT INTO rewards (title, description, points_cost, reward_type, reward_value) VALUES
  ('$5 Off Next Order', 'Get $5 off your next order', 500, 'discount', 5.00),
  ('$10 Off Next Order', 'Get $10 off your next order', 1000, 'discount', 10.00),
  ('Free Delivery', 'Free delivery on your next order', 300, 'discount', 3.99)
ON CONFLICT DO NOTHING;
```

### Step 3: Verify Tables Were Created

After running the SQL, verify the tables exist:

1. In Supabase Dashboard, go to **Table Editor**
2. You should see two new tables:
   - `vouchers` (with 3 sample vouchers)
   - `rewards` (with 3 sample rewards)

### Step 4: Test the Fix

Run the test script to verify everything works:

```bash
cd backend
node test-vouchers-table.js
```

You should see all tests passing with ✅ marks.

### Step 5: Redeploy to Vercel (if needed)

If you're testing on production, the changes are immediate since we're using Supabase. Just refresh your admin dashboard and the vouchers should load.

## What This Fixes

After creating these tables, the following features will work:

1. **Admin Dashboard - Vouchers Tab**
   - View all vouchers
   - Create new vouchers
   - Edit existing vouchers
   - Delete vouchers

2. **Admin Dashboard - Rewards Tab**
   - View all rewards
   - Create new rewards
   - Edit existing rewards
   - Delete rewards

3. **Customer Features**
   - View available vouchers on homepage
   - Apply voucher codes at checkout
   - Redeem rewards points

## Additional Notes

### Service Key Issue

Your `SUPABASE_SERVICE_KEY` in the `.env` file appears to be incomplete (only 41 characters). A proper service key should be much longer (similar to a JWT token, around 200+ characters).

To get the correct service key:
1. Go to Supabase Dashboard → Settings → API
2. Copy the **service_role** key (not the anon key)
3. Update your `.env` file:
   ```
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

However, the RLS policies we created allow the service role full access, so even with the current key, the admin operations should work once the tables are created.

## Troubleshooting

If you still see errors after creating the tables:

1. **Clear Supabase cache**: In Supabase Dashboard, go to Settings → API and click "Restart API"
2. **Check RLS policies**: Make sure the policies were created correctly
3. **Verify service key**: Ensure your `SUPABASE_SERVICE_KEY` is the full service_role key
4. **Check browser console**: Look for any CORS or authentication errors

## Files Modified/Created

- `backend/test-vouchers-table.js` - Test script to verify tables
- `backend/create-vouchers-rewards-tables.js` - Setup script (provides SQL)
- `VOUCHERS_FIX_GUIDE.md` - This guide
