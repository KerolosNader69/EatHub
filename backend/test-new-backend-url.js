const https = require('https');

const API_URL = 'https://backend-three-psi-32.vercel.app';

console.log('🧪 Testing NEW Backend URL\n');
console.log(`API: ${API_URL}\n`);

function testAPI() {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const url = `${API_URL}/api/vouchers/available?_t=${timestamp}`;
    
    console.log(`Fetching: ${url}\n`);
    
    https.get(url, (res) => {
      let data = '';
      
      console.log(`Status: ${res.statusCode}`);
      console.log('\nResponse Headers:');
      console.log(`  Cache-Control: ${res.headers['cache-control'] || 'Not set'}`);
      console.log(`  Pragma: ${res.headers['pragma'] || 'Not set'}`);
      console.log(`  Expires: ${res.headers['expires'] || 'Not set'}`);
      console.log('');
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const vouchers = json.data || json;
          
          console.log('Response Body:');
          console.log(JSON.stringify(json, null, 2));
          console.log('');
          
          if (Array.isArray(vouchers)) {
            if (vouchers.length === 0) {
              console.log('✅ SUCCESS! No vouchers found!');
              console.log('\nThe new backend is working correctly.');
              console.log('Now redeploy the frontend with the new URL.\n');
            } else {
              console.log(`⚠️  WARNING: ${vouchers.length} voucher(s) found`);
            }
          }
          
          resolve();
        } catch (error) {
          console.error('❌ Error parsing JSON:', error.message);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.error('❌ Network Error:', error.message);
      reject(error);
    });
  });
}

testAPI().catch(err => {
  console.error('\n❌ Test failed:', err.message);
  process.exit(1);
});
