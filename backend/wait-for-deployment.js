const https = require('https');

const API_URL = 'https://backend-ljhd8p024-kerolosnader69s-projects.vercel.app';
const CHECK_INTERVAL = 10000; // 10 seconds
const MAX_ATTEMPTS = 30; // 5 minutes total

let attempts = 0;

console.log('⏳ Waiting for deployment to complete...\n');
console.log(`Checking: ${API_URL}/api/vouchers/available`);
console.log(`Will check every 10 seconds for up to 5 minutes\n`);

function checkDeployment() {
  return new Promise((resolve) => {
    const timestamp = Date.now();
    const url = `${API_URL}/api/vouchers/available?_t=${timestamp}`;
    
    https.get(url, (res) => {
      const cacheControl = res.headers['cache-control'] || '';
      const pragma = res.headers['pragma'] || '';
      
      attempts++;
      const elapsed = Math.floor((attempts * CHECK_INTERVAL) / 1000);
      
      console.log(`[${elapsed}s] Attempt ${attempts}/${MAX_ATTEMPTS}`);
      console.log(`  Cache-Control: ${cacheControl}`);
      console.log(`  Pragma: ${pragma}`);
      
      // Check if new code is deployed
      if (cacheControl.includes('no-store') && cacheControl.includes('no-cache')) {
        console.log('\n✅ SUCCESS! New code is deployed!');
        console.log('\nNext steps:');
        console.log('1. Hard refresh your browser (Ctrl+Shift+R)');
        console.log('2. Check if vouchers are gone');
        console.log('3. If still showing, clear browser cache completely\n');
        resolve(true);
      } else {
        console.log(`  Status: Still waiting... (old code)\n`);
        
        if (attempts >= MAX_ATTEMPTS) {
          console.log('⏰ Timeout reached. Deployment might be taking longer than expected.');
          console.log('\nCheck Vercel dashboard:');
          console.log('https://vercel.com/kerolosnader69s-projects\n');
          resolve(false);
        } else {
          setTimeout(() => checkDeployment().then(resolve), CHECK_INTERVAL);
        }
      }
    }).on('error', (error) => {
      console.log(`  Error: ${error.message}\n`);
      if (attempts < MAX_ATTEMPTS) {
        setTimeout(() => checkDeployment().then(resolve), CHECK_INTERVAL);
      } else {
        resolve(false);
      }
    });
  });
}

checkDeployment().then((success) => {
  process.exit(success ? 0 : 1);
});
