const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let testMenuItemId = '';

// Test configuration
const adminCredentials = {
  email: 'admin@eathub.com',
  password: 'admin123456'
};

const testMenuItem = {
  name: 'Test Item',
  description: 'This is a test menu item',
  price: 9.99,
  category: 'appetizers',
  ingredients: ['Test', 'Ingredients'],
  portionSize: 'Serves 1',
  available: true
};

async function runTests() {
  console.log('🧪 Testing Admin Functionality\n');
  console.log('='.repeat(50));

  try {
    // Test 1: Admin Login
    console.log('\n1️⃣  Testing Admin Login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, adminCredentials);
    
    if (loginResponse.data.success && loginResponse.data.token) {
      authToken = loginResponse.data.token;
      console.log('✅ Login successful!');
      console.log('   Token:', authToken.substring(0, 20) + '...');
      console.log('   Admin:', loginResponse.data.admin.email);
    } else {
      throw new Error('Login failed - no token received');
    }

    // Test 2: Verify Token
    console.log('\n2️⃣  Testing Token Verification...');
    const verifyResponse = await axios.post(
      `${API_URL}/auth/verify`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (verifyResponse.data.success) {
      console.log('✅ Token verification successful!');
      console.log('   Admin:', verifyResponse.data.admin.email);
    } else {
      throw new Error('Token verification failed');
    }

    // Test 3: Get Menu Items (Public)
    console.log('\n3️⃣  Testing Get Menu Items (Public)...');
    const menuResponse = await axios.get(`${API_URL}/menu`);
    
    if (menuResponse.data.success && Array.isArray(menuResponse.data.data)) {
      console.log(`✅ Retrieved ${menuResponse.data.data.length} menu items`);
      if (menuResponse.data.data.length > 0) {
        const item = menuResponse.data.data[0];
        console.log('   Sample item:', {
          id: item.id,
          name: item.name,
          price: item.price,
          available: item.available
        });
      }
    } else {
      throw new Error('Failed to get menu items');
    }

    // Test 4: Create Menu Item (Admin)
    console.log('\n4️⃣  Testing Create Menu Item (Admin)...');
    const createResponse = await axios.post(
      `${API_URL}/menu`,
      testMenuItem,
      {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (createResponse.data.success && createResponse.data.data) {
      testMenuItemId = createResponse.data.data.id;
      console.log('✅ Menu item created successfully!');
      console.log('   ID:', testMenuItemId);
      console.log('   Name:', createResponse.data.data.name);
      console.log('   Price:', createResponse.data.data.price);
    } else {
      throw new Error('Failed to create menu item');
    }

    // Test 5: Update Menu Item Availability (Admin)
    console.log('\n5️⃣  Testing Update Menu Item Availability...');
    const updateResponse = await axios.put(
      `${API_URL}/menu/${testMenuItemId}`,
      { available: false },
      {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (updateResponse.data.success && updateResponse.data.data) {
      console.log('✅ Menu item availability updated!');
      console.log('   Available:', updateResponse.data.data.available);
    } else {
      throw new Error('Failed to update menu item');
    }

    // Test 6: Create Test Order
    console.log('\n6️⃣  Testing Create Order...');
    const orderData = {
      items: [
        {
          itemId: menuResponse.data.data[0].id,
          quantity: 2
        }
      ],
      customerInfo: {
        name: 'Test Customer',
        phone: '1234567890',
        address: '123 Test Street, Test City'
      },
      specialInstructions: 'This is a test order'
    };

    const orderResponse = await axios.post(`${API_URL}/orders`, orderData);
    
    if (orderResponse.data.success && orderResponse.data.data) {
      const orderNumber = orderResponse.data.data.orderNumber;
      console.log('✅ Order created successfully!');
      console.log('   Order Number:', orderNumber);
      console.log('   Estimated Delivery:', orderResponse.data.data.estimatedDelivery);

      // Test 7: Get All Orders (Admin)
      console.log('\n7️⃣  Testing Get All Orders (Admin)...');
      const ordersResponse = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (ordersResponse.data.success && Array.isArray(ordersResponse.data.data)) {
        console.log(`✅ Retrieved ${ordersResponse.data.data.length} orders`);
        const order = ordersResponse.data.data.find(o => o.order_number === orderNumber);
        if (order) {
          console.log('   Test order found:', {
            order_number: order.order_number,
            customer_name: order.customer_name,
            status: order.status,
            total_amount: order.total_amount
          });
        }
      } else {
        throw new Error('Failed to get orders');
      }

      // Test 8: Update Order Status (Admin)
      console.log('\n8️⃣  Testing Update Order Status...');
      const statusResponse = await axios.put(
        `${API_URL}/orders/${orderNumber}/status`,
        { status: 'preparing' },
        {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (statusResponse.data.success && statusResponse.data.data) {
        console.log('✅ Order status updated!');
        console.log('   New Status:', statusResponse.data.data.status);
      } else {
        throw new Error('Failed to update order status');
      }
    } else {
      throw new Error('Failed to create order');
    }

    // Test 9: Delete Menu Item (Admin)
    console.log('\n9️⃣  Testing Delete Menu Item (Admin)...');
    const deleteResponse = await axios.delete(
      `${API_URL}/menu/${testMenuItemId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (deleteResponse.data.success) {
      console.log('✅ Menu item deleted successfully!');
    } else {
      throw new Error('Failed to delete menu item');
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(50));
    console.log('\n📋 Summary:');
    console.log('   ✅ Admin authentication working');
    console.log('   ✅ Menu item CRUD operations working');
    console.log('   ✅ Availability toggle working');
    console.log('   ✅ Order creation working');
    console.log('   ✅ Order management working');
    console.log('   ✅ Order status updates working');
    console.log('\n🎉 All admin functionality is working correctly!');

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

// Run tests
runTests();
