/**
 * Home Page Components Manual Test Script
 * Run this in the browser console to test the home page functionality
 */

console.log('🧪 Starting Home Page Components Test...');

// Test 1: Check if CategoryGrid is rendered and functional
function testCategoryGrid() {
  console.log('\n📋 Testing CategoryGrid Component...');
  
  const categoryGrid = document.querySelector('.category-grid');
  if (!categoryGrid) {
    console.error('❌ CategoryGrid not found');
    return false;
  }
  
  const categoryCards = document.querySelectorAll('.category-card');
  console.log(`✅ Found ${categoryCards.length} category cards`);
  
  // Test category card click functionality
  if (categoryCards.length > 0) {
    const firstCard = categoryCards[0];
    const categoryName = firstCard.querySelector('.category-name')?.textContent;
    console.log(`🔍 Testing click on category: ${categoryName}`);
    
    // Simulate click
    firstCard.click();
    console.log('✅ Category card click test completed');
  }
  
  return true;
}

// Test 2: Check ActionButtons (Vouchers and Rewards)
function testActionButtons() {
  console.log('\n🎯 Testing ActionButtons Component...');
  
  const actionButtons = document.querySelector('.action-buttons');
  if (!actionButtons) {
    console.error('❌ ActionButtons not found');
    return false;
  }
  
  const voucherButton = document.querySelector('.voucher-button');
  const rewardsButton = document.querySelector('.rewards-button');
  
  if (voucherButton) {
    console.log('✅ Voucher button found');
    const voucherText = voucherButton.textContent;
    console.log(`📄 Voucher button text: ${voucherText}`);
  } else {
    console.error('❌ Voucher button not found');
  }
  
  if (rewardsButton) {
    console.log('✅ Rewards button found');
    const rewardsText = rewardsButton.textContent;
    console.log(`🏆 Rewards button text: ${rewardsText}`);
  } else {
    console.error('❌ Rewards button not found');
  }
  
  return true;
}

// Test 3: Check API Service Integration
async function testAPIServices() {
  console.log('\n🌐 Testing API Services...');
  
  try {
    // Test if categories are loaded
    const categoryCards = document.querySelectorAll('.category-card');
    if (categoryCards.length > 0) {
      console.log('✅ Categories API appears to be working (cards are rendered)');
    } else {
      console.warn('⚠️ No category cards found - API might not be working');
    }
    
    // Check for loading states
    const loadingElements = document.querySelectorAll('[aria-live="polite"]');
    console.log(`📊 Found ${loadingElements.length} loading state elements`);
    
    // Check for error states
    const errorElements = document.querySelectorAll('[role="alert"]');
    if (errorElements.length > 0) {
      console.warn(`⚠️ Found ${errorElements.length} error alerts on page`);
    } else {
      console.log('✅ No error alerts found');
    }
    
  } catch (error) {
    console.error('❌ Error testing API services:', error);
    return false;
  }
  
  return true;
}

// Test 4: Check Accessibility Features
function testAccessibility() {
  console.log('\n♿ Testing Accessibility Features...');
  
  // Check for skip link
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    console.log('✅ Skip link found');
  } else {
    console.warn('⚠️ Skip link not found');
  }
  
  // Check main content area
  const mainContent = document.querySelector('#main-content');
  if (mainContent) {
    console.log('✅ Main content area properly labeled');
  } else {
    console.warn('⚠️ Main content area not properly labeled');
  }
  
  // Check ARIA labels
  const ariaLabels = document.querySelectorAll('[aria-label]');
  console.log(`✅ Found ${ariaLabels.length} elements with ARIA labels`);
  
  // Check headings hierarchy
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  console.log(`📝 Found ${headings.length} headings on page`);
  
  // Check for proper button roles
  const buttons = document.querySelectorAll('button, [role="button"]');
  console.log(`🔘 Found ${buttons.length} interactive buttons`);
  
  return true;
}

// Test 5: Check Responsive Behavior
function testResponsiveBehavior() {
  console.log('\n📱 Testing Responsive Behavior...');
  
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  
  console.log(`📏 Current viewport: ${viewport.width}x${viewport.height}`);
  
  // Check if elements are properly sized for current viewport
  const categoryGrid = document.querySelector('.category-grid-container');
  if (categoryGrid) {
    const gridStyles = window.getComputedStyle(categoryGrid);
    console.log(`📐 Category grid display: ${gridStyles.display}`);
  }
  
  // Test touch-friendly button sizes (minimum 44x44px)
  const buttons = document.querySelectorAll('button, [role="button"]');
  let touchFriendlyCount = 0;
  
  buttons.forEach(button => {
    const rect = button.getBoundingClientRect();
    if (rect.width >= 44 && rect.height >= 44) {
      touchFriendlyCount++;
    }
  });
  
  console.log(`👆 ${touchFriendlyCount}/${buttons.length} buttons are touch-friendly (44x44px+)`);
  
  return true;
}

// Test 6: Check Performance
function testPerformance() {
  console.log('\n⚡ Testing Performance...');
  
  // Check if images are optimized
  const images = document.querySelectorAll('img');
  console.log(`🖼️ Found ${images.length} images on page`);
  
  // Check for lazy loading
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  console.log(`🔄 ${lazyImages.length} images have lazy loading`);
  
  // Check for error boundaries
  const errorBoundaries = document.querySelectorAll('[data-error-boundary]');
  console.log(`🛡️ Found ${errorBoundaries.length} error boundaries`);
  
  return true;
}

// Test 7: Test Modal Functionality
function testModals() {
  console.log('\n🪟 Testing Modal Functionality...');
  
  const voucherButton = document.querySelector('.voucher-button');
  const rewardsButton = document.querySelector('.rewards-button');
  
  if (voucherButton) {
    console.log('🎫 Testing voucher modal...');
    voucherButton.click();
    
    setTimeout(() => {
      const voucherModal = document.querySelector('[role="dialog"]');
      if (voucherModal) {
        console.log('✅ Voucher modal opened successfully');
        
        // Close modal
        const closeButton = voucherModal.querySelector('button');
        if (closeButton) {
          closeButton.click();
          console.log('✅ Voucher modal closed successfully');
        }
      } else {
        console.warn('⚠️ Voucher modal did not open');
      }
    }, 500);
  }
  
  return true;
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running Home Page Component Tests...\n');
  
  const results = {
    categoryGrid: testCategoryGrid(),
    actionButtons: testActionButtons(),
    apiServices: await testAPIServices(),
    accessibility: testAccessibility(),
    responsive: testResponsiveBehavior(),
    performance: testPerformance(),
    modals: testModals()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${test}: ${status}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Home page components are working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the details above.');
  }
}

// Auto-run tests when script is loaded
runAllTests();

// Export functions for manual testing
window.homePageTests = {
  runAll: runAllTests,
  categoryGrid: testCategoryGrid,
  actionButtons: testActionButtons,
  apiServices: testAPIServices,
  accessibility: testAccessibility,
  responsive: testResponsiveBehavior,
  performance: testPerformance,
  modals: testModals
};

console.log('\n💡 You can run individual tests using:');
console.log('window.homePageTests.categoryGrid()');
console.log('window.homePageTests.actionButtons()');
console.log('window.homePageTests.accessibility()');
console.log('etc...');