require('dotenv').config({ path: __dirname + '/.env' });
const supabase = require('./config/supabase');

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...\n');

  try {
    // Test 1: Check menu_items table
    console.log('1. Testing menu_items table...');
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .limit(5);

    if (menuError) {
      console.error('❌ Menu items error:', menuError.message);
    } else {
      console.log(`✅ Menu items table accessible. Found ${menuItems.length} items.`);
      if (menuItems.length > 0) {
        console.log('   Sample item:', {
          id: menuItems[0].id,
          name: menuItems[0].name,
          available: menuItems[0].available
        });
      }
    }

    // Test 2: Check orders table
    console.log('\n2. Testing orders table...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(5);

    if (ordersError) {
      console.error('❌ Orders error:', ordersError.message);
    } else {
      console.log(`✅ Orders table accessible. Found ${orders.length} orders.`);
      if (orders.length > 0) {
        console.log('   Sample order:', {
          id: orders[0].id,
          order_number: orders[0].order_number,
          status: orders[0].status
        });
      }
    }

    // Test 3: Check order_items table
    console.log('\n3. Testing order_items table...');
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('*')
      .limit(5);

    if (orderItemsError) {
      console.error('❌ Order items error:', orderItemsError.message);
    } else {
      console.log(`✅ Order items table accessible. Found ${orderItems.length} items.`);
    }

    // Test 4: Test authentication
    console.log('\n4. Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Auth error:', authError.message);
    } else {
      console.log('✅ Authentication system accessible.');
    }

    console.log('\n✅ All tests completed!');
    console.log('\nConnection Details:');
    console.log('URL:', process.env.SUPABASE_URL);
    console.log('Key:', process.env.SUPABASE_ANON_KEY ? '***' + process.env.SUPABASE_ANON_KEY.slice(-10) : 'Not set');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
  }
}

testSupabaseConnection();
