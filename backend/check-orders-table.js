const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkOrdersTables() {
  console.log('🔍 Checking Orders Tables\n');

  try {
    // Check orders table
    console.log('1. Checking orders table...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);

    if (ordersError) {
      console.log('❌ Orders table error:', ordersError.message);
      console.log('   Code:', ordersError.code);
    } else {
      console.log('✅ Orders table exists');
      console.log('   Sample:', orders);
    }
    console.log('');

    // Check order_items table
    console.log('2. Checking order_items table...');
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .limit(1);

    if (itemsError) {
      console.log('❌ Order_items table error:', itemsError.message);
      console.log('   Code:', itemsError.code);
    } else {
      console.log('✅ Order_items table exists');
      console.log('   Sample:', orderItems);
    }
    console.log('');

    // Check menu_items table
    console.log('3. Checking menu_items table...');
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .limit(1);

    if (menuError) {
      console.log('❌ Menu_items table error:', menuError.message);
    } else {
      console.log('✅ Menu_items table exists');
      console.log('   Sample:', menuItems);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkOrdersTables();
