const axios = require('axios');

async function hideAppetizersCategory() {
  try {
    const baseURL = 'https://backend-h8mrjrgjx-kerolosnader69s-projects.vercel.app';
    
    console.log('👁️ Hiding appetizers category by marking items as unavailable...');
    
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
        console.log(`  - ${item.name} (Currently available: ${item.available})`);
      });
      
      // Step 3: Mark all appetizer items as unavailable
      if (appetizerItems.length > 0) {
        console.log('\n3️⃣ Marking appetizer items as unavailable...');
        
        for (const item of appetizerItems) {
          try {
            console.log(`Updating ${item.name}...`);
            const updateResponse = await axios.put(`${baseURL}/api/menu/${item.id}`, {
              name: item.name,
              description: item.description,
              price: item.price,
              category: item.category,
              ingredients: item.ingredients,
              available: false  // Mark as unavailable
            }, {
              headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
              }
            });
            console.log(`✅ Successfully marked ${item.name} as unavailable`);
          } catch (updateError) {
            console.log(`❌ Failed to update ${item.name}:`);
            console.log('   Status:', updateError.response?.status);
            console.log('   Error:', updateError.response?.data?.error?.message || updateError.message);
          }
        }
      }
      
    } catch (error) {
      console.log('❌ Failed to fetch menu items:', error.response?.data || error.message);
      return;
    }
    
    // Step 4: Test public menu (without admin token)
    console.log('\n4️⃣ Testing public menu (what users will see)...');
    try {
      const publicMenuResponse = await axios.get(`${baseURL}/api/menu`);
      const publicMenuItems = publicMenuResponse.data.data;
      const publicCategories = [...new Set(publicMenuItems.map(item => item.category))];
      
      console.log('\n📊 Public Menu Status:');
      console.log(`Total visible items: ${publicMenuItems.length}`);
      
      console.log('\n🏷️ Visible categories (what users see):');
      publicCategories.forEach((category, index) => {
        const count = publicMenuItems.filter(item => item.category === category).length;
        console.log(`${index + 1}. ${category} (${count} items)`);
      });
      
      const hasAppetizersInPublic = publicCategories.includes('appetizers');
      if (!hasAppetizersInPublic) {
        console.log('\n✅ Success! Appetizers category is now hidden from the public menu.');
        console.log('   Users will not see the appetizers category anymore.');
      } else {
        console.log('\n⚠️ Warning: Appetizers category is still visible in public menu.');
      }
      
    } catch (error) {
      console.log('❌ Failed to test public menu:', error.response?.data || error.message);
    }
    
    // Step 5: Show admin view
    console.log('\n5️⃣ Admin view (all items including unavailable):');
    try {
      const adminMenuResponse = await axios.get(`${baseURL}/api/menu`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      const adminMenuItems = adminMenuResponse.data.data;
      const adminCategories = [...new Set(adminMenuItems.map(item => item.category))];
      
      console.log(`Total items (admin view): ${adminMenuItems.length}`);
      
      adminCategories.forEach(category => {
        const categoryItems = adminMenuItems.filter(item => item.category === category);
        const availableCount = categoryItems.filter(item => item.available).length;
        const unavailableCount = categoryItems.filter(item => !item.available).length;
        
        console.log(`${category}: ${categoryItems.length} total (${availableCount} available, ${unavailableCount} unavailable)`);
      });
      
    } catch (error) {
      console.log('❌ Failed to get admin view:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

hideAppetizersCategory();