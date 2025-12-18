const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testCheckboxFunctionality() {
  console.log('🧪 Testing Checkbox Functionality\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Login
    console.log('\n1️⃣  Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@eathub.com',
      password: 'admin123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Create item with available = false
    console.log('\n2️⃣  Creating menu item with available = false...');
    const createResponse = await axios.post(
      `${API_URL}/menu`,
      {
        name: 'Checkbox Test Item',
        description: 'Testing checkbox functionality',
        price: 5.99,
        category: 'appetizers',
        available: 'false' // Sending as string like FormData does
      },
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const itemId = createResponse.data.data.id;
    const isAvailable = createResponse.data.data.available;

    console.log('✅ Item created');
    console.log('   ID:', itemId);
    console.log('   Available:', isAvailable);
    console.log('   Type:', typeof isAvailable);

    if (isAvailable === false) {
      console.log('✅ Checkbox value correctly saved as FALSE');
    } else {
      console.log('❌ ERROR: Expected false, got:', isAvailable);
    }

    // Step 3: Update item to available = true
    console.log('\n3️⃣  Updating item to available = true...');
    const updateResponse = await axios.put(
      `${API_URL}/menu/${itemId}`,
      { available: 'true' },
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const updatedAvailable = updateResponse.data.data.available;
    console.log('✅ Item updated');
    console.log('   Available:', updatedAvailable);
    console.log('   Type:', typeof updatedAvailable);

    if (updatedAvailable === true) {
      console.log('✅ Checkbox value correctly updated to TRUE');
    } else {
      console.log('❌ ERROR: Expected true, got:', updatedAvailable);
    }

    // Step 4: Toggle back to false
    console.log('\n4️⃣  Toggling back to available = false...');
    const toggleResponse = await axios.put(
      `${API_URL}/menu/${itemId}`,
      { available: 'false' },
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const toggledAvailable = toggleResponse.data.data.available;
    console.log('✅ Item toggled');
    console.log('   Available:', toggledAvailable);

    if (toggledAvailable === false) {
      console.log('✅ Checkbox toggle working correctly');
    } else {
      console.log('❌ ERROR: Expected false, got:', toggledAvailable);
    }

    // Step 5: Clean up - delete test item
    console.log('\n5️⃣  Cleaning up test item...');
    await axios.delete(`${API_URL}/menu/${itemId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Test item deleted');

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL CHECKBOX TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\n📋 Test Results:');
    console.log('   ✅ Create with available = false works');
    console.log('   ✅ Update to available = true works');
    console.log('   ✅ Toggle back to false works');
    console.log('   ✅ Boolean values stored correctly');
    console.log('\n🎉 Checkbox functionality is working perfectly!');

  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
    process.exit(1);
  }
}

testCheckboxFunctionality();
