# Quick Fix Checklist - Vouchers System

## ☑️ Step-by-Step Checklist

### 1. Create Database Tables ⚠️ REQUIRED

- [ ] Go to Supabase Dashboard: https://supabase.com/dashboard/project/opcblscxvueihdkiraqt
- [ ] Click **SQL Editor** in left sidebar
- [ ] Click **New Query**
- [ ] Copy SQL from `VOUCHERS_ISSUE_SUMMARY.md` (or see below)
- [ ] Paste into SQL Editor
- [ ] Click **Run** button
- [ ] Verify success message appears

### 2. Verify Tables Created

- [ ] Go to **Table Editor** in Supabase Dashboard
- [ ] Confirm `vouchers` table exists with 3 sample rows
- [ ] Confirm `rewards` table exists with 3 sample rows

### 3. Fix Service Key (Optional but Recommended)

- [ ] Go to Settings → API in Supabase Dashboard
- [ ] Copy the **service_role** key (long JWT token)
- [ ] Open `backend/.env` file
- [ ] Replace `SUPABASE_SERVICE_KEY` with the full key
- [ ] Save the file

### 4. Update Vercel (If Deployed)

- [ ] Go to Vercel project settings
- [ ] Navigate to Environment Variables
- [ ] Update `SUPABASE_SERVICE_KEY` with the full key
- [ ] Save changes
- [ ] Redeploy (or it will auto-deploy on next push)

### 5. Test the Fix

- [ ] Run: `cd backend && node test-vouchers-table.js`
- [ ] Verify all tests show ✅
- [ ] Open admin dashboard in browser
- [ ] Navigate to Vouchers tab
- [ ] Verify vouchers load without errors
- [ ] Try creating a new voucher
- [ ] Verify it saves successfully

## 🎯 Expected Results

After completing the checklist:

✅ Admin dashboard loads vouchers without errors
✅ Can create new vouchers
✅ Can edit existing vouchers
✅ Can delete vouchers
✅ Same functionality for rewards
✅ Customers can see vouchers on homepage
✅ Customers can apply voucher codes at checkout

## 📝 Quick SQL (Copy This)

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
CREATE POLICY "Allow public read access to active vouchers" ON vouchers FOR SELECT USING (is_active = true AND (expiry_date IS NULL OR expiry_date > NOW()));
CREATE POLICY "Allow service role full access to vouchers" ON vouchers FOR ALL USING (true);

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
CREATE POLICY "Allow public read access to active rewards" ON rewards FOR SELECT USING (is_active = true);
CREATE POLICY "Allow service role full access to rewards" ON rewards FOR ALL USING (true);

-- Sample data
INSERT INTO vouchers (code, title, description, discount_type, discount_value, minimum_order, expiry_date) VALUES
  ('WELCOME10', 'Welcome Discount', 'Get 10% off your first order', 'percentage', 10.00, 25.00, NOW() + INTERVAL '30 days'),
  ('SAVE5', 'Save $5', 'Save $5 on orders over $30', 'fixed', 5.00, 30.00, NOW() + INTERVAL '14 days'),
  ('FREESHIP', 'Free Delivery', 'Free delivery on orders over $20', 'fixed', 3.99, 20.00, NOW() + INTERVAL '7 days')
ON CONFLICT (code) DO NOTHING;

INSERT INTO rewards (title, description, points_cost, reward_type, reward_value) VALUES
  ('$5 Off Next Order', 'Get $5 off your next order', 500, 'discount', 5.00),
  ('$10 Off Next Order', 'Get $10 off your next order', 1000, 'discount', 10.00),
  ('Free Delivery', 'Free delivery on your next order', 300, 'discount', 3.99);
```

## ⏱️ Time Required

- Step 1-2: 2 minutes
- Step 3-4: 3 minutes
- Step 5: 2 minutes
- **Total: ~7 minutes**

## 🆘 Need Help?

See detailed guides:
- `VOUCHERS_ISSUE_SUMMARY.md` - Quick overview
- `VOUCHERS_FIX_GUIDE.md` - Detailed step-by-step
- `GET_SERVICE_KEY_INSTRUCTIONS.md` - Service key help
