const axios = require('axios');

const API_BASE = 'https://backend-enrkqwtlh-kerolosnader69s-projects.vercel.app/api';

async function testDeleteMenuItem() {
  try {
    // First, login as admin to get token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@eathub.com',
      password: 'admin123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    // Get menu items to find one to delete
    console.log('2. Getting menu items...');
    const menuResponse = await axios.get(`${API_BASE}/menu`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const menuItems = menuResponse.data.data;
    console.log(`✅ Found ${menuItems.length} menu items`);
    
    if (menuItems.length === 0) {
      console.log('❌ No menu items to delete');
      return;
    }
    
    // Try to delete the first item
    const itemToDelete = menuItems[0];
    console.log(`3. Attempting to delete item: ${itemToDelete.name} (ID: ${itemToDelete.id})`);
    
    const deleteResponse = await axios.delete(`${API_BASE}/menu/${itemToDelete.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Delete successful:', deleteResponse.data);
    
    // Verify item was deleted
    console.log('4. Verifying deletion...');
    const verifyResponse = await axios.get(`${API_BASE}/menu`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const remainingItems = verifyResponse.data.data;
    const deletedItemExists = remainingItems.find(item => item.id === itemToDelete.id);
    
    if (deletedItemExists) {
      console.log('❌ Item still exists after deletion');
    } else {
      console.log('✅ Item successfully deleted and verified');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testDeleteMenuItem();