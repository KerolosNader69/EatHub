const axios = require('axios');

// Test configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Test functions
async function testEndpoint(method, endpoint, data = null, headers = {}) {
  try {
    console.log(`\n🧪 Testing ${method.toUpperCase()} ${endpoint}`);
    
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`✅ Success: ${response.status} ${response.statusText}`);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.log(`❌ Error: ${error.response?.status || 'Network Error'} ${error.response?.statusText || error.message}`);
    if (error.response?.data) {
      console.log('Error data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

async function runTests() {
  console.log('🚀 Testing Home Page API Endpoints');
  console.log('=====================================');

  // Test Categories endpoints
  console.log('\n📁 CATEGORIES ENDPOINTS');
  await testEndpoint('GET', '/categories');
  
  // Test Menu Featured endpoint
  console.log('\n🌟 FEATURED ITEMS ENDPOINT');
  await testEndpoint('GET', '/menu/featured');
  await testEndpoint('GET', '/menu/featured?limit=3');
  
  // Test Vouchers endpoints
  console.log('\n🎫 VOUCHERS ENDPOINTS');
  await testEndpoint('GET', '/vouchers/available');
  
  // Test voucher validation
  await testEndpoint('POST', '/vouchers/validate', {
    code: 'WELCOME10',
    orderTotal: 50.00
  });
  
  await testEndpoint('POST', '/vouchers/validate', {
    code: 'INVALID_CODE',
    orderTotal: 50.00
  });
  
  // Test Rewards endpoints
  console.log('\n🏆 REWARDS ENDPOINTS');
  await testEndpoint('GET', '/rewards/status');
  
  // Test with user header
  await testEndpoint('GET', '/rewards/status', null, {
    'x-user-id': 'test-user-123'
  });
  
  // Test earning points
  await testEndpoint('POST', '/rewards/earn', {
    points: 100,
    description: 'Test order completion'
  }, {
    'x-user-id': 'test-user-123'
  });
  
  console.log('\n✨ Test completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testEndpoint, runTests };