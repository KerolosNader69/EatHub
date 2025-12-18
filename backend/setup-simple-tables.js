const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use anon key for now
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function setupSimpleTables() {
  console.log('Setting up database tables...\n');
  
  try {
    // Test connection first
    console.log('Testing connection...');
    const { data, error } = await supabase.from('menu_items').select('id').limit(1);
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return;
    }
    console.log('✅ Connection successful');
    
    // Try to insert sample data to see what works
    console.log('\nTesting table creation by inserting data...');
    
    // Try categories
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .insert([
          { name: 'food', display_name: 'Food', icon: '🍽️', sort_order: 1 }
        ])
        .select();
      
      if (categoryError) {
        console.log('❌ Categories table issue:', categoryError.message);
      } else {
        console.log('✅ Categories table works');
      }
    } catch (err) {
      console.log('❌ Categories error:', err.message);
    }
    
    // Try vouchers
    try {
      const { data: voucherData, error: voucherError } = await supabase
        .from('vouchers')
        .insert([
          { 
            code: 'TEST10', 
            title: 'Test Voucher', 
            discount_type: 'percentage', 
            discount_value: 10 
          }
        ])
        .select();
      
      if (voucherError) {
        console.log('❌ Vouchers table issue:', voucherError.message);
      } else {
        console.log('✅ Vouchers table works');
      }
    } catch (err) {
      console.log('❌ Vouchers error:', err.message);
    }
    
    // Try rewards
    try {
      const { data: rewardData, error: rewardError } = await supabase
        .from('rewards')
        .insert([
          { 
            title: 'Test Reward', 
            points_cost: 100, 
            reward_type: 'discount',
            reward_value: 5.00
          }
        ])
        .select();
      
      if (rewardError) {
        console.log('❌ Rewards table issue:', rewardError.message);
      } else {
        console.log('✅ Rewards table works');
      }
    } catch (err) {
      console.log('❌ Rewards error:', err.message);
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupSimpleTables();