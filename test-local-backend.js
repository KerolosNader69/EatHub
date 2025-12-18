const http = require('http');

console.log('🧪 Testing Local Backend\n');

function testLocalAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/vouchers/available',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`Status: ${res.statusCode}\n`);
        
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            const vouchers = json.data || json;
            
            console.log('Response:');
            console.log(JSON.stringify(json, null, 2));
            console.log('');
            
            if (Array.isArray(vouchers) && vouchers.length === 0) {
              console.log('✅ SUCCESS! Local backend returns 0 vouchers');
              console.log('\nNext steps:');
              console.log('1. Start frontend: cd frontend && npm run dev');
              console.log('2. Open http://localhost:5173');
              console.log('3. Vouchers should be gone!\n');
              resolve(true);
            } else {
              console.log(`⚠️  WARNING: Found ${vouchers.length} voucher(s)`);
              console.log('This means the local backend is also returning cached data.\n');
              resolve(false);
            }
          } catch (error) {
            console.error('❌ Error parsing response:', error.message);
            reject(error);
          }
        } else {
          console.error(`❌ Error: Status ${res.statusCode}`);
          console.log('Response:', data);
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Connection Error:', error.message);
      console.log('\nIs the backend running?');
      console.log('Start it with: cd backend && npm start\n');
      reject(error);
    });

    req.end();
  });
}

testLocalAPI().catch(() => process.exit(1));
