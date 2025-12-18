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

async function deleteAllVouchers() {
  console.log('🗑️  Deleting All Vouchers from Production Database\n');

  try {
    // First, show what will be deleted
    console.log('Fetching current vouchers...');
    const { data: vouchers, error: fetchError } = await supabase
      .from('vouchers')
      .select('*');

    if (fetchError) {
      console.error('❌ Error fetching vouchers:', fetchError.message);
      return;
    }

    if (!vouchers || vouchers.length === 0) {
      console.log('✅ No vouchers to delete. Database is already empty.');
      return;
    }

    console.log(`\nFound ${vouchers.length} voucher(s):`);
    vouchers.forEach(v => {
      console.log(`  - ${v.code}: ${v.title} (ID: ${v.id})`);
    });

    console.log('\n⚠️  WARNING: This will delete ALL vouchers from the production database!');
    console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');

    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('Deleting vouchers...');
    
    // Delete all vouchers
    const { error: deleteError } = await supabase
      .from('vouchers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using a condition that's always true)

    if (deleteError) {
      console.error('❌ Error deleting vouchers:', deleteError.message);
      return;
    }

    console.log('✅ All vouchers deleted successfully!\n');

    // Verify deletion
    const { data: remainingVouchers, error: verifyError } = await supabase
      .from('vouchers')
      .select('*');

    if (verifyError) {
      console.error('⚠️  Could not verify deletion:', verifyError.message);
      return;
    }

    if (remainingVouchers && remainingVouchers.length === 0) {
      console.log('✅ Verified: Database is now empty');
    } else {
      console.log(`⚠️  Warning: ${remainingVouchers.length} voucher(s) still remain`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

deleteAllVouchers();
