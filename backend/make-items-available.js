// Script to make all menu items available
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function makeItemsAvailable() {
  console.log('Making all menu items available...');
  
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .update({ available: true })
      .eq('available', false)
      .select('name');
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log(`Updated ${data.length} items to available`);
    data.forEach(item => console.log(`- ${item.name}`));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

makeItemsAvailable();
