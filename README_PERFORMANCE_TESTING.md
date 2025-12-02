# Performance Testing Quick Guide

## Quick Start

### Automated API Tests

Run the automated performance audit:

```bash
npm run audit:simple
```

This tests API response times and provides manual testing instructions.

---

## Manual Tests Required

### 1. Lighthouse Audit (2 minutes)

**Target: ≥90/100 Performance Score**

1. Open http://localhost:5173 in Chrome
2. Press F12 → Lighthouse tab
3. Select: Performance, Accessibility, Best Practices
4. Set throttling: Simulated 4G
5. Click "Analyze page load"
6. Record the Performance score

✅ **PASS:** Score ≥ 90  
❌ **FAIL:** Score < 90

---

### 2. Page Load Time (5 minutes)

**Target: <3000ms on 4G**

1. Press F12 → Network tab
2. Set throttling: Fast 4G
3. Disable cache ☑
4. Hard refresh (Ctrl+Shift+R)
5. Check "Load" time at bottom
6. Repeat 3 times, calculate average

✅ **PASS:** Average < 3000ms  
❌ **FAIL:** Average ≥ 3000ms

---

### 3. Animation FPS (3 minutes)

**Target: 60 FPS**

**Option A: Performance Tab**
1. Press F12 → Performance tab
2. Click record ⏺
3. Refresh page
4. Stop after intro (~4 sec)
5. Check FPS graph (green = 60fps)

**Option B: Console Counter**
1. Press F12 → Console tab
2. Paste this code:

```javascript
let frames = 0, lastTime = performance.now();
function countFPS() {
  frames++;
  const now = performance.now();
  if (now >= lastTime + 1000) {
    console.log(`FPS: ${frames}`);
    frames = 0;
    lastTime = now;
  }
  requestAnimationFrame(countFPS);
}
countFPS();
```

3. Refresh page
4. Watch FPS output (should be ~60)

✅ **PASS:** FPS ≥ 60  
⚠️ **ACCEPTABLE:** FPS ≥ 50  
❌ **FAIL:** FPS < 50

---

## Results Summary

| Test | Target | Result | Status |
|------|--------|--------|--------|
| API Response | <500ms | 9ms | ✅ |
| Lighthouse | ≥90 | _____ | ⬜ |
| Page Load | <3000ms | _____ | ⬜ |
| Animation FPS | 60 | _____ | ⬜ |

---

## Troubleshooting

### Low Lighthouse Score
- Check bundle size in Network tab
- Review Lighthouse recommendations
- Verify images are optimized

### Slow Page Load
- Check if service worker is active
- Verify code splitting is working
- Test on different network speeds

### Low FPS
- Check CPU usage during animation
- Verify GPU acceleration is enabled
- Test in incognito mode (no extensions)

---

## Reports Location

All performance reports are saved to:
```
./performance-reports/
```

Files include:
- `performance-report-[timestamp].json` - Automated test results
- `latest-summary.json` - Most recent test summary

---

## Performance Targets Summary

✅ **API Response Time:** < 500ms (Currently: ~9ms)  
✅ **Lighthouse Score:** ≥ 90/100  
✅ **Page Load Time:** < 3000ms on 4G  
✅ **Animation FPS:** 60 FPS  
✅ **Initial Bundle:** < 200KB  
✅ **LCP:** < 2.5 seconds  
✅ **CLS:** < 0.1  

---

*For detailed results and analysis, see PERFORMANCE_AUDIT_RESULTS.md*
