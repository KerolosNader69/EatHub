const axios = require('axios');

async function removeAppetizersCategory() {
  try {
    const baseURL = 'https://backend-h8mrjrgjx-kerolosnader69s-projects.vercel.app';
    
    console.log('🗑️ Removing appetizers category...');
    console.log(`Using backend URL: ${baseURL}`);
    
    // Step 1: Login to get admin token
    console.log('\n1️⃣ Logging in as admin...');
    let adminToken = null;
    
    try {
      const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
        email: 'admin@eathub.com',
        password: 'admin123456'
      });
      
      adminToken = loginResponse.data.token;
      console.log('✅ Admin login successful');
    } catch (loginError) {
      console.log('❌ Admin login failed:', loginError.response?.data?.error?.message || loginError.message);
      return;
    }
    
    // Step 2: Get all menu items to find appetizers
    console.log('\n2️⃣ Finding appetizers items...');
    try {
      const menuResponse = await axios.get(`${baseURL}/api/menu`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      const menuItems = menuResponse.data.data;
      const appetizerItems = menuItems.filter(item => item.category === 'appetizers');
      
      console.log(`Found ${appetizerItems.length} items in appetizers category:`);
      appetizerItems.forEach(item => {
        console.log(`  - ${item.name} (ID: ${item.id})`);
      });
      
      // Step 3: Delete all appetizer items
      if (appetizerItems.length > 0) {
        console.log('\n3️⃣ Deleting appetizer items...');
        
        for (const item of appetizerItems) {
          try {
            await axios.delete(`${baseURL}/api/menu/${item.id}`, {
              headers: {
                'Authorization': `Bearer ${adminToken}`
              }
            });
            console.log(`✅ Deleted: ${item.name}`);
          } catch (deleteError) {
            console.log(`❌ Failed to delete ${item.name}:`, deleteError.response?.data?.error?.message || deleteError.message);
          }
        }
      } else {
        console.log('ℹ️ No appetizer items found to delete');
      }
      
    } catch (error) {
      console.log('❌ Failed to fetch menu items:', error.response?.data || error.message);
      return;
    }
    
    // Step 4: Verify the category is removed
    console.log('\n4️⃣ Verifying category removal...');
    try {
      const updatedMenuResponse = await axios.get(`${baseURL}/api/menu`);
      const updatedMenuItems = updatedMenuResponse.data.data;
      const categories = [...new Set(updatedMenuItems.map(item => item.category))];
      
      console.log('\n🏷️ Remaining categories:');
      categories.forEach((category, index) => {
        console.log(`${index + 1}. ${category}`);
      });
      
      const hasAppetizers = categories.includes('appetizers');
      if (!hasAppetizers) {
        console.log('\n✅ Success! Appetizers category has been removed.');
      } else {
        console.log('\n⚠️ Warning: Appetizers category still exists.');
      }
      
      console.log(`\n📊 Total menu items: ${updatedMenuItems.length}`);
      
    } catch (error) {
      console.log('❌ Failed to verify removal:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Error removing appetizers category:', error.message);
  }
}

removeAppetizersCategory();