# Code Splitting and Caching Guide

This document explains the code splitting and caching strategies implemented in the Eat Hub application.

## Code Splitting

### Route-Based Code Splitting

The application uses React's `lazy()` and `Suspense` for route-based code splitting:

```jsx
import { lazy, Suspense } from 'react';

// Lazy load route components
const Menu = lazy(() => import('./pages/Menu'));
const Cart = lazy(() => import('./pages/Cart'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Wrap routes with Suspense
<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/menu" element={<Menu />} />
    {/* ... */}
  </Routes>
</Suspense>
```

### Benefits

- **Smaller Initial Bundle**: Only loads code needed for the current route
- **Faster Initial Load**: Reduces time to interactive
- **Separate Admin Bundle**: Admin panel code is loaded only when needed
- **Better Caching**: Individual chunks can be cached separately

### Bundle Structure

After build, the application is split into:

1. **Main Bundle**: Core React, routing, and shared components
2. **Menu Bundle**: Menu page and related components
3. **Cart Bundle**: Cart and checkout pages
4. **Admin Bundle**: Admin panel (login, dashboard, management)
5. **Vendor Bundle**: Third-party libraries (React, React Router, etc.)

## Caching Strategy

### LocalStorage Cache with TTL

The application implements a caching layer for API responses:

```javascript
import { withCache, CACHE_KEYS, CACHE_TTL } from './utils/cache';

// Cache menu items for 5 minutes
const menuItems = await withCache(
  CACHE_KEYS.MENU_ITEMS,
  () => fetchMenuItems(),
  CACHE_TTL.MENU_ITEMS
);
```

### Cache Configuration

**Menu Items Cache:**
- TTL: 5 minutes
- Key: `eathub_cache_menu_items`
- Invalidated on: Create, update, or delete menu item

**Individual Menu Item Cache:**
- TTL: 10 minutes
- Key: `eathub_cache_menu_item_{id}`
- Invalidated on: Update or delete specific item

**Order Cache:**
- TTL: 2 minutes
- Key: `eathub_cache_order_{orderNumber}`
- Invalidated on: Order status update

### Cache Invalidation

Cache is automatically invalidated when:

1. **Admin creates a menu item**: All menu caches cleared
2. **Admin updates a menu item**: All menu caches cleared
3. **Admin deletes a menu item**: All menu caches cleared
4. **Cache expires**: Based on TTL configuration

Manual cache invalidation:

```javascript
import { clearAllCache, invalidateCachePattern } from './utils/cache';

// Clear all caches
clearAllCache();

// Clear specific pattern
invalidateCachePattern('menu_');
```

## Service Worker (Optional)

A service worker is included for offline support but is disabled by default.

### Enabling Service Worker

Uncomment in `main.jsx`:

```javascript
serviceWorkerRegistration.register({
  onSuccess: () => console.log('Service worker registered'),
  onUpdate: () => console.log('New content available'),
});
```

### Service Worker Features

- **Static Asset Caching**: Caches HTML, CSS, JS, and images
- **Offline Fallback**: Serves cached content when offline
- **Cache-First Strategy**: Serves from cache, updates in background
- **Dynamic Caching**: Caches new assets as they're requested

### Cache Layers

1. **Service Worker Cache**: Static assets (HTML, CSS, JS)
2. **LocalStorage Cache**: API responses with TTL
3. **Browser Cache**: HTTP caching headers

## Performance Optimization

### Lazy Loading Images

Images use the `OptimizedImage` component with lazy loading:

```jsx
<OptimizedImage 
  src="/path/to/image.jpg" 
  alt="Description"
  lazy={true}  // Loads when entering viewport
/>
```

### Preloading Critical Routes

For better UX, consider preloading critical routes:

```javascript
// Preload menu page on app load
import('./pages/Menu');
```

### Bundle Size Monitoring

Monitor bundle sizes after build:

```bash
npm run build
```

Check the `dist/assets` folder for chunk sizes.

**Target Sizes:**
- Main bundle: < 150KB (gzipped)
- Route chunks: < 50KB each (gzipped)
- Vendor bundle: < 200KB (gzipped)

## Best Practices

### When to Use Cache

✅ **Use cache for:**
- Menu items (changes infrequently)
- Static content
- User preferences

❌ **Don't cache:**
- Order status (needs real-time updates)
- Authentication tokens (security risk)
- User-specific data

### Cache Invalidation Strategy

1. **Time-based**: Use TTL for data that changes periodically
2. **Event-based**: Invalidate on specific actions (create, update, delete)
3. **Manual**: Provide UI option to refresh data

### Code Splitting Guidelines

1. **Split by route**: Each major page should be a separate chunk
2. **Split large components**: Components > 50KB should be lazy loaded
3. **Keep shared code in main bundle**: Avoid duplication across chunks
4. **Don't over-split**: Too many small chunks can hurt performance

## Monitoring and Debugging

### Check Cache Status

```javascript
import { hasValidCache, getCacheAge } from './utils/cache';

// Check if menu items are cached
if (hasValidCache('menu_items')) {
  const age = getCacheAge('menu_items');
  console.log(`Cache age: ${age}ms`);
}
```

### View Service Worker Status

Open Chrome DevTools → Application → Service Workers

### Analyze Bundle Size

Use Vite's built-in bundle analyzer:

```bash
npm run build -- --mode analyze
```

## Configuration

### Adjust Cache TTL

Edit `frontend/src/utils/cache.js`:

```javascript
export const CACHE_TTL = {
  MENU_ITEMS: 10 * 60 * 1000, // Change to 10 minutes
  MENU_ITEM: 15 * 60 * 1000,  // Change to 15 minutes
  ORDER: 1 * 60 * 1000,        // Change to 1 minute
};
```

### Disable Caching

To disable caching for development:

```javascript
// In menuService.js
export const getMenuItems = async () => {
  return getMenuItemsBase(); // Skip cache
};
```

## Testing

### Test Cache Behavior

1. Load menu page
2. Check Network tab (should see API request)
3. Reload page within TTL
4. Check Network tab (should NOT see API request)
5. Wait for TTL to expire
6. Reload page (should see API request again)

### Test Code Splitting

1. Build the app: `npm run build`
2. Check `dist/assets` for separate chunk files
3. Open Network tab in DevTools
4. Navigate between routes
5. Verify only necessary chunks are loaded

### Test Offline Support

1. Enable service worker
2. Load the app
3. Open DevTools → Application → Service Workers
4. Check "Offline" mode
5. Reload page (should work offline)

## Troubleshooting

### Cache Not Working

- Check browser localStorage is enabled
- Verify cache keys are correct
- Check TTL hasn't expired
- Clear cache and try again

### Service Worker Issues

- Unregister old service workers
- Clear browser cache
- Check service worker is registered
- Verify HTTPS (required for service workers)

### Large Bundle Sizes

- Analyze bundle with build analyzer
- Check for duplicate dependencies
- Lazy load large components
- Use dynamic imports for heavy libraries
