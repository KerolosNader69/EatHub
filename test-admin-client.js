const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://opcblscxvueihdkiraqt.supabase.co';
const supabaseServiceKey = 'sb_secret_-62WZYmPOxYhVBSIPDW77A_iF3PaUay';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testAdminClient() {
  try {
    console.log('Testing admin client...');
    
    // Test reading menu items
    const { data: menuItems, error: readError } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .limit(5);
    
    if (readError) {
      console.error('❌ Read error:', readError);
      return;
    }
    
    console.log('✅ Admin client can read menu items:', menuItems.length);
    
    if (menuItems.length > 0) {
      const testItem = menuItems[0];
      console.log('Test item:', testItem.name, 'ID:', testItem.id);
      
      // Test deleting the item
      const { data: deleteData, error: deleteError } = await supabaseAdmin
        .from('menu_items')
        .delete()
        .eq('id', testItem.id)
        .select();
      
      if (deleteError) {
        console.error('❌ Delete error:', deleteError);
        return;
      }
      
      console.log('✅ Delete successful:', deleteData);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testAdminClient();