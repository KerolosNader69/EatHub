const axios = require('axios');

async function forceRemoveAppetizers() {
  try {
    const baseURL = 'https://backend-h8mrjrgjx-kerolosnader69s-projects.vercel.app';
    
    console.log('🗑️ Force removing appetizers category...');
    
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
    
    // Step 2: Get all menu items
    console.log('\n2️⃣ Getting all menu items...');
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
      
      // Step 3: Try to delete each item with detailed error logging
      if (appetizerItems.length > 0) {
        console.log('\n3️⃣ Attempting to delete appetizer items...');
        
        for (const item of appetizerItems) {
          try {
            console.log(`Deleting ${item.name}...`);
            const deleteResponse = await axios.delete(`${baseURL}/api/menu/${item.id}`, {
              headers: {
                'Authorization': `Bearer ${adminToken}`
              }
            });
            console.log(`✅ Successfully deleted: ${item.name}`);
          } catch (deleteError) {
            console.log(`❌ Failed to delete ${item.name}:`);
            console.log('   Status:', deleteError.response?.status);
            console.log('   Error:', deleteError.response?.data?.error?.message || deleteError.message);
            console.log('   Details:', deleteError.response?.data?.error?.details || 'No details');
            
            // If it's referenced in orders, try to mark as unavailable instead
            if (deleteError.response?.data?.error?.code === 'REFERENCED_IN_ORDERS') {
              console.log(`   Trying to mark ${item.name} as unavailable instead...`);
              try {
                await axios.put(`${baseURL}/api/menu/${item.id}`, {
                  ...item,
                  available: false
                }, {
                  headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                  }
                });
                console.log(`   ✅ Marked ${item.name} as unavailable`);
              } catch (updateError) {
                console.log(`   ❌ Failed to mark as unavailable:`, updateError.response?.data?.error?.message || updateError.message);
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.log('❌ Failed to fetch menu items:', error.response?.data || error.message);
      return;
    }
    
    // Step 4: Check final status
    console.log('\n4️⃣ Checking final status...');
    try {
      const finalMenuResponse = await axios.get(`${baseURL}/api/menu`);
      const finalMenuItems = finalMenuResponse.data.data;
      const finalCategories = [...new Set(finalMenuItems.map(item => item.category))];
      const remainingAppetizers = finalMenuItems.filter(item => item.category === 'appetizers');
      
      console.log('\n📊 Final Status:');
      console.log(`Total menu items: ${finalMenuItems.length}`);
      console.log(`Remaining appetizer items: ${remainingAppetizers.length}`);
      
      if (remainingAppetizers.length > 0) {
        console.log('Remaining appetizer items:');
        remainingAppetizers.forEach(item => {
          console.log(`  - ${item.name} (Available: ${item.available})`);
        });
      }
      
      console.log('\n🏷️ All categories:');
      finalCategories.forEach((category, index) => {
        const count = finalMenuItems.filter(item => item.category === category).length;
        console.log(`${index + 1}. ${category} (${count} items)`);
      });
      
      if (!finalCategories.includes('appetizers')) {
        console.log('\n✅ Success! Appetizers category has been completely removed.');
      } else if (remainingAppetizers.every(item => !item.available)) {
        console.log('\n⚠️ Appetizers category still exists but all items are marked as unavailable.');
        console.log('   The category will not appear in the public menu.');
      } else {
        console.log('\n❌ Appetizers category still has available items.');
      }
      
    } catch (error) {
      console.log('❌ Failed to check final status:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

forceRemoveAppetizers();