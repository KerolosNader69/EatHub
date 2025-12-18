const axios = require('axios');

const BACKEND_URL = 'https://backend-bcf6ol6h2-kerolosnader69s-projects.vercel.app';

async function testEndpoints() {
  console.log('Testing backend endpoints...\n');
  
  const endpoints = [
    '/api/categories',
    '/api/vouchers/available',
    '/api/rewards/status',
    '/api/menu/featured'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      const response = await axios.get(`${BACKEND_URL}${endpoint}`);
      console.log(`✅ ${endpoint}: ${response.status} - ${JSON.stringify(response.data).substring(0, 100)}...`);
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.response?.status || 'Network Error'} - ${error.response?.data?.error?.message || error.message}`);
    }
    console.log('');
  }
}

testEndpoints().catch(console.error);