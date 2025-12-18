const axios = require('axios');

async function verifyAppetizersRemoved() {
  try {
    console.log('🔍 Verifying appetizers category removal...');
    
    // Test the public API (what users see)
    const response = await axios.get('https://backend-h8mrjrgjx-kerolosnader69s-projects.vercel.app/api/menu');
    const menuItems = response.data.data;
    
    console.log('📊 Public Menu Status:');
    console.log(`Total visible items: ${menuItems.length}`);
    
    // Get unique categories
    const categories = [...new Set(menuItems.map(item => item.category))];
    console.log('\n🏷️ Visible categories:');
    categories.forEach((category, index) => {
      const count = menuItems.filter(item => item.category === category).length;
      console.log(`${index + 1}. ${category} (${count} items)`);
    });
    
    // Check if appetizers is gone
    const hasAppetizers = categories.includes('appetizers');
    
    console.log('\n📋 Your requested categories status:');
    const yourCategories = ['chicken burgers', 'beef burgers', 'Box Deals', 'drinks', 'potatoes', 'Deals night'];
    yourCategories.forEach(category => {
      const exists = categories.includes(category);
      const count = menuItems.filter(item => item.category === category).length;
      console.log(`${exists ? '✅' : '❌'} ${category}: ${exists ? `${count} items` : 'Missing'}`);
    });
    
    console.log(`\n${hasAppetizers ? '❌' : '✅'} appetizers: ${hasAppetizers ? 'Still visible' : 'Successfully removed'}`);
    
    if (!hasAppetizers) {
      console.log('\n🎉 SUCCESS! The appetizers category has been completely removed from the public menu.');
      console.log('Users will now only see your 6 requested categories.');
    } else {
      console.log('\n⚠️ The appetizers category is still visible in the public menu.');
    }
    
    console.log('\n🌐 Updated Frontend URL: https://eathub-9rdkg2u19-kerolosnader69s-projects.vercel.app');
    
  } catch (error) {
    console.error('❌ Error verifying removal:', error.response?.data || error.message);
  }
}

verifyAppetizersRemoved();