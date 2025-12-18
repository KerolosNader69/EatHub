const axios = require('axios');

const BACKEND_URL = 'https://backend-bcf6ol6h2-kerolosnader69s-projects.vercel.app';

async function testBasicEndpoints() {
  console.log('Testing basic backend endpoints...\n');
  
  const endpoints = [
    '/',
    '/api/monitoring/health',
    '/api/menu'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      const response = await axios.get(`${BACKEND_URL}${endpoint}`);
      console.log(`✅ ${endpoint}: ${response.status} - ${JSON.stringify(response.data).substring(0, 200)}...`);
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.response?.status || 'Network Error'} - ${error.response?.data?.error?.message || error.message}`);
    }
    console.log('');
  }
}

testBasicEndpoints().catch(console.error);