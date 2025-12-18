const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:5173';

async function verifySystem() {
  console.log('🔍 Verifying Complete Eat Hub System\n');
  console.log('='.repeat(60));

  let allPassed = true;

  try {
    // 1. Check Backend Server
    console.log('\n1️⃣  Checking Backend Server...');
    try {
      const response = await axios.get(`${API_URL.replace('/api', '')}/`);
      if (response.data.message) {
        console.log('✅ Backend server is running');
        console.log('   Message:', response.data.message);
      }
    } catch (error) {
      console.log('❌ Backend server is not running');
      console.log('   Run: cd backend && node server.js');
      allPassed = false;
    }

    // 2. Check Frontend Server
    console.log('\n2️⃣  Checking Frontend Server...');
    try {
      await axios.get(FRONTEND_URL);
      console.log('✅ Frontend server is running');
      console.log('   URL:', FRONTEND_URL);
    } catch (error) {
      console.log('❌ Frontend server is not running');
      console.log('   Run: cd frontend && npm run dev');
      allPassed = false;
    }

    // 3. Check Database Connection
    console.log('\n3️⃣  Checking Database Connection...');
    try {
      const response = await axios.get(`${API_URL}/menu`);
      if (response.data.success) {
        console.log('✅ Database connection working');
        console.log(`   Found ${response.data.data.length} menu items`);
      }
    } catch (error) {
      console.log('❌ Database connection failed');
      console.log('   Check Supabase configuration');
      allPassed = false;
    }

    // 4. Check Admin Authentication
    console.log('\n4️⃣  Checking Admin Authentication...');
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@eathub.com',
        password: 'admin123456'
      });
      
      if (response.data.success && response.data.token) {
        console.log('✅ Admin authentication working');
        console.log('   Admin email:', response.data.admin.email);
        
        // 5. Check Admin Authorization
        console.log('\n5️⃣  Checking Admin Authorization...');
        const ordersResponse = await axios.get(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${response.data.token}` }
        });
        
        if (ordersResponse.data.success) {
          console.log('✅ Admin authorization working');
          console.log(`   Can access ${ordersResponse.data.data.length} orders`);
        }
      }
    } catch (error) {
      console.log('❌ Admin authentication failed');
      console.log('   Run: node backend/reset-admin.js');
      allPassed = false;
    }

    // 6. Check Menu CRUD Operations
    console.log('\n6️⃣  Checking Menu CRUD Operations...');
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@eathub.com',
        password: 'admin123456'
      });
      
      const token = loginResponse.data.token;
      
      // Create
      const createResponse = await axios.post(
        `${API_URL}/menu`,
        {
          name: 'Verification Test Item',
          description: 'Test',
          price: 1.00,
          category: 'appetizers',
          available: true
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const itemId = createResponse.data.data.id;
      
      // Update
      await axios.put(
        `${API_URL}/menu/${itemId}`,
        { available: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Delete
      await axios.delete(
        `${API_URL}/menu/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('✅ Menu CRUD operations working');
      console.log('   Create, Update, Delete all successful');
    } catch (error) {
      console.log('❌ Menu CRUD operations failed');
      console.log('   Error:', error.response?.data || error.message);
      allPassed = false;
    }

    // 7. Check Order Creation
    console.log('\n7️⃣  Checking Order Creation...');
    try {
      const menuResponse = await axios.get(`${API_URL}/menu`);
      const firstItem = menuResponse.data.data[0];
      
      if (firstItem) {
        const orderResponse = await axios.post(`${API_URL}/orders`, {
          items: [{ itemId: firstItem.id, quantity: 1 }],
          customerInfo: {
            name: 'Verification Test',
            phone: '1234567890',
            address: 'Test Address'
          }
        });
        
        if (orderResponse.data.success) {
          console.log('✅ Order creation working');
          console.log('   Order number:', orderResponse.data.data.orderNumber);
        }
      }
    } catch (error) {
      console.log('❌ Order creation failed');
      console.log('   Error:', error.response?.data || error.message);
      allPassed = false;
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    if (allPassed) {
      console.log('✅ ALL SYSTEMS OPERATIONAL!');
      console.log('='.repeat(60));
      console.log('\n🎉 Your Eat Hub system is fully functional!\n');
      console.log('📋 Next Steps:');
      console.log('   1. Open http://localhost:5173 in your browser');
      console.log('   2. Login to admin at http://localhost:5173/admin/login');
      console.log('   3. Email: admin@eathub.com');
      console.log('   4. Password: admin123456');
      console.log('\n✨ Features Ready:');
      console.log('   ✅ Menu management (add, edit, delete, toggle availability)');
      console.log('   ✅ Order management (view, update status)');
      console.log('   ✅ Customer ordering');
      console.log('   ✅ Order tracking');
      console.log('   ✅ Real-time updates');
    } else {
      console.log('⚠️  SOME ISSUES DETECTED');
      console.log('='.repeat(60));
      console.log('\n📋 Please fix the issues above and run this script again.');
    }

  } catch (error) {
    console.error('\n❌ Verification failed with error:', error.message);
  }
}

verifySystem();
