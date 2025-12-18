const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🗑️  Delete All Vouchers from Supabase\n');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file');
  process.exit(1);
}

console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Service Key: ${supabaseServiceKey.substring(0, 20)}...`);
console.log('');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function deleteAllVouchers() {
  try {
    // First, list all vouchers
    console.log('📋 Fetching all vouchers...');
    const { data: vouchers, error: fetchError } = await supabase
      .from('vouchers')
      .select('*');

    if (fetchError) {
      console.error('❌ Error fetching vouchers:', fetchError.message);
      console.error('Details:', JSON.stringify(fetchError, null, 2));
      return;
    }

    if (!vouchers || vouchers.length === 0) {
      console.log('✅ No vouchers found. Database is already empty.');
      return;
    }

    console.log(`\n📊 Found ${vouchers.length} voucher(s):\n`);
    vouchers.forEach((v, index) => {
      console.log(`${index + 1}. ${v.code} - ${v.title}`);
      console.log(`   ID: ${v.id}`);
      console.log(`   Active: ${v.is_active}`);
      console.log(`   Expires: ${v.expiry_date || 'Never'}`);
      console.log('');
    });

    console.log('⚠️  WARNING: This will DELETE ALL vouchers!');
    console.log('Waiting 3 seconds... Press Ctrl+C to cancel.\n');
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('🗑️  Deleting all vouchers...');
    
    // Delete all vouchers
    const { error: deleteError, count } = await supabase
      .from('vouchers')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000'); // This matches all UUIDs

    if (deleteError) {
      console.error('❌ Error deleting vouchers:', deleteError.message);
      console.error('Details:', JSON.stringify(deleteError, null, 2));
      return;
    }

    console.log(`✅ Successfully deleted ${count || vouchers.length} voucher(s)!\n`);

    // Verify deletion
    console.log('🔍 Verifying deletion...');
    const { data: remainingVouchers, error: verifyError } = await supabase
      .from('vouchers')
      .select('count');

    if (verifyError) {
      console.log('⚠️  Could not verify deletion:', verifyError.message);
    } else {
      const remaining = remainingVouchers?.[0]?.count || 0;
      if (remaining === 0) {
        console.log('✅ Verified: All vouchers deleted successfully!');
      } else {
        console.log(`⚠️  Warning: ${remaining} voucher(s) still remain`);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('Stack:', error.stack);
  }
}

deleteAllVouchers();
