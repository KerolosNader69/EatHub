// Test the signup endpoint
const https = require('https');

const BACKEND_URL = 'https://backend-ox6rir4jl-kerolosnader69s-projects.vercel.app';

const testData = JSON.stringify({
  fullName: 'Test User',
  email: 'test@example.com',
  phone: '1234567890',
  address: '123 Test St',
  password: 'testpassword123'
});

const options = {
  hostname: 'backend-ox6rir4jl-kerolosnader69s-projects.vercel.app',
  port: 443,
  path: '/api/auth/user/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': testData.length
  }
};

console.log('Testing signup endpoint...');
console.log(`URL: ${BACKEND_URL}/api/auth/user/signup`);
console.log(`Method: POST`);
console.log(`Data:`, JSON.parse(testData));
console.log('');

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  console.log('');

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(testData);
req.end();
