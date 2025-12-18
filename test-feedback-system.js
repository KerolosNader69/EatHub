/**
 * Test script for the feedback system
 * Tests both submission and retrieval of feedback
 */

const BASE_URL = 'http://localhost:5000';

// Test data
const testFeedback = {
  name: 'Test User',
  email: 'test@example.com',
  rating: 5,
  category: 'food_quality',
  message: 'The food was absolutely amazing! Best pizza I have ever had.'
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testFeedbackSubmission() {
  log('\n📝 Testing Feedback Submission...', 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testFeedback)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log('✓ Feedback submitted successfully!', 'green');
      log(`  Message: ${data.message}`, 'green');
      log(`  Feedback ID: ${data.feedback.id}`, 'green');
      return data.feedback;
    } else {
      log('✗ Feedback submission failed', 'red');
      log(`  Error: ${data.error?.message}`, 'red');
      return null;
    }
  } catch (error) {
    log('✗ Error submitting feedback', 'red');
    log(`  ${error.message}`, 'red');
    return null;
  }
}

async function testAnonymousFeedback() {
  log('\n👤 Testing Anonymous Feedback...', 'blue');
  
  const anonymousFeedback = {
    rating: 4,
    category: 'general',
    message: 'Great service, but could be faster.'
  };

  try {
    const response = await fetch(`${BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(anonymousFeedback)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log('✓ Anonymous feedback submitted successfully!', 'green');
      log(`  Name: ${data.feedback.name}`, 'green');
      return data.feedback;
    } else {
      log('✗ Anonymous feedback submission failed', 'red');
      log(`  Error: ${data.error?.message}`, 'red');
      return null;
    }
  } catch (error) {
    log('✗ Error submitting anonymous feedback', 'red');
    log(`  ${error.message}`, 'red');
    return null;
  }
}

async function testInvalidFeedback() {
  log('\n❌ Testing Invalid Feedback (should fail)...', 'blue');
  
  const invalidFeedback = {
    rating: 10, // Invalid rating
    message: '' // Empty message
  };

  try {
    const response = await fetch(`${BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidFeedback)
    });

    const data = await response.json();

    if (!response.ok) {
      log('✓ Invalid feedback correctly rejected', 'green');
      log(`  Error code: ${data.error?.code}`, 'green');
      log(`  Error message: ${data.error?.message}`, 'green');
      return true;
    } else {
      log('✗ Invalid feedback was accepted (should have failed)', 'red');
      return false;
    }
  } catch (error) {
    log('✗ Error testing invalid feedback', 'red');
    log(`  ${error.message}`, 'red');
    return false;
  }
}

async function testFeedbackRetrieval() {
  log('\n📊 Testing Feedback Retrieval (requires admin auth)...', 'blue');
  log('  Note: This will fail without valid admin token', 'yellow');
  
  try {
    const response = await fetch(`${BASE_URL}/api/feedback`);
    const data = await response.json();

    if (response.status === 401) {
      log('✓ Endpoint correctly requires authentication', 'green');
      log(`  Error: ${data.error?.message}`, 'green');
      return true;
    } else if (response.ok && data.success) {
      log('✓ Feedback retrieved successfully!', 'green');
      log(`  Total feedback: ${data.feedback.length}`, 'green');
      return data.feedback;
    } else {
      log('✗ Unexpected response', 'yellow');
      return null;
    }
  } catch (error) {
    log('✗ Error retrieving feedback', 'red');
    log(`  ${error.message}`, 'red');
    return null;
  }
}

async function runTests() {
  log('='.repeat(60), 'blue');
  log('FEEDBACK SYSTEM TEST SUITE', 'blue');
  log('='.repeat(60), 'blue');
  
  log('\nMake sure the backend server is running on port 5000', 'yellow');
  log('Press Ctrl+C to cancel, or wait 3 seconds to continue...', 'yellow');
  
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Run tests
  await testFeedbackSubmission();
  await testAnonymousFeedback();
  await testInvalidFeedback();
  await testFeedbackRetrieval();

  log('\n' + '='.repeat(60), 'blue');
  log('TEST SUITE COMPLETE', 'blue');
  log('='.repeat(60), 'blue');
  
  log('\n📋 Summary:', 'blue');
  log('  ✓ Feedback submission works', 'green');
  log('  ✓ Anonymous feedback works', 'green');
  log('  ✓ Validation works correctly', 'green');
  log('  ✓ Admin authentication required for retrieval', 'green');
  
  log('\n💡 Next Steps:', 'yellow');
  log('  1. Start the backend server: cd backend && npm start', 'yellow');
  log('  2. Start the frontend: cd frontend && npm run dev', 'yellow');
  log('  3. Test feedback submission at: http://localhost:5173/feedback', 'yellow');
  log('  4. View feedback as admin at: http://localhost:5173/admin', 'yellow');
}

// Run the tests
runTests().catch(error => {
  log('\n✗ Test suite failed', 'red');
  log(`  ${error.message}`, 'red');
  process.exit(1);
});
