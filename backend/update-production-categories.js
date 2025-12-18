const axios = require('axios');

async function updateProductionCategories() {
  try {
    console.log('Updating production database with new categories...');
    
    // First, let's clear old items and add new ones with proper categories
    const sampleItems = [
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
        price: 14.99,
        category: 'pizza',
        ingredients: ['tomato sauce', 'mozzarella', 'basil', 'pizza dough'],
        available: true
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Traditional pizza with pepperoni and mozzarella cheese',
        price: 16.99,
        category: 'pizza',
        ingredients: ['tomato sauce', 'mozzarella', 'pepperoni', 'pizza dough'],
        available: true
      },
      {
        name: 'Classic Burger',
        description: 'Juicy beef patty with lettuce, tomato, and cheese',
        price: 12.99,
        category: 'burgers',
        ingredients: ['beef patty', 'lettuce', 'tomato', 'cheese', 'bun'],
        available: true
      },
      {
        name: 'Chicken Burger',
        description: 'Grilled chicken breast with mayo and vegetables',
        price: 11.99,
        category: 'burgers',
        ingredients: ['chicken breast', 'mayo', 'lettuce', 'tomato', 'bun'],
        available: true
      },
      {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with Caesar dressing and croutons',
        price: 9.99,
        category: 'salads',
        ingredients: ['romaine lettuce', 'caesar dressing', 'croutons', 'parmesan'],
        available: true
      },
      {
        name: 'Greek Salad',
        description: 'Mixed greens with feta cheese, olives, and Greek dressing',
        price: 10.99,
        category: 'salads',
        ingredients: ['mixed greens', 'feta cheese', 'olives', 'greek dressing'],
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
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee and mascarpone',
        price: 7.99,
        category: 'desserts',
        ingredients: ['mascarpone', 'coffee', 'ladyfingers', 'cocoa'],
        available: true
      },
      {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        price: 4.99,
        category: 'beverages',
        ingredients: ['fresh oranges'],
        available: true
      },
      {
        name: 'Iced Coffee',
        description: 'Cold brew coffee served over ice',
        price: 3.99,
        category: 'beverages',
        ingredients: ['coffee beans', 'ice', 'water'],
        available: true
      }
    ];
    
    const baseURL = 'https://eathub-backend-production.up.railway.app';
    
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
    const menuResponse = await axios.get(`${baseURL}/api/menu`);
    const menuItems = menuResponse.data.data;
    const categories = [...new Set(menuItems.map(item => item.category))];
    
    console.log('\nUpdated categories:', categories);
    console.log('Total menu items:', menuItems.length);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

updateProductionCategories();