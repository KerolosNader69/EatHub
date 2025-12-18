const supabase = require('./config/supabase');

/**
 * Script to clear example vouchers from Supabase database
 * Example voucher codes: WELCOME10, SAVE5, FREESHIP
 */

async function clearExampleVouchers() {
  console.log('🧹 Clearing example vouchers from database...\n');

  try {
    // List of example voucher codes to delete
    const exampleCodes = ['WELCOME10', 'SAVE5', 'FREESHIP'];

    // First, check what vouchers exist
    const { data: existingVouchers, error: fetchError } = await supabase
      .from('vouchers')
      .select('id, code, title')
      .in('code', exampleCodes);

    if (fetchError) {
      console.error('❌ Error fetching vouchers:', fetchError.message);
      process.exit(1);
    }

    if (!existingVouchers || existingVouchers.length === 0) {
      console.log('✅ No example vouchers found in database. Already clean!');
      return;
    }

    console.log(`Found ${existingVouchers.length} example voucher(s) to delete:`);
    existingVouchers.forEach(v => {
      console.log(`  - ${v.code}: ${v.title}`);
    });
    console.log('');

    // Delete the example vouchers
    const { error: deleteError } = await supabase
      .from('vouchers')
      .delete()
      .in('code', exampleCodes);

    if (deleteError) {
      console.error('❌ Error deleting vouchers:', deleteError.message);
      process.exit(1);
    }

    console.log('✅ Successfully deleted example vouchers from database!');
    console.log('   You can now create new vouchers through the admin dashboard.\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Run the script
clearExampleVouchers()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

