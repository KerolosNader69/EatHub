const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testDatabaseTables() {
  console.log('Testing database tables...\n');
  
  const tables = ['categories', 'vouchers', 'rewards', 'menu_items'];
  
  for (const table of tables) {
    try {
      console.log(`Testing ${table} table...`);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Table exists, ${data.length} sample records`);
      }
    } catch (error) {
      console.log(`❌ ${table}: ${error.message}`);
    }
    console.log('');
  }
  
  // Test featured items specifically
  try {
    console.log('Testing featured items...');
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_featured', true)
      .limit(5);
    
    if (error) {
      console.log(`❌ Featured items: ${error.message}`);
    } else {
      console.log(`✅ Featured items: Found ${data.length} featured items`);
    }
  } catch (error) {
    console.log(`❌ Featured items: ${error.message}`);
  }
}

testDatabaseTables().catch(console.error);