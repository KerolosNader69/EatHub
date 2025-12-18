const axios = require('axios');

async function addNewCategories() {
  try {
    console.log('Adding menu items with your specific categories...');
    
    // Your specific categories with sample items
    const sampleItems = [
      // Chicken Burgers
      {
        name: 'Crispy Chicken Burger',
        description: 'Crispy fried chicken breast with lettuce and mayo',
        price: 11.99,
        category: 'chicken burgers',
        ingredients: ['chicken breast', 'lettuce', 'mayo', 'bun'],
        available: true
      },
      {
        name: 'Spicy Chicken Burger',
        description: 'Spicy grilled chicken with hot sauce and cheese',
        price: 12.99,
        category: 'chicken burgers',
        ingredients: ['chicken breast', 'hot sauce', 'cheese', 'bun'],
        available: true
      },
      
      // Beef Burgers
      {
        name: 'Classic Beef Burger',
        description: 'Juicy beef patty with lettuce, tomato, and cheese',
        price: 13.99,
        category: 'beef burgers',
        ingredients: ['beef patty', 'lettuce', 'tomato', 'cheese', 'bun'],
        available: true
      },
      {
        name: 'Double Beef Burger',
        description: 'Two beef patties with double cheese and special sauce',
        price: 16.99,
        category: 'beef burgers',
        ingredients: ['beef patty', 'cheese', 'special sauce', 'bun'],
        available: true
      },
      
      // Box Deals
      {
        name: 'Family Box Deal',
        description: '4 burgers, 4 fries, and 4 drinks - perfect for family',
        price: 39.99,
        category: 'Box Deals',
        ingredients: ['burgers', 'fries', 'drinks'],
        available: true
      },
      {
        name: 'Couple Box Deal',
        description: '2 burgers, 2 fries, and 2 drinks for couples',
        price: 22.99,
        category: 'Box Deals',
        ingredients: ['burgers', 'fries', 'drinks'],
        available: true
      },
      
      // Drinks
      {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        price: 4.99,
        category: 'drinks',
        ingredients: ['fresh oranges'],
        available: true
      },
      {
        name: 'Iced Coffee',
        description: 'Cold brew coffee served over ice',
        price: 3.99,
        category: 'drinks',
        ingredients: ['coffee beans', 'ice'],
        available: true
      },
      
      // Potatoes
      {
        name: 'Crispy French Fries',
        description: 'Golden crispy french fries with salt',
        price: 5.99,
        category: 'potatoes',
        ingredients: ['potatoes', 'salt', 'oil'],
        available: true
      },
      {
        name: 'Loaded Potato Wedges',
        description: 'Potato wedges with cheese, bacon, and sour cream',
        price: 8.99,
        category: 'potatoes',
        ingredients: ['potatoes', 'cheese', 'bacon', 'sour cream'],
        available: true
      },
      
      // Deals night
      {
        name: 'Night Special Burger',
        description: 'Special burger available only at night with discount',
        price: 9.99,
        category: 'Deals night',
        ingredients: ['beef patty', 'cheese', 'lettuce', 'bun'],
        available: true
      },
      {
        name: 'Late Night Combo',
        description: 'Burger + fries + drink combo for night owls',
        price: 14.99,
        category: 'Deals night',
        ingredients: ['burger', 'fries', 'drink'],
        available: true
      }
    ];
    
    // Use your production backend URL
    const baseURL = 'https://backend-h8mrjrgjx-kerolosnader69s-projects.vercel.app';
    
    console.log(`Using backend URL: ${baseURL}`);
    
    for (const item of sampleItems) {
      try {
        const response = await axios.post(`${baseURL}/api/menu`, item, {
          headers: {
            'Authorization': 'Bearer admin-token',
            'Content-Type': 'application/json'
          }
        });
        console.log(`✅ Added: ${item.name} (${item.category})`);
      } catch (error) {
        console.log(`❌ Failed to add ${item.name}:`, error.response?.data?.error?.message || error.message);
      }
    }
    
    // Fetch updated menu to show new categories
    console.log('\nFetching updated menu...');
    try {
      const menuResponse = await axios.get(`${baseURL}/api/menu`);
      const menuItems = menuResponse.data.data;
      const categories = [...new Set(menuItems.map(item => item.category))];
      
      console.log('\n🎉 Updated categories:', categories);
      console.log('📊 Total menu items:', menuItems.length);
      
      // Show items by category
      console.log('\n📋 Items by category:');
      categories.forEach(category => {
        const itemsInCategory = menuItems.filter(item => item.category === category);
        console.log(`\n${category}: ${itemsInCategory.length} items`);
        itemsInCategory.forEach(item => {
          console.log(`  - ${item.name} ($${item.price})`);
        });
      });
      
    } catch (error) {
      console.log('❌ Failed to fetch updated menu:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addNewCategories();