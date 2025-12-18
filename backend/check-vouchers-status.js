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

async function checkVouchers() {
  console.log('🔍 Checking Vouchers Status\n');

  try {
    // Check all vouchers (including inactive)
    console.log('1. All vouchers in database:');
    const { data: allVouchers, error: allError } = await supabase
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false });

    if (allError) {
      console.log('❌ Error:', allError.message);
    } else {
      console.log(`Total vouchers: ${allVouchers.length}`);
      allVouchers.forEach(v => {
        console.log(`  - ${v.code}: ${v.title} (active: ${v.is_active}, expires: ${v.expiry_date || 'never'})`);
      });
    }
    console.log('');

    // Check active vouchers only
    console.log('2. Active vouchers only:');
    const { data: activeVouchers, error: activeError } = await supabase
      .from('vouchers')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (activeError) {
      console.log('❌ Error:', activeError.message);
    } else {
      console.log(`Active vouchers: ${activeVouchers.length}`);
      activeVouchers.forEach(v => {
        const expired = v.expiry_date && new Date(v.expiry_date) < new Date();
        console.log(`  - ${v.code}: ${v.title} (expired: ${expired})`);
      });
    }
    console.log('');

    // Check what public users would see
    console.log('3. What public users see (active + not expired):');
    const now = new Date();
    const publicVouchers = (activeVouchers || []).filter(v => {
      if (v.expiry_date && new Date(v.expiry_date) < now) return false;
      if (v.usage_limit !== null && v.used_count >= v.usage_limit) return false;
      return true;
    });
    
    console.log(`Public visible vouchers: ${publicVouchers.length}`);
    publicVouchers.forEach(v => {
      console.log(`  - ${v.code}: ${v.title}`);
    });
    console.log('');

    // Provide cleanup option
    if (allVouchers.length > 0) {
      console.log('💡 To delete all vouchers, run:');
      console.log('   node backend/delete-all-vouchers.js');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkVouchers();
