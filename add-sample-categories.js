const axios = require('axios');

async function addSampleMenuItems() {
  try {
    console.log('Adding sample menu items with different categories...');
    
    const sampleItems = [
      {
        name: 'Classic Burger',
        description: 'Juicy beef patty with lettuce, tomato, and cheese',
        price: 12.99,
        category: 'main_courses',
        ingredients: ['beef patty', 'lettuce', 'tomato', 'cheese', 'bun'],
        available: true
      },
      {
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with cream frosting',
        price: 6.99,
        category: 'desserts',
        ingredients: ['chocolate', 'flour', 'eggs', 'cream'],
        available: true
      },
      {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        price: 4.99,
        category: 'beverages',
        ingredients: ['fresh oranges'],
        available: true
      }
    ];
    
    for (const item of sampleItems) {
      try {
        const response = await axios.post('http://localhost:5000/api/menu', item, {
          headers: {
            'Authorization': 'Bearer admin-token', // This will trigger admin mode
            'Content-Type': 'application/json'
          }
        });
        console.log(`✅ Added: ${item.name} (${item.category})`);
      } catch (error) {
        console.log(`❌ Failed to add ${item.name}:`, error.response?.data?.error?.message || error.message);
      }
    }
    
    // Fetch updated menu to show new categories
    const menuResponse = await axios.get('http://localhost:5000/api/menu');
    const menuItems = menuResponse.data.data;
    const categories = [...new Set(menuItems.map(item => item.category))];
    
    console.log('\nUpdated categories:', categories);
    console.log('Total menu items:', menuItems.length);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

addSampleMenuItems();