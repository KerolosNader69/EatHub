/**
 * Simplified Performance Audit Script for Eat Hub
 * 
 * This script provides manual performance testing guidance and
 * automated API response time testing.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:5173';
const REPORT_DIR = './performance-reports';

// Ensure report directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

/**
 * Test API response times
 */
async function testAPIResponseTimes() {
  console.log('\n🌐 Testing API Response Times...\n');
  
  const endpoints = [
    { name: 'GET /menu', url: `${API_BASE}/menu`, method: 'GET' },
    { name: 'GET /orders', url: `${API_BASE}/orders`, method: 'GET' }
  ];

  const results = [];
  
  for (const endpoint of endpoints) {
    const times = [];
    let successCount = 0;
    
    console.log(`Testing ${endpoint.name}...`);
    
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      
      try {
        const response = await axios({
          method: endpoint.method,
          url: endpoint.url,
          timeout: 5000,
          validateStatus: () => true // Accept any status
        });
        
        const responseTime = Date.now() - startTime;
        times.push(responseTime);
        
        if (response.status < 500) {
          successCount++;
        }
        
        console.log(`  Attempt ${i + 1}: ${responseTime}ms (Status: ${response.status})`);
      } catch (error) {
        const responseTime = Date.now() - startTime;
        times.push(responseTime);
        console.log(`  Attempt ${i + 1}: ${responseTime}ms (Error: ${error.message})`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const passed = avgTime < 500;
    
    results.push({
      endpoint: endpoint.name,
      avgTime: Math.round(avgTime),
      minTime,
      maxTime,
      times,
      successCount,
      passed
    });
    
    console.log(`  Average: ${avgTime.toFixed(0)}ms ${passed ? '✅' : '⚠️'}`);
    console.log(`  Range: ${minTime}ms - ${maxTime}ms\n`);
  }
  
  console.log('📊 API Response Time Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  results.forEach(r => {
    console.log(`${r.endpoint}: ${r.avgTime}ms ${r.passed ? '✅' : '⚠️'}`);
  });
  const allPassed = results.every(r => r.passed);
  console.log(`\nTarget: < 500ms per endpoint`);
  console.log(`Status: ${allPassed ? 'All endpoints passed ✅' : 'Some endpoints need optimization ⚠️'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  return {
    results,
    passed: allPassed
  };
}

/**
 * Print manual testing instructions
 */
function printManualTestingInstructions() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         MANUAL PERFORMANCE TESTING GUIDE                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log('📋 LIGHTHOUSE AUDIT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Open Chrome/Edge browser');
  console.log(`2. Navigate to: ${FRONTEND_URL}`);
  console.log('3. Open DevTools (F12)');
  console.log('4. Go to "Lighthouse" tab');
  console.log('5. Select:');
  console.log('   - Categories: Performance, Accessibility, Best Practices');
  console.log('   - Device: Desktop or Mobile');
  console.log('   - Throttling: Simulated 4G');
  console.log('6. Click "Analyze page load"');
  console.log('7. Target: Performance Score ≥ 90/100 ✅\n');
  
  console.log('⏱️  PAGE LOAD TIME TEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Open Chrome/Edge DevTools (F12)');
  console.log('2. Go to "Network" tab');
  console.log('3. Set throttling to "Fast 4G"');
  console.log('4. Disable cache (checkbox at top)');
  console.log('5. Refresh page (Ctrl+Shift+R)');
  console.log('6. Check "Load" time at bottom of Network tab');
  console.log('7. Repeat 3 times and calculate average');
  console.log('8. Target: < 3000ms (3 seconds) ✅\n');
  
  console.log('🎬 ANIMATION PERFORMANCE (FPS) TEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Open Chrome/Edge DevTools (F12)');
  console.log('2. Go to "Performance" tab');
  console.log('3. Click record button (circle)');
  console.log('4. Refresh page to see intro animation');
  console.log('5. Stop recording after intro completes (~4 seconds)');
  console.log('6. Check FPS graph - should be consistently green (60 FPS)');
  console.log('7. Look for red bars (dropped frames) - should be minimal');
  console.log('8. Target: 60 FPS throughout intro animation ✅\n');
  
  console.log('Alternative FPS Test (Console):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Open Console tab in DevTools');
  console.log('2. Paste this code before refreshing:\n');
  console.log('let frames = 0, lastTime = performance.now();');
  console.log('function countFPS() {');
  console.log('  frames++;');
  console.log('  const now = performance.now();');
  console.log('  if (now >= lastTime + 1000) {');
  console.log('    console.log(`FPS: ${frames}`);');
  console.log('    frames = 0;');
  console.log('    lastTime = now;');
  console.log('  }');
  console.log('  requestAnimationFrame(countFPS);');
  console.log('}');
  console.log('countFPS();\n');
  console.log('3. Refresh page and watch FPS output in console');
  console.log('4. Target: ~60 FPS ✅\n');
  
  console.log('📊 PERFORMANCE METRICS TO RECORD');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('□ Lighthouse Performance Score: _____/100 (Target: ≥90)');
  console.log('□ First Contentful Paint (FCP): _____ms');
  console.log('□ Largest Contentful Paint (LCP): _____ms (Target: <2.5s)');
  console.log('□ Total Blocking Time (TBT): _____ms (Target: <200ms)');
  console.log('□ Cumulative Layout Shift (CLS): _____ (Target: <0.1)');
  console.log('□ Page Load Time (avg of 3): _____ms (Target: <3000ms)');
  console.log('□ Intro Animation FPS: _____ (Target: 60 FPS)');
  console.log('□ API Response Times: See automated test results above\n');
}

/**
 * Generate performance report
 */
function generateReport(apiResults) {
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    testType: 'automated-api-only',
    apiResponseTimes: apiResults,
    manualTestsRequired: {
      lighthouse: 'Run Lighthouse audit in Chrome DevTools',
      pageLoad: 'Measure page load time with Network tab throttling',
      animation: 'Record FPS with Performance tab during intro'
    },
    targets: {
      lighthouseScore: '≥ 90/100',
      pageLoadTime: '< 3000ms',
      animationFPS: '60 FPS',
      apiResponseTime: '< 500ms'
    }
  };
  
  const reportPath = path.join(REPORT_DIR, `performance-report-${timestamp.replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📁 Report saved to: ${reportPath}\n`);
  
  return report;
}

/**
 * Main execution
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        Eat Hub Performance Audit - Simple Mode            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`Backend API: ${API_BASE}\n`);
  
  try {
    // Run automated API tests
    const apiResults = await testAPIResponseTimes();
    
    // Print manual testing instructions
    printManualTestingInstructions();
    
    // Generate report
    generateReport(apiResults);
    
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    AUDIT COMPLETE                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('✅ Automated API tests completed');
    console.log('📋 Follow manual testing guide above for complete audit');
    console.log('📊 Record your results in the checklist provided\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error running performance audit:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { testAPIResponseTimes, printManualTestingInstructions };
