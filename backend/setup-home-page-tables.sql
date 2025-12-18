-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  icon TEXT, -- SVG path or image URL
  background_color TEXT DEFAULT '#FFE5E5',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to categories" ON categories
  FOR SELECT USING (true);

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated users full access to categories" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Vouchers Table
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
  usage_limit INTEGER DEFAULT NULL, -- NULL means unlimited
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active vouchers
CREATE POLICY "Allow public read access to active vouchers" ON vouchers
  FOR SELECT USING (is_active = true AND (expiry_date IS NULL OR expiry_date > NOW()));

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated users full access to vouchers" ON vouchers
  FOR ALL USING (auth.role() = 'authenticated');

-- Rewards Table
CREATE TABLE IF NOT EXISTS rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('discount', 'free_item', 'upgrade')),
  reward_value DECIMAL(10, 2), -- For discount type
  menu_item_id UUID REFERENCES menu_items(id), -- For free_item type
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active rewards
CREATE POLICY "Allow public read access to active rewards" ON rewards
  FOR SELECT USING (is_active = true);

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated users full access to rewards" ON rewards
  FOR ALL USING (auth.role() = 'authenticated');

-- User Rewards Points Table (for tracking user points)
CREATE TABLE IF NOT EXISTS user_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- This would reference auth.users if using Supabase auth
  current_points INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own rewards
CREATE POLICY "Users can read their own rewards" ON user_rewards
  FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to update their own rewards
CREATE POLICY "Users can update their own rewards" ON user_rewards
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow system to insert new user rewards
CREATE POLICY "Allow system to insert user rewards" ON user_rewards
  FOR INSERT WITH CHECK (true);

-- Reward Transactions Table (for tracking redemptions)
CREATE TABLE IF NOT EXISTS reward_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_id UUID REFERENCES rewards(id),
  points_used INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'redeem')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE reward_transactions ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own transactions
CREATE POLICY "Users can read their own transactions" ON reward_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Allow system to insert transactions
CREATE POLICY "Allow system to insert transactions" ON reward_transactions
  FOR INSERT WITH CHECK (true);

-- Add featured flag to menu_items if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'menu_items' AND column_name = 'is_featured') THEN
        ALTER TABLE menu_items ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'menu_items' AND column_name = 'featured_order') THEN
        ALTER TABLE menu_items ADD COLUMN featured_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- Insert default categories
INSERT INTO categories (name, display_name, icon, background_color, sort_order) VALUES
  ('food', 'Food', '🍽️', '#FFE5E5', 1),
  ('groceries', 'Groceries', '🛒', '#E5F5E5', 2),
  ('health-beauty', 'Health & Beauty', '💄', '#E5E5FF', 3),
  ('gift-donate', 'Gift & Donate', '🎁', '#FFE5F5', 4),
  ('store', 'Store', '🏪', '#F5F5E5', 5)
ON CONFLICT (name) DO NOTHING;

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