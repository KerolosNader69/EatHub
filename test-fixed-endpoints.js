const axios = require('axios');

const BACKEND_URL = 'https://backend-bcf6ol6h2-kerolosnader69s-projects.vercel.app';

async function testFixedEndpoints() {
  console.log('Testing fixed endpoints...\n');
  
  const endpoints = [
    '/api/categories',
    '/api/vouchers/available', 
    '/api/rewards/status',
    '/api/menu/featured'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BACKEND_URL}${endpoint}`);
      console.log(`✅ ${endpoint}: Working! (${response.data.data?.length || 'N/A'} items)`);
    } catch (error) {
      console.log(`❌ ${endpoint}: Still failing - ${error.response?.status}`);
    }
  }
}

testFixedEndpoints();