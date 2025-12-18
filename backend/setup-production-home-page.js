const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for admin operations
);

async function setupProductionTables() {
  console.log('Setting up production database tables for home page features...\n');
  
  try {
    // First, add missing columns to menu_items table
    console.log('Adding featured columns to menu_items table...');
    
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (alterError) {
      console.log('❌ Error adding columns:', alterError.message);
    } else {
      console.log('✅ Added featured columns to menu_items');
    }
    
    // Create categories table
    console.log('\nCreating categories table...');
    const { error: categoriesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS categories (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          display_name TEXT NOT NULL,
          icon TEXT,
          background_color TEXT DEFAULT '#FFE5E5',
          is_active BOOLEAN DEFAULT true,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;
        CREATE POLICY "Allow public read access to categories" ON categories
          FOR SELECT USING (true);
      `
    });
    
    if (categoriesError) {
      console.log('❌ Error creating categories table:', categoriesError.message);
    } else {
      console.log('✅ Created categories table');
    }
    
    // Create vouchers table
    console.log('\nCreating vouchers table...');
    const { error: vouchersError } = await supabase.rpc('exec_sql', {
      sql: `
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
        
        DROP POLICY IF EXISTS "Allow public read access to active vouchers" ON vouchers;
        CREATE POLICY "Allow public read access to active vouchers" ON vouchers
          FOR SELECT USING (is_active = true AND (expiry_date IS NULL OR expiry_date > NOW()));
      `
    });
    
    if (vouchersError) {
      console.log('❌ Error creating vouchers table:', vouchersError.message);
    } else {
      console.log('✅ Created vouchers table');
    }
    
    // Create rewards table
    console.log('\nCreating rewards table...');
    const { error: rewardsError } = await supabase.rpc('exec_sql', {
      sql: `
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
        
        DROP POLICY IF EXISTS "Allow public read access to active rewards" ON rewards;
        CREATE POLICY "Allow public read access to active rewards" ON rewards
          FOR SELECT USING (is_active = true);
      `
    });
    
    if (rewardsError) {
      console.log('❌ Error creating rewards table:', rewardsError.message);
    } else {
      console.log('✅ Created rewards table');
    }
    
    console.log('\n✅ Database setup completed!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupProductionTables();