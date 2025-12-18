const axios = require('axios');

const BACKEND_URL = 'https://backend-71jvz0c1q-kerolosnader69s-projects.vercel.app';
const FRONTEND_URL = 'https://eathub-4t68l5whu-kerolosnader69s-projects.vercel.app';

async function testDeployment() {
  console.log('🧪 Testing Final Deployment\n');
  
  // Test Backend Endpoints
  console.log('📡 Testing Backend Endpoints...');
  const backendTests = [
    { name: 'Categories', url: `${BACKEND_URL}/api/categories` },
    { name: 'Vouchers', url: `${BACKEND_URL}/api/vouchers/available` },
    { name: 'Rewards', url: `${BACKEND_URL}/api/rewards/status` },
    { name: 'Featured Items', url: `${BACKEND_URL}/api/menu/featured` }
  ];

  for (const test of backendTests) {
    try {
      const response = await axios.get(test.url);
      if (response.status === 200 && response.data.success) {
        console.log(`✅ ${test.name}: Working`);
      } else {
        console.log(`❌ ${test.name}: Unexpected response`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.response?.status || error.message}`);
    }
  }

  // Test Frontend
  console.log('\n🌐 Testing Frontend...');
  try {
    const response = await axios.get(FRONTEND_URL);
    if (response.status === 200) {
      console.log(`✅ Frontend: Accessible`);
    }
  } catch (error) {
    console.log(`❌ Frontend: ${error.response?.status || error.message}`);
  }

  console.log('\n📋 Deployment URLs:');
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`Backend: ${BACKEND_URL}`);
  console.log('\n✨ Test Complete!');
}

testDeployment();
