/**
 * Test script to verify Supabase user authentication integration
 * Run with: node test-user-auth.js
 */

const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000';

// Test user data
const testUser = {
  fullName: 'Test User',
  email: `test${Date.now()}@example.com`, // Unique email
  phone: '1234567890',
  address: '123 Test Street, Test City',
  password: 'testpass123'
};

let authToken = null;
let userId = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testSignup() {
  log('\n📝 Testing User Signup...', 'blue');
  
  try {
    const response = await fetch(`${API_URL}/api/auth/user/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      authToken = data.token;
      userId = data.user.id;
      log('✅ Signup successful!', 'green');
      log(`   User ID: ${data.user.id}`);
      log(`   Email: ${data.user.email}`);
      log(`   Full Name: ${data.user.fullName}`);
      log(`   Phone: ${data.user.phone}`);
      log(`   Address: ${data.user.address}`);
      log(`   Token: ${data.token.substring(0, 20)}...`);
      return true;
    } else {
      log(`❌ Signup failed: ${data.error?.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Signup error: ${error.message}`, 'red');
    return false;
  }
}

async function testLogin() {
  log('\n🔐 Testing User Login...', 'blue');
  
  try {
    const response = await fetch(`${API_URL}/api/auth/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log('✅ Login successful!', 'green');
      log(`   User ID: ${data.user.id}`);
      log(`   Email: ${data.user.email}`);
      log(`   Full Name: ${data.user.fullName}`);
      log(`   Token: ${data.token.substring(0, 20)}...`);
      return true;
    } else {
      log(`❌ Login failed: ${data.error?.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Login error: ${error.message}`, 'red');
    return false;
  }
}

async function testTokenVerification() {
  log('\n🔍 Testing Token Verification...', 'blue');
  
  try {
    const response = await fetch(`${API_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log('✅ Token verification successful!', 'green');
      log(`   User ID: ${data.admin.id}`);
      log(`   Email: ${data.admin.email}`);
      return true;
    } else {
      log(`❌ Token verification failed: ${data.error?.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Token verification error: ${error.message}`, 'red');
    return false;
  }
}

async function testProfileUpdate() {
  log('\n✏️  Testing Profile Update...', 'blue');
  
  const updatedData = {
    fullName: 'Updated Test User',
    email: testUser.email,
    phone: '9876543210',
    address: '456 Updated Street, New City'
  };

  try {
    const response = await fetch(`${API_URL}/api/auth/user/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(updatedData)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log('✅ Profile update successful!', 'green');
      log(`   Full Name: ${data.user.fullName}`);
      log(`   Phone: ${data.user.phone}`);
      log(`   Address: ${data.user.address}`);
      return true;
    } else {
      log(`❌ Profile update failed: ${data.error?.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Profile update error: ${error.message}`, 'red');
    return false;
  }
}

async function testInvalidLogin() {
  log('\n🚫 Testing Invalid Login...', 'blue');
  
  try {
    const response = await fetch(`${API_URL}/api/auth/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'wrongpassword'
      })
    });

    const data = await response.json();

    if (!response.ok && !data.success) {
      log('✅ Invalid login correctly rejected!', 'green');
      log(`   Error: ${data.error?.message}`);
      return true;
    } else {
      log('❌ Invalid login should have been rejected!', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Invalid login test error: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('═══════════════════════════════════════════════', 'yellow');
  log('  Supabase User Authentication Test Suite', 'yellow');
  log('═══════════════════════════════════════════════', 'yellow');
  
  log('\n⚠️  Make sure the backend server is running on port 5000', 'yellow');
  log('   Run: cd backend && npm start\n');

  const results = {
    signup: false,
    login: false,
    verify: false,
    update: false,
    invalidLogin: false
  };

  // Run tests sequentially
  results.signup = await testSignup();
  
  if (results.signup) {
    results.login = await testLogin();
    results.verify = await testTokenVerification();
    results.update = await testProfileUpdate();
  }
  
  results.invalidLogin = await testInvalidLogin();

  // Summary
  log('\n═══════════════════════════════════════════════', 'yellow');
  log('  Test Results Summary', 'yellow');
  log('═══════════════════════════════════════════════', 'yellow');
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  log(`\n📊 Tests Passed: ${passed}/${total}`, passed === total ? 'green' : 'red');
  log(`   ✓ User Signup: ${results.signup ? 'PASS' : 'FAIL'}`, results.signup ? 'green' : 'red');
  log(`   ✓ User Login: ${results.login ? 'PASS' : 'FAIL'}`, results.login ? 'green' : 'red');
  log(`   ✓ Token Verification: ${results.verify ? 'PASS' : 'FAIL'}`, results.verify ? 'green' : 'red');
  log(`   ✓ Profile Update: ${results.update ? 'PASS' : 'FAIL'}`, results.update ? 'green' : 'red');
  log(`   ✓ Invalid Login Rejection: ${results.invalidLogin ? 'PASS' : 'FAIL'}`, results.invalidLogin ? 'green' : 'red');

  if (passed === total) {
    log('\n🎉 All tests passed! Supabase integration is working correctly!', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the errors above.', 'red');
  }

  log('\n💡 Check Supabase Dashboard to see the created user:', 'blue');
  log('   https://supabase.com/dashboard/project/opcblscxvueihdkiraqt/auth/users\n');
}

// Run the tests
runTests().catch(error => {
  log(`\n❌ Test suite error: ${error.message}`, 'red');
  process.exit(1);
});
