# Performance Testing Checklist

**Application:** Eat Hub Web Application  
**Date:** _____________  
**Tester:** _____________  
**Environment:** Development / Staging / Production

---

## Pre-Test Setup

- [ ] Frontend running at http://localhost:5173
- [ ] Backend running at http://localhost:5000
- [ ] Browser: Chrome or Edge (latest version)
- [ ] No browser extensions active (use incognito mode)
- [ ] Stable internet connection

---

## 1. Automated API Response Time Tests

**Command:** `npm run audit:simple`

### Results

- [ ] Test completed successfully
- [ ] Report generated in `performance-reports/`

| Endpoint | Response Time | Target | Status |
|----------|--------------|--------|--------|
| GET /menu | _____ ms | <500ms | ⬜ |
| GET /orders | _____ ms | <500ms | ⬜ |

**Overall API Status:** ⬜ PASS / ⬜ FAIL

---

## 2. Lighthouse Performance Audit

**Steps:**
1. Open http://localhost:5173 in Chrome
2. Press F12 → Lighthouse tab
3. Select: Performance, Accessibility, Best Practices
4. Device: Desktop / Mobile
5. Throttling: Simulated 4G
6. Click "Analyze page load"

### Results

| Metric | Score/Value | Target | Status |
|--------|-------------|--------|--------|
| **Performance Score** | _____/100 | ≥90 | ⬜ |
| First Contentful Paint | _____ ms | - | - |
| Largest Contentful Paint | _____ ms | <2500ms | ⬜ |
| Total Blocking Time | _____ ms | <200ms | ⬜ |
| Cumulative Layout Shift | _____ | <0.1 | ⬜ |
| Speed Index | _____ ms | - | - |

**Lighthouse Status:** ⬜ PASS / ⬜ FAIL

**Report saved:** ⬜ Yes (Location: _____________)

---

## 3. Page Load Time Test

**Steps:**
1. Press F12 → Network tab
2. Set throttling: Fast 4G
3. Disable cache ☑
4. Hard refresh (Ctrl+Shift+R)
5. Check "Load" time at bottom
6. Repeat 3 times

### Results

| Run | Load Time (ms) |
|-----|----------------|
| 1 | _____ |
| 2 | _____ |
| 3 | _____ |
| **Average** | **_____** |

**Target:** < 3000ms  
**Status:** ⬜ PASS / ⬜ FAIL

---

## 4. Animation Performance (FPS) Test

**Method Used:** ⬜ Performance Tab / ⬜ Console Counter

### Method A: Performance Tab

**Steps:**
1. Press F12 → Performance tab
2. Click record ⏺
3. Refresh page
4. Stop after intro (~4 seconds)
5. Analyze FPS graph

### Method B: Console Counter

**Steps:**
1. Press F12 → Console tab
2. Paste FPS counter code (see README_PERFORMANCE_TESTING.md)
3. Refresh page
4. Record FPS values

### Results

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Average FPS | _____ | 60 | ⬜ |
| Minimum FPS | _____ | ≥50 | ⬜ |
| Frame drops | ⬜ Yes / ⬜ No | No | ⬜ |

**Animation Status:** ⬜ PASS / ⬜ FAIL

---

## 5. Additional Observations

### Bundle Sizes (from Network tab)

| Resource | Size | Gzipped |
|----------|------|---------|
| Main JS bundle | _____ KB | _____ KB |
| Main CSS | _____ KB | _____ KB |
| Total initial load | _____ KB | _____ KB |

**Target:** < 200KB initial load  
**Status:** ⬜ PASS / ⬜ FAIL

### Browser Console

- [ ] No JavaScript errors
- [ ] No console warnings (or documented)
- [ ] No failed network requests

### Visual Performance

- [ ] Intro animation smooth
- [ ] No layout shifts during load
- [ ] Images load progressively
- [ ] Interactions feel responsive

---

## Overall Test Summary

| Test Category | Status | Notes |
|--------------|--------|-------|
| API Response Times | ⬜ PASS / ⬜ FAIL | |
| Lighthouse Score | ⬜ PASS / ⬜ FAIL | |
| Page Load Time | ⬜ PASS / ⬜ FAIL | |
| Animation FPS | ⬜ PASS / ⬜ FAIL | |
| Bundle Size | ⬜ PASS / ⬜ FAIL | |

**Overall Result:** ⬜ ALL PASS / ⬜ NEEDS OPTIMIZATION

---

## Issues Found

| Issue | Severity | Description | Action Required |
|-------|----------|-------------|-----------------|
| 1. | ⬜ High / ⬜ Medium / ⬜ Low | | |
| 2. | ⬜ High / ⬜ Medium / ⬜ Low | | |
| 3. | ⬜ High / ⬜ Medium / ⬜ Low | | |

---

## Recommendations

_List any optimization recommendations based on test results:_

1. _____________________________________________
2. _____________________________________________
3. _____________________________________________

---

## Sign-off

**Tested by:** _____________  
**Date:** _____________  
**Signature:** _____________

**Reviewed by:** _____________  
**Date:** _____________  
**Signature:** _____________

---

## Next Steps

- [ ] Address any failed tests
- [ ] Implement recommended optimizations
- [ ] Re-test after changes
- [ ] Document final results in PERFORMANCE_AUDIT_RESULTS.md
- [ ] Archive test reports

---

*For detailed testing procedures, see README_PERFORMANCE_TESTING.md*  
*For analysis and recommendations, see PERFORMANCE_AUDIT_RESULTS.md*
