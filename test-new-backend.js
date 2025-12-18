const axios = require('axios');

const NEW_BACKEND_URL = 'https://backend-i9zxgqsee-kerolosnader69s-projects.vercel.app';

async function testNewBackend() {
  console.log('Testing newly deployed backend...\n');
  
  const endpoints = [
    { path: '/', name: 'Root' },
    { path: '/api/categories', name: 'Categories' },
    { path: '/api/vouchers/available', name: 'Vouchers' },
    { path: '/api/rewards/status', name: 'Rewards' },
    { path: '/api/menu/featured', name: 'Featured Items' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);
      const response = await axios.get(`${NEW_BACKEND_URL}${endpoint.path}`, {
        timeout: 10000
      });
      console.log(`✅ ${endpoint.name}: ${response.status} - Working!`);
      if (response.data.data) {
        console.log(`   Data: ${response.data.data.length} items`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.response?.status || 'Network Error'}`);
      if (error.response?.data) {
        console.log(`   Error: ${JSON.stringify(error.response.data).substring(0, 100)}...`);
      }
    }
    console.log('');
  }
}

testNewBackend().catch(console.error);