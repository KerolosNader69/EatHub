#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Tests production deployment endpoints to ensure everything is working
 */

const https = require('https');
const http = require('http');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Get URLs from command line arguments
const backendUrl = process.argv[2];
const frontendUrl = process.argv[3];

if (!backendUrl || !frontendUrl) {
  console.log(`${colors.red}Usage: node verify-deployment.js <backend-url> <frontend-url>${colors.reset}`);
  console.log(`${colors.yellow}Example: node verify-deployment.js https://your-app.railway.app https://your-app.vercel.app${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.cyan}${colors.bold}🚀 Eat Hub Deployment Verification${colors.reset}`);
console.log(`${colors.cyan}===================================${colors.reset}\n`);

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Test functions
async function testBackendHealth() {
  console.log(`${colors.yellow}Testing backend health endpoint...${colors.reset}`);
  try {
    const response = await makeRequest(`${backendUrl}/api/health`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      console.log(`${colors.green}✓ Backend health check passed${colors.reset}`);
      console.log(`  Status: ${data.status}`);
      console.log(`  Environment: ${data.environment}`);
      console.log(`  Uptime: ${Math.floor(data.uptime)}s\n`);
      return true;
    } else {
      console.log(`${colors.red}✗ Backend health check failed (Status: ${response.statusCode})${colors.reset}\n`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Backend health check failed: ${error.message}${colors.reset}\n`);
    return false;
  }
}

async function testBackendMenu() {
  console.log(`${colors.yellow}Testing backend menu endpoint...${colors.reset}`);
  try {
    const response = await makeRequest(`${backendUrl}/api/menu`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      console.log(`${colors.green}✓ Menu endpoint accessible${colors.reset}`);
      console.log(`  Menu items: ${data.data ? data.data.length : 0}\n`);
      return true;
    } else {
      console.log(`${colors.red}✗ Menu endpoint failed (Status: ${response.statusCode})${colors.reset}\n`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Menu endpoint failed: ${error.message}${colors.reset}\n`);
    return false;
  }
}

async function testFrontend() {
  console.log(`${colors.yellow}Testing frontend...${colors.reset}`);
  try {
    const response = await makeRequest(frontendUrl);
    
    if (response.statusCode === 200) {
      const hasReactApp = response.data.includes('root') || response.data.includes('React');
      if (hasReactApp) {
        console.log(`${colors.green}✓ Frontend is accessible${colors.reset}`);
        console.log(`  Status: ${response.statusCode}`);
        console.log(`  Content-Type: ${response.headers['content-type']}\n`);
        return true;
      } else {
        console.log(`${colors.yellow}⚠ Frontend accessible but may not be React app${colors.reset}\n`);
        return true;
      }
    } else {
      console.log(`${colors.red}✗ Frontend check failed (Status: ${response.statusCode})${colors.reset}\n`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Frontend check failed: ${error.message}${colors.reset}\n`);
    return false;
  }
}

async function testCORS() {
  console.log(`${colors.yellow}Testing CORS configuration...${colors.reset}`);
  console.log(`${colors.cyan}Note: Full CORS test requires browser. Check browser console for CORS errors.${colors.reset}\n`);
  return true;
}

// Run all tests
async function runTests() {
  const results = {
    backendHealth: false,
    backendMenu: false,
    frontend: false,
    cors: true
  };

  results.backendHealth = await testBackendHealth();
  results.backendMenu = await testBackendMenu();
  results.frontend = await testFrontend();
  results.cors = await testCORS();

  // Summary
  console.log(`${colors.cyan}${colors.bold}Summary${colors.reset}`);
  console.log(`${colors.cyan}=======${colors.reset}\n`);

  const allPassed = Object.values(results).every(r => r === true);

  if (allPassed) {
    console.log(`${colors.green}${colors.bold}✓ All tests passed!${colors.reset}`);
    console.log(`${colors.green}Your deployment appears to be working correctly.${colors.reset}\n`);
    
    console.log(`${colors.cyan}Next steps:${colors.reset}`);
    console.log(`1. Visit ${frontendUrl} in your browser`);
    console.log(`2. Test the complete user flow`);
    console.log(`3. Log in to admin panel at ${frontendUrl}/admin/login`);
    console.log(`4. Add menu items and test order placement\n`);
  } else {
    console.log(`${colors.red}${colors.bold}✗ Some tests failed${colors.reset}`);
    console.log(`${colors.yellow}Please check the errors above and refer to DEPLOYMENT_TROUBLESHOOTING.md${colors.reset}\n`);
    
    console.log(`${colors.cyan}Common issues:${colors.reset}`);
    console.log(`- Backend not deployed: Check Railway dashboard`);
    console.log(`- Frontend not deployed: Check Vercel dashboard`);
    console.log(`- Database connection: Verify MongoDB Atlas connection string`);
    console.log(`- CORS errors: Update FRONTEND_URL in Railway environment variables\n`);
  }

  console.log(`${colors.cyan}Your URLs:${colors.reset}`);
  console.log(`Frontend: ${frontendUrl}`);
  console.log(`Backend:  ${backendUrl}`);
  console.log(`Admin:    ${frontendUrl}/admin/login\n`);
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Unexpected error: ${error.message}${colors.reset}`);
  process.exit(1);
});
