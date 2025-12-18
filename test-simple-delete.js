const axios = require('axios');

const API_BASE = 'https://backend-ivpukb1av-kerolosnader69s-projects.vercel.app/api';

async function testSimpleDelete() {
  try {
    // Login as admin
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@eathub.com',
      password: 'admin123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Get menu items
    const menuResponse = await axios.get(`${API_BASE}/menu`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const menuItems = menuResponse.data.data;
    console.log(`✅ Found ${menuItems.length} menu items`);
    
    if (menuItems.length === 0) {
      console.log('❌ No menu items to delete');
      return;
    }
    
    const itemToDelete = menuItems[0];
    console.log(`Attempting to delete: ${itemToDelete.name} (${itemToDelete.id})`);
    
    // Make the delete request and capture full response
    try {
      const deleteResponse = await axios.delete(`${API_BASE}/menu/${itemToDelete.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Delete successful:', deleteResponse.data);
    } catch (deleteError) {
      console.log('❌ Delete failed');
      console.log('Status:', deleteError.response?.status);
      console.log('Response:', deleteError.response?.data);
      
      // Let's also try to see the Vercel function logs by making a simple request
      console.log('\nTesting basic endpoint...');
      const testResponse = await axios.get(`${API_BASE}/menu/${itemToDelete.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ GET request works:', testResponse.data.success);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testSimpleDelete();