const axios = require('axios');

async function checkProductionCategories() {
  try {
    console.log('Checking production categories...');
    
    // Check production API
    const response = await axios.get('https://eathub-backend-production.up.railway.app/api/menu');
    const menuItems = response.data.data;
    
    console.log('Total menu items:', menuItems.length);
    
    // Get unique categories
    const categories = [...new Set(menuItems.map(item => item.category))];
    console.log('Current categories:', categories);
    
    // Show items by category
    categories.forEach(category => {
      const itemsInCategory = menuItems.filter(item => item.category === category);
      console.log(`\n${category}: ${itemsInCategory.length} items`);
      itemsInCategory.forEach(item => {
        console.log(`  - ${item.name} ($${item.price})`);
      });
    });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

checkProductionCategories();