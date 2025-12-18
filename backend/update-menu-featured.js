const dotenv = require('dotenv');
dotenv.config();

const { supabaseAdmin } = require('./config/supabase');

async function updateMenuItemsForFeatured() {
  console.log('🌟 Updating menu items to support featured functionality...');
  
  try {
    // First, get all menu items
    const { data: menuItems, error: fetchError } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .limit(10);
    
    if (fetchError) {
      console.error('Error fetching menu items:', fetchError);
      return;
    }
    
    if (!menuItems || menuItems.length === 0) {
      console.log('⚠️  No menu items found. Creating some sample items...');
      
      // Create sample menu items
      const sampleItems = [
        {
          name: 'Margherita Pizza',
          description: 'Classic pizza with fresh tomatoes, mozzarella, and basil',
          price: 18.99,
          category: 'food',
          available: true,
          is_featured: true,
          featured_order: 1
        },
        {
          name: 'Caesar Salad',
          description: 'Fresh romaine lettuce with parmesan cheese and croutons',
          price: 12.99,
          category: 'food',
          available: true,
          is_featured: true,
          featured_order: 2
        },
        {
          name: 'Grilled Chicken Sandwich',
          description: 'Juicy grilled chicken with lettuce, tomato, and mayo',
          price: 15.99,
          category: 'food',
          available: true,
          is_featured: true,
          featured_order: 3
        },
        {
          name: 'Chocolate Brownie',
          description: 'Rich chocolate brownie with vanilla ice cream',
          price: 8.99,
          category: 'food',
          available: true,
          is_featured: true,
          featured_order: 4
        },
        {
          name: 'Fresh Orange Juice',
          description: 'Freshly squeezed orange juice',
          price: 4.99,
          category: 'groceries',
          available: true,
          is_featured: false,
          featured_order: 0
        },
        {
          name: 'Organic Apples',
          description: 'Fresh organic apples - 1 lb bag',
          price: 3.99,
          category: 'groceries',
          available: true,
          is_featured: false,
          featured_order: 0
        }
      ];
      
      const { data: createdItems, error: createError } = await supabaseAdmin
        .from('menu_items')
        .insert(sampleItems)
        .select();
      
      if (createError) {
        console.error('Error creating sample items:', createError);
        return;
      }
      
      console.log(`✅ Created ${createdItems.length} sample menu items`);
      
    } else {
      console.log(`📋 Found ${menuItems.length} existing menu items`);
      
      // Update first few items to be featured
      const itemsToUpdate = menuItems.slice(0, 4);
      
      for (let i = 0; i < itemsToUpdate.length; i++) {
        const item = itemsToUpdate[i];
        
        const { error: updateError } = await supabaseAdmin
          .from('menu_items')
          .update({
            is_featured: true,
            featured_order: i + 1
          })
          .eq('id', item.id);
        
        if (updateError) {
          console.error(`Error updating item ${item.name}:`, updateError);
        } else {
          console.log(`✅ Updated ${item.name} to be featured (order: ${i + 1})`);
        }
      }
    }
    
    // Verify featured items
    const { data: featuredItems, error: featuredError } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .eq('is_featured', true)
      .order('featured_order', { ascending: true });
    
    if (featuredError) {
      console.error('Error fetching featured items:', featuredError);
    } else {
      console.log(`\n🌟 Featured items (${featuredItems.length}):`);
      featuredItems.forEach(item => {
        console.log(`  ${item.featured_order}. ${item.name} - $${item.price}`);
      });
    }
    
    console.log('\n🎉 Menu items updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating menu items:', error);
  }
}

if (require.main === module) {
  updateMenuItemsForFeatured().catch(console.error);
}

module.exports = { updateMenuItemsForFeatured };