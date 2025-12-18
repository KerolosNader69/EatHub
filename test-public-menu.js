const axios = require('axios');

const API_BASE = 'https://backend-enrkqwtlh-kerolosnader69s-projects.vercel.app/api';

async function testPublicMenu() {
  try {
    console.log('Testing public menu API (no auth)...\n');
    
    // 1. Test public menu endpoint directly
    console.log('1. Testing public menu endpoint...');
    const publicResponse = await axios.get(`${API_BASE}/menu`);
    const publicItems = publicResponse.data.data;
    console.log(`✅ Public menu returned ${publicItems.length} items`);
    
    // 2. Login as admin and make some items available
    console.log('2. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@eathub.com',
      password: 'admin123456'
    });
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    // 3. Get admin menu to see all items
    console.log('3. Getting admin menu...');
    const adminResponse = await axios.get(`${API_BASE}/menu`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const adminItems = adminResponse.data.data;
    console.log(`✅ Admin menu has ${adminItems.length} items`);
    
    // 4. Make the first item available
    if (adminItems.length > 0) {
      const firstItem = adminItems[0];
      console.log(`4. Making "${firstItem.name}" available...`);
      
      await axios.put(`${API_BASE}/menu/${firstItem.id}`, {
        available: true
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Item marked as available');
      
      // 5. Test public menu again
      console.log('5. Testing public menu after making item available...');
      const updatedPublicResponse = await axios.get(`${API_BASE}/menu`);
      const updatedPublicItems = updatedPublicResponse.data.data;
      console.log(`✅ Public menu now has ${updatedPublicItems.length} items`);
      
      if (updatedPublicItems.length > 0) {
        console.log('Available items in public menu:');
        updatedPublicItems.forEach(item => {
          console.log(`  - ${item.name} (Available: ${item.available})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testPublicMenu();