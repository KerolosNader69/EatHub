const supabase = require('./backend/config/supabase');

async function checkCategories() {
  console.log('Checking Supabase categories table...\n');
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Categories in Supabase:');
    console.log(JSON.stringify(data, null, 2));
  }
}

checkCategories();
