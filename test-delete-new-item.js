const axios = require('axios');

const API_BASE = 'https://backend-enrkqwtlh-kerolosnader69s-projects.vercel.app/api';

async function testDeleteNewItem() {
  try {
    // 1. Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@eathub.com',
      password: 'admin123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // 2. Create a new menu item
    console.log('2. Creating a new menu item...');
    const newItemData = new FormData();
    newItemData.append('name', 'Test Item for Deletion');
    newItemData.append('description', 'This item will be deleted');
    newItemData.append('price', '9.99');
    newItemData.append('category', 'appetizers');
    newItemData.append('ingredients', JSON.stringify(['Test Ingredient']));
    newItemData.append('portionSize', 'Test Portion');
    newItemData.append('available', 'true');
    
    const createResponse = await axios.post(`${API_BASE}/menu`, newItemData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    const newItem = createResponse.data.data;
    console.log(`✅ Created item: ${newItem.name} (ID: ${newItem.id})`);
    
    // 3. Delete the new item
    console.log('3. Deleting the new item...');
    const deleteResponse = await axios.delete(`${API_BASE}/menu/${newItem.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Delete successful:', deleteResponse.data);
    
    // 4. Verify it's deleted
    console.log('4. Verifying deletion...');
    try {
      await axios.get(`${API_BASE}/menu/${newItem.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('❌ Item still exists after deletion');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Item successfully deleted and verified');
      } else {
        console.log('❌ Unexpected error during verification:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testDeleteNewItem();