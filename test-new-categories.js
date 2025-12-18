const axios = require('axios');

async function testNewCategories() {
  try {
    console.log('🧪 Testing new categories...');
    
    // Test the production API
    const response = await axios.get('https://backend-h8mrjrgjx-kerolosnader69s-projects.vercel.app/api/menu');
    const menuItems = response.data.data;
    
    console.log('📊 Total menu items:', menuItems.length);
    
    // Get unique categories
    const categories = [...new Set(menuItems.map(item => item.category))];
    console.log('\n🏷️ Available categories:');
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category}`);
    });
    
    // Check if your specific categories are there
    const yourCategories = ['chicken burgers', 'beef burgers', 'Box Deals', 'drinks', 'potatoes', 'Deals night'];
    
    console.log('\n✅ Your requested categories status:');
    yourCategories.forEach(category => {
      const exists = categories.includes(category);
      console.log(`${exists ? '✅' : '❌'} ${category}: ${exists ? 'Found' : 'Missing'}`);
    });
    
    // Show items by your categories
    console.log('\n📋 Items in your categories:');
    yourCategories.forEach(category => {
      const itemsInCategory = menuItems.filter(item => item.category === category);
      if (itemsInCategory.length > 0) {
        console.log(`\n${category}: ${itemsInCategory.length} items`);
        itemsInCategory.forEach(item => {
          console.log(`  - ${item.name} ($${item.price})`);
        });
      }
    });
    
    console.log('\n🌐 Frontend URL: https://eathub-cmbhdltip-kerolosnader69s-projects.vercel.app');
    console.log('🔗 Backend URL: https://backend-h8mrjrgjx-kerolosnader69s-projects.vercel.app/api/menu');
    
  } catch (error) {
    console.error('❌ Error testing categories:', error.response?.data || error.message);
  }
}

testNewCategories();