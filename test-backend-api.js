// Test backend API endpoints
const https = require('https');

const BACKEND_URL = 'https://backend-ox6rir4jl-kerolosnader69s-projects.vercel.app';

function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const url = `${BACKEND_URL}${path}`;
    console.log(`\nTesting: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);
        
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log(`Response:`, JSON.stringify(json, null, 2));
            resolve({ success: true, status: res.statusCode, data: json });
          } catch (e) {
            console.log(`Response (text):`, data.substring(0, 200));
            resolve({ success: true, status: res.statusCode, data });
          }
        } else {
          console.log(`Error Response:`, data.substring(0, 500));
          resolve({ success: false, status: res.statusCode, data });
        }
      });
    }).on('error', (err) => {
      console.error(`Request failed:`, err.message);
      reject(err);
    });
  });
}

async function runTests() {
  console.log('=== Testing Backend API ===');
  console.log(`Backend URL: ${BACKEND_URL}`);
  
  try {
    // Test root endpoint
    await testEndpoint('/');
    
    // Test menu endpoint
    await testEndpoint('/api/menu');
    
    // Test health endpoint
    await testEndpoint('/api/monitoring/health');
    
    console.log('\n=== Tests Complete ===');
  } catch (error) {
    console.error('\n=== Test Failed ===');
    console.error(error);
  }
}

runTests();
