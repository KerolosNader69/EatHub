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

async function testCreateOrder() {
  console.log('🧪 Testing Order Creation\n');

  try {
    // First get a menu item
    console.log('1. Getting a menu item...');
    const { data: menuItem, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .limit(1)
      .single();

    if (menuError || !menuItem) {
      console.log('❌ No available menu items found:', menuError?.message);
      return;
    }
    console.log('✅ Found menu item:', menuItem.name, '-', menuItem.price);
    console.log('');

    // Generate order number
    const orderNumber = `EH${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
    console.log('2. Creating order with number:', orderNumber);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_number: orderNumber,
        customer_name: 'Test Customer',
        customer_phone: '1234567890',
        customer_address: 'Test Address 123',
        special_instructions: 'Test order',
        total_amount: menuItem.price,
        estimated_delivery: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
        status: 'received'
      }])
      .select()
      .single();

    if (orderError) {
      console.log('❌ Error creating order:', orderError.message);
      console.log('   Code:', orderError.code);
      console.log('   Details:', JSON.stringify(orderError, null, 2));
      return;
    }
    console.log('✅ Order created:', order.id);
    console.log('');

    // Create order item
    console.log('3. Creating order item...');
    const { data: orderItem, error: itemError } = await supabase
      .from('order_items')
      .insert([{
        order_id: order.id,
        menu_item_id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1
      }])
      .select()
      .single();

    if (itemError) {
      console.log('❌ Error creating order item:', itemError.message);
      console.log('   Code:', itemError.code);
      console.log('   Details:', JSON.stringify(itemError, null, 2));
      return;
    }
    console.log('✅ Order item created:', orderItem.id);
    console.log('');

    console.log('✅ SUCCESS! Order creation works correctly.');
    console.log('');
    console.log('Order details:');
    console.log('  Order Number:', order.order_number);
    console.log('  Total:', order.total_amount);
    console.log('  Status:', order.status);

    // Clean up - delete test order
    console.log('\n4. Cleaning up test order...');
    await supabase.from('order_items').delete().eq('order_id', order.id);
    await supabase.from('orders').delete().eq('id', order.id);
    console.log('✅ Test order deleted');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testCreateOrder();
