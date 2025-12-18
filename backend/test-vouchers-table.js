const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔍 Testing Vouchers Table\n');
console.log('Environment Variables:');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
console.log('Service Key Length:', supabaseServiceKey ? supabaseServiceKey.length : 0);
console.log('');

// Create both clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase;

async function testVouchersTable() {
  try {
    // Test 1: Check if table exists by trying to select
    console.log('Test 1: Checking if vouchers table exists...');
    const { data: selectData, error: selectError } = await supabase
      .from('vouchers')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.log('❌ Error selecting from vouchers:', selectError.message);
      console.log('Error details:', JSON.stringify(selectError, null, 2));
    } else {
      console.log('✅ Vouchers table exists');
      console.log('Current vouchers count:', selectData?.length || 0);
    }
    console.log('');

    // Test 2: Try to fetch all vouchers with admin client
    console.log('Test 2: Fetching all vouchers with admin client...');
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (adminError) {
      console.log('❌ Error fetching vouchers with admin client:', adminError.message);
      console.log('Error details:', JSON.stringify(adminError, null, 2));
    } else {
      console.log('✅ Successfully fetched vouchers');
      console.log('Vouchers found:', adminData?.length || 0);
      if (adminData && adminData.length > 0) {
        console.log('Sample voucher:', JSON.stringify(adminData[0], null, 2));
      }
    }
    console.log('');

    // Test 3: Try to create a voucher with admin client
    console.log('Test 3: Creating a test voucher with admin client...');
    const testVoucher = {
      code: 'TEST' + Date.now(),
      title: 'Test Voucher',
      description: 'Test voucher for debugging',
      discount_type: 'percentage',
      discount_value: 10,
      minimum_order: 0,
      is_active: true,
      used_count: 0
    };
    
    const { data: createData, error: createError } = await supabaseAdmin
      .from('vouchers')
      .insert([testVoucher])
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Error creating voucher:', createError.message);
      console.log('Error details:', JSON.stringify(createError, null, 2));
    } else {
      console.log('✅ Successfully created voucher');
      console.log('Created voucher:', JSON.stringify(createData, null, 2));
      
      // Clean up - delete the test voucher
      const { error: deleteError } = await supabaseAdmin
        .from('vouchers')
        .delete()
        .eq('id', createData.id);
      
      if (!deleteError) {
        console.log('✅ Test voucher cleaned up');
      }
    }
    console.log('');

    // Test 4: Check RLS policies
    console.log('Test 4: Checking RLS policies...');
    const { data: policyData, error: policyError } = await supabaseAdmin
      .from('vouchers')
      .select('*')
      .limit(1);
    
    if (policyError) {
      console.log('❌ RLS policy issue:', policyError.message);
    } else {
      console.log('✅ RLS policies allow admin access');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testVouchersTable();
