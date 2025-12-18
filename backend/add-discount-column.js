/**
 * Script to add discount_price column to menu_items table
 * Run this once to enable the discount feature
 * 
 * Run in Supabase SQL Editor:
 * ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS discount_price DECIMAL(10,2);
 */

const { supabaseAdmin } = require('./config/supabase');

async function addDiscountColumn() {
  console.log('Checking if discount_price column exists...\n');

  try {
    // Test if column exists by querying it
    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .select('discount_price')
      .limit(1);

    if (!error) {
      console.log('✓ discount_price column already exists!');
      return;
    }

    console.log('Column does not exist. Please run this SQL in Supabase SQL Editor:\n');
    console.log('----------------------------------------');
    console.log('ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS discount_price DECIMAL(10,2);');
    console.log('----------------------------------------\n');
    console.log('After running the SQL, you can set discount prices from the admin panel.');

  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nPlease run this SQL in Supabase SQL Editor:');
    console.log('ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS discount_price DECIMAL(10,2);');
  }
}

addDiscountColumn();
