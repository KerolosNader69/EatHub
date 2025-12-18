const axios = require('axios');

const API_BASE = 'https://backend-enrkqwtlh-kerolosnader69s-projects.vercel.app/api';

async function testAvailabilityFilter() {
  try {
    console.log('Testing menu availability filtering...\n');
    
    // 1. Get public menu (no auth token)
    console.log('1. Getting public menu (customer view)...');
    const publicResponse = await axios.get(`${API_BASE}/menu`);
    const publicItems = publicResponse.data.data;
    console.log(`✅ Public menu has ${publicItems.length} items`);
    
    // 2. Login as admin
    console.log('2. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@eathub.com',
      password: 'admin123456'
    });
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    // 3. Get admin menu (with auth token)
    console.log('3. Getting admin menu (admin view)...');
    const adminResponse = await axios.get(`${API_BASE}/menu`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const adminItems = adminResponse.data.data;
    console.log(`✅ Admin menu has ${adminItems.length} items`);
    
    // 4. Compare the results
    console.log('\n📊 Comparison:');
    console.log(`Public menu: ${publicItems.length} items`);
    console.log(`Admin menu: ${adminItems.length} items`);
    
    if (publicItems.length <= adminItems.length) {
      console.log('✅ Filtering is working correctly');
    } else {
      console.log('❌ Something is wrong - public menu has more items than admin menu');
    }
    
    // 5. Check availability status
    console.log('\n🔍 Item availability analysis:');
    const unavailableItems = adminItems.filter(item => !item.available);
    const availableItems = adminItems.filter(item => item.available);
    
    console.log(`Available items: ${availableItems.length}`);
    console.log(`Unavailable items: ${unavailableItems.length}`);
    
    if (unavailableItems.length > 0) {
      console.log('\nUnavailable items (should be hidden from public):');
      unavailableItems.forEach(item => {
        console.log(`  - ${item.name} (${item.available ? 'Available' : 'Unavailable'})`);
      });
      
      // Check if any unavailable items appear in public menu
      const hiddenCorrectly = unavailableItems.every(unavailableItem => 
        !publicItems.find(publicItem => publicItem.id === unavailableItem.id)
      );
      
      if (hiddenCorrectly) {
        console.log('✅ All unavailable items are correctly hidden from public menu');
      } else {
        console.log('❌ Some unavailable items are still showing in public menu');
      }
    } else {
      console.log('ℹ️ All items are currently available');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAvailabilityFilter();