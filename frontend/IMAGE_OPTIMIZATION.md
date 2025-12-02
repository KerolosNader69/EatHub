# Image Optimization Guide

This document provides guidelines for optimizing images in the Eat Hub application.

## Automatic Optimization

The application includes automatic image optimization features:

### OptimizedImage Component

All images in the application use the `OptimizedImage` component which provides:

- **Lazy Loading**: Images below the fold are loaded only when they enter the viewport
- **WebP Support**: Automatically serves WebP format with JPEG fallback for better compression
- **Loading States**: Shows skeleton loaders while images are loading
- **Error Handling**: Displays placeholder when images fail to load

### Image Compression

When uploading menu item images through the admin panel:

- Images are automatically compressed to meet the 200KB target size
- Compression maintains quality while reducing file size
- Original aspect ratio is preserved
- Maximum dimensions: 800x800 pixels

## Manual Image Optimization

For best results, optimize images before uploading:

### Recommended Tools

**Online Tools:**
- [TinyPNG](https://tinypng.com/) - PNG and JPEG compression
- [Squoosh](https://squoosh.app/) - Advanced image compression with WebP support
- [ImageOptim](https://imageoptim.com/) - Mac app for image optimization

**Command Line:**
```bash
# Convert to WebP
cwebp input.jpg -q 80 -o output.webp

# Optimize JPEG
jpegoptim --max=80 --strip-all input.jpg

# Optimize PNG
optipng -o7 input.png
```

### Image Guidelines

**Menu Item Images:**
- Format: JPEG or WebP
- Dimensions: 800x800px (or smaller)
- File Size: < 200KB
- Aspect Ratio: Square (1:1) preferred
- Quality: 80% JPEG quality is sufficient

**Logo and Icons:**
- Format: SVG (preferred) or PNG
- Use SVG for scalable graphics
- PNG for raster images with transparency
- Optimize SVG files using [SVGOMG](https://jakearchibald.github.io/svgomg/)

## Implementation Details

### Using OptimizedImage Component

```jsx
import OptimizedImage from './components/OptimizedImage';

// Basic usage
<OptimizedImage 
  src="/path/to/image.jpg" 
  alt="Description"
  lazy={true}
/>

// With custom placeholder
<OptimizedImage 
  src="/path/to/image.jpg" 
  alt="Description"
  placeholder={<CustomPlaceholder />}
  onLoad={handleLoad}
  onError={handleError}
/>
```

### Image Upload with Compression

```jsx
import { processImageForUpload } from './utils/imageOptimization';

const handleImageUpload = async (file) => {
  try {
    const { file: optimizedFile, size, compressed } = await processImageForUpload(file);
    // Use optimizedFile for upload
  } catch (error) {
    console.error('Image optimization failed:', error);
  }
};
```

## Performance Benefits

- **Reduced Bandwidth**: WebP images are 25-35% smaller than JPEG
- **Faster Load Times**: Lazy loading reduces initial page load
- **Better UX**: Progressive loading with placeholders
- **Mobile Friendly**: Optimized for slower connections

## Browser Support

- **WebP**: Supported in all modern browsers (Chrome, Firefox, Edge, Safari 14+)
- **Lazy Loading**: Native lazy loading supported in modern browsers
- **Fallback**: JPEG fallback for older browsers

## Monitoring

Check image performance using:
- Chrome DevTools Network tab
- Lighthouse performance audit
- WebPageTest for real-world testing

Target metrics:
- Largest Contentful Paint (LCP): < 2.5s
- Total image size per page: < 1MB
- Individual image size: < 200KB
