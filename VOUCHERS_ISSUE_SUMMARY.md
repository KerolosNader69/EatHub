# Vouchers System - Issue Summary & Fix

## 🔍 Problem Identified

**Error**: Vouchers and Rewards features returning 500 Internal Server Error

**Root Cause**: The `vouchers` and `rewards` tables **do not exist** in your Supabase database.

### Evidence:
```
Error: Could not find the table 'public.vouchers' in the schema cache
Code: PGRST205
```

## ✅ Solution (2 Steps)

### Step 1: Create Database Tables (REQUIRED)

Run this SQL in your Supabase SQL Editor:

**Quick Link**: https://supabase.com/dashboard/project/opcblscxvueihdkiraqt/sql

<details>
<summary>Click to see SQL script</summary>

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

ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active vouchers" ON vouchers
  FOR SELECT USING (is_active = true AND (expiry_date IS NULL OR expiry_date > NOW()));

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

ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active rewards" ON rewards
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow service role full access to rewards" ON rewards
  FOR ALL USING (true);

-- Insert sample data
INSERT INTO vouchers (code, title, description, discount_type, discount_value, minimum_order, expiry_date) VALUES
  ('WELCOME10', 'Welcome Discount', 'Get 10% off your first order', 'percentage', 10.00, 25.00, NOW() + INTERVAL '30 days'),
  ('SAVE5', 'Save $5', 'Save $5 on orders over $30', 'fixed', 5.00, 30.00, NOW() + INTERVAL '14 days'),
  ('FREESHIP', 'Free Delivery', 'Free delivery on orders over $20', 'fixed', 3.99, 20.00, NOW() + INTERVAL '7 days')
ON CONFLICT (code) DO NOTHING;

INSERT INTO rewards (title, description, points_cost, reward_type, reward_value) VALUES
  ('$5 Off Next Order', 'Get $5 off your next order', 500, 'discount', 5.00),
  ('$10 Off Next Order', 'Get $10 off your next order', 1000, 'discount', 10.00),
  ('Free Delivery', 'Free delivery on your next order', 300, 'discount', 3.99)
ON CONFLICT DO NOTHING;
```

</details>

### Step 2: Fix Service Key (RECOMMENDED)

Your `SUPABASE_SERVICE_KEY` appears incomplete. Get the full key:

1. Go to: https://supabase.com/dashboard/project/opcblscxvueihdkiraqt/settings/api
2. Copy the **service_role** key (should be 200+ characters)
3. Update `backend/.env`:
   ```
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Update Vercel environment variables if deployed

## 🧪 Test the Fix

After creating the tables, run:

```bash
cd backend
node test-vouchers-table.js
```

You should see all ✅ marks.

## 📚 Detailed Documentation

- **VOUCHERS_FIX_GUIDE.md** - Complete step-by-step guide
- **GET_SERVICE_KEY_INSTRUCTIONS.md** - How to get the correct service key
- **backend/test-vouchers-table.js** - Test script to verify the fix

## 🎯 What This Fixes

Once the tables are created:
- ✅ Admin can view all vouchers
- ✅ Admin can create new vouchers
- ✅ Admin can edit/delete vouchers
- ✅ Customers can view available vouchers
- ✅ Customers can apply voucher codes at checkout
- ✅ Same for rewards system

## ⏱️ Time to Fix

- **Step 1** (Create tables): ~2 minutes
- **Step 2** (Fix service key): ~3 minutes
- **Total**: ~5 minutes

## 🚀 No Redeployment Needed

Since you're using Supabase, the changes are immediate. Just refresh your admin dashboard after running the SQL.
