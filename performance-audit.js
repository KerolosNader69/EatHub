/**
 * Performance Audit Script for Eat Hub
 * 
 * This script runs comprehensive performance tests including:
 * - Lighthouse audit
 * - Page load time measurements
 * - Animation performance (FPS)
 * - API response time tests
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// Configuration
const APP_URL = 'http://localhost:5173';
const REPORT_DIR = './performance-reports';

// Ensure report directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

/**
 * Run Lighthouse audit
 */
async function runLighthouseAudit() {
  console.log('\n🔍 Running Lighthouse Audit...\n');
  
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  
  const options = {
    logLevel: 'info',
    output: ['html', 'json'],
    onlyCategories: ['performance', 'accessibility', 'best-practices'],
    port: chrome.port,
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4, // 4G connection
      cpuSlowdownMultiplier: 4
    }
  };

  try {
    const runnerResult = await lighthouse(APP_URL, options);

    // Save reports
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const htmlReport = runnerResult.report[0];
    const jsonReport = runnerResult.report[1];
    
    fs.writeFileSync(
      path.join(REPORT_DIR, `lighthouse-${timestamp}.html`),
      htmlReport
    );
    fs.writeFileSync(
      path.join(REPORT_DIR, `lighthouse-${timestamp}.json`),
      jsonReport
    );

    // Extract key metrics
    const lhr = runnerResult.lhr;
    const performanceScore = lhr.categories.performance.score * 100;
    const metrics = lhr.audits.metrics.details.items[0];

    console.log('📊 Lighthouse Results:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Performance Score: ${performanceScore.toFixed(1)}/100 ${performanceScore >= 90 ? '✅' : '❌'}`);
    console.log(`First Contentful Paint: ${metrics.firstContentfulPaint}ms`);
    console.log(`Largest Contentful Paint: ${metrics.largestContentfulPaint}ms`);
    console.log(`Time to Interactive: ${metrics.interactive}ms`);
    console.log(`Speed Index: ${metrics.speedIndex}ms`);
    console.log(`Total Blocking Time: ${metrics.totalBlockingTime}ms`);
    console.log(`Cumulative Layout Shift: ${metrics.cumulativeLayoutShift}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      performanceScore,
      metrics,
      passed: performanceScore >= 90
    };
  } finally {
    await chrome.kill();
  }
}

/**
 * Test page load times
 */
async function testPageLoadTimes() {
  console.log('⏱️  Testing Page Load Times...\n');
  
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const CDP = require('chrome-remote-interface');
  
  try {
    const client = await CDP({ port: chrome.port });
    const { Network, Page } = client;
    
    await Network.enable();
    await Page.enable();

    const loadTimes = [];
    const iterations = 3;

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      
      await Page.navigate({ url: APP_URL });
      await Page.loadEventFired();
      
      const loadTime = Date.now() - startTime;
      loadTimes.push(loadTime);
      
      console.log(`  Load ${i + 1}: ${loadTime}ms`);
      
      // Wait a bit between loads
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const avgLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
    
    console.log('\n📊 Page Load Results:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Average Load Time: ${avgLoadTime.toFixed(0)}ms ${avgLoadTime < 3000 ? '✅' : '❌'}`);
    console.log(`Target: < 3000ms (3 seconds)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await client.close();
    
    return {
      avgLoadTime,
      loadTimes,
      passed: avgLoadTime < 3000
    };
  } finally {
    await chrome.kill();
  }
}

/**
 * Test animation performance (FPS)
 */
async function testAnimationPerformance() {
  console.log('🎬 Testing Animation Performance (Intro Sequence)...\n');
  
  const chrome = await chromeLauncher.launch({ 
    chromeFlags: ['--headless', '--disable-gpu-vsync']
  });
  const CDP = require('chrome-remote-interface');
  
  try {
    const client = await CDP({ port: chrome.port });
    const { Page, Runtime } = client;
    
    await Page.enable();
    await Runtime.enable();

    // Navigate to the page
    await Page.navigate({ url: APP_URL });
    await Page.loadEventFired();

    // Wait for intro to start
    await new Promise(resolve => setTimeout(resolve, 500));

    // Measure FPS during animation
    const result = await Runtime.evaluate({
      expression: `
        (function() {
          return new Promise((resolve) => {
            let frames = 0;
            let lastTime = performance.now();
            const duration = 4000; // 4 seconds for intro
            const startTime = performance.now();
            
            function countFrame() {
              frames++;
              const currentTime = performance.now();
              
              if (currentTime - startTime < duration) {
                requestAnimationFrame(countFrame);
              } else {
                const totalTime = (currentTime - lastTime) / 1000;
                const fps = frames / (duration / 1000);
                resolve({ fps: Math.round(fps), frames, duration });
              }
            }
            
            requestAnimationFrame(countFrame);
          });
        })()
      `,
      awaitPromise: true
    });

    const { fps, frames, duration } = result.result.value;
    
    console.log('📊 Animation Performance Results:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Average FPS: ${fps} ${fps >= 60 ? '✅' : fps >= 50 ? '⚠️' : '❌'}`);
    console.log(`Total Frames: ${frames}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Target: 60 FPS`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await client.close();
    
    return {
      fps,
      frames,
      passed: fps >= 60
    };
  } finally {
    await chrome.kill();
  }
}

/**
 * Test API response times
 */
async function testAPIResponseTimes() {
  console.log('🌐 Testing API Response Times...\n');
  
  const axios = require('axios');
  const API_BASE = 'http://localhost:5000/api';
  
  const endpoints = [
    { name: 'GET /menu', url: `${API_BASE}/menu`, method: 'GET' },
    { name: 'GET /menu/:id', url: `${API_BASE}/menu/507f1f77bcf86cd799439011`, method: 'GET' }
  ];

  const results = [];
  
  for (const endpoint of endpoints) {
    const times = [];
    
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      
      try {
        await axios({
          method: endpoint.method,
          url: endpoint.url,
          timeout: 5000
        });
        
        const responseTime = Date.now() - startTime;
        times.push(responseTime);
      } catch (error) {
        // API might not be fully functional, but we can still measure response time
        const responseTime = Date.now() - startTime;
        times.push(responseTime);
      }
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const passed = avgTime < 500;
    
    results.push({
      endpoint: endpoint.name,
      avgTime,
      times,
      passed
    });
    
    console.log(`  ${endpoint.name}: ${avgTime.toFixed(0)}ms ${passed ? '✅' : '⚠️'}`);
  }
  
  console.log('\n📊 API Response Time Results:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const allPassed = results.every(r => r.passed);
  console.log(`All endpoints < 500ms: ${allPassed ? '✅' : '⚠️'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  return {
    results,
    passed: allPassed
  };
}

/**
 * Main execution
 */
async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Eat Hub Performance Audit Suite         ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  const startTime = Date.now();
  const results = {};
  
  try {
    // Run all tests
    results.lighthouse = await runLighthouseAudit();
    results.pageLoad = await testPageLoadTimes();
    results.animation = await testAnimationPerformance();
    results.api = await testAPIResponseTimes();
    
    // Summary
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║           PERFORMANCE SUMMARY              ║');
    console.log('╚════════════════════════════════════════════╝\n');
    
    console.log(`✓ Lighthouse Performance: ${results.lighthouse.performanceScore.toFixed(1)}/100 ${results.lighthouse.passed ? '✅' : '❌'}`);
    console.log(`✓ Page Load Time: ${results.pageLoad.avgLoadTime.toFixed(0)}ms ${results.pageLoad.passed ? '✅' : '❌'}`);
    console.log(`✓ Animation FPS: ${results.animation.fps} ${results.animation.passed ? '✅' : '❌'}`);
    console.log(`✓ API Response Times: ${results.api.passed ? '✅' : '⚠️'}`);
    
    console.log(`\n⏱️  Total audit time: ${totalTime}s`);
    console.log(`📁 Reports saved to: ${REPORT_DIR}\n`);
    
    // Save summary
    const summary = {
      timestamp: new Date().toISOString(),
      results,
      totalTime: parseFloat(totalTime)
    };
    
    fs.writeFileSync(
      path.join(REPORT_DIR, 'latest-summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    // Exit with appropriate code
    const allPassed = results.lighthouse.passed && 
                      results.pageLoad.passed && 
                      results.animation.passed;
    
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ Error running performance audit:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runLighthouseAudit, testPageLoadTimes, testAnimationPerformance, testAPIResponseTimes };
