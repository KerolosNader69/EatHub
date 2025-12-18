const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTables() {
  console.log('🚀 Creating vouchers and rewards tables in Supabase...\n');

  try {
    // Create vouchers table
    console.log('Creating vouchers table...');
    const { error: vouchersError } = await supabase.rpc('exec_sql', {
      sql: `
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

        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Allow public read access to active vouchers" ON vouchers;
        DROP POLICY IF EXISTS "Allow authenticated users full access to vouchers" ON vouchers;

        -- Allow public read access to active vouchers
        CREATE POLICY "Allow public read access to active vouchers" ON vouchers
          FOR SELECT USING (is_active = true AND (expiry_date IS NULL OR expiry_date > NOW()));

        -- Allow service role full access
        CREATE POLICY "Allow service role full access to vouchers" ON vouchers
          FOR ALL USING (true);
      `
    });

    if (vouchersError) {
      console.log('Note: Using direct SQL execution instead of RPC...');
      // If RPC doesn't work, we'll need to use the Supabase dashboard SQL editor
      console.log('\n📋 Please run this SQL in your Supabase SQL Editor:\n');
      console.log(`
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
      `);
      console.log('\n⚠️  After running the SQL, press Enter to continue...');
      return;
    }

    console.log('✅ Tables created successfully!\n');

    // Insert sample data
    console.log('Inserting sample vouchers...');
    const { error: insertVouchersError } = await supabase
      .from('vouchers')
      .insert([
        {
          code: 'WELCOME10',
          title: 'Welcome Discount',
          description: 'Get 10% off your first order',
          discount_type: 'percentage',
          discount_value: 10.00,
          minimum_order: 25.00,
          expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          code: 'SAVE5',
          title: 'Save $5',
          description: 'Save $5 on orders over $30',
          discount_type: 'fixed',
          discount_value: 5.00,
          minimum_order: 30.00,
          expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          code: 'FREESHIP',
          title: 'Free Delivery',
          description: 'Free delivery on orders over $20',
          discount_type: 'fixed',
          discount_value: 3.99,
          minimum_order: 20.00,
          expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);

    if (insertVouchersError && insertVouchersError.code !== '23505') {
      console.log('⚠️  Error inserting vouchers:', insertVouchersError.message);
    } else {
      console.log('✅ Sample vouchers inserted');
    }

    console.log('Inserting sample rewards...');
    const { error: insertRewardsError } = await supabase
      .from('rewards')
      .insert([
        {
          title: '$5 Off Next Order',
          description: 'Get $5 off your next order',
          points_cost: 500,
          reward_type: 'discount',
          reward_value: 5.00
        },
        {
          title: '$10 Off Next Order',
          description: 'Get $10 off your next order',
          points_cost: 1000,
          reward_type: 'discount',
          reward_value: 10.00
        },
        {
          title: 'Free Delivery',
          description: 'Free delivery on your next order',
          points_cost: 300,
          reward_type: 'discount',
          reward_value: 3.99
        }
      ]);

    if (insertRewardsError) {
      console.log('⚠️  Error inserting rewards:', insertRewardsError.message);
    } else {
      console.log('✅ Sample rewards inserted');
    }

    console.log('\n✅ Setup complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTables();
