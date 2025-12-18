const axios = require('axios');

const BACKEND_URL = 'https://backend-bcf6ol6h2-kerolosnader69s-projects.vercel.app';

async function testDetailedEndpoints() {
  console.log('Testing backend endpoints with detailed error info...\n');
  
  const endpoints = [
    { path: '/api/categories', method: 'GET' },
    { path: '/api/vouchers/available', method: 'GET' },
    { path: '/api/rewards/status', method: 'GET' },
    { path: '/api/menu/featured', method: 'GET' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.method} ${endpoint.path}...`);
      const response = await axios({
        method: endpoint.method,
        url: `${BACKEND_URL}${endpoint.path}`,
        timeout: 10000
      });
      console.log(`✅ ${endpoint.path}: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data).substring(0, 200)}...`);
    } catch (error) {
      console.log(`❌ ${endpoint.path}: ${error.response?.status || 'Network Error'}`);
      if (error.response?.data) {
        console.log(`   Error: ${JSON.stringify(error.response.data)}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }
    console.log('');
  }
}

testDetailedEndpoints().catch(console.error);