// Script to check menu items in Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMenuItems() {
  console.log('Checking menu items in Supabase...');
  
  try {
    const { data: items, error } = await supabase
      .from('menu_items')
      .select('id, name, category, available, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('Recent menu items:');
    items.forEach(item => {
      console.log(`- ${item.name} (${item.category}) - Available: ${item.available} - Created: ${item.created_at}`);
    });
    
    console.log(`\nTotal items found: ${items.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkMenuItems();
