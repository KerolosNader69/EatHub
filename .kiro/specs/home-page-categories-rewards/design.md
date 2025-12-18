# Home Page Categories & Rewards - Design Document

## Overview

This design document outlines the implementation of a new home page for the Eat Hub web application that displays after the intro sequence. The home page will feature a visually appealing category grid, prominent voucher and rewards buttons, and a featured items section. The design maintains consistency with the existing brand identity while creating an engaging entry point for customers.

## Architecture

### Component Structure

The home page will be implemented as a new React component that integrates with the existing routing system. It will utilize the current state management (CartContext) and API services while introducing new components for category display and rewards functionality.

```
HomePage
├── Navigation (existing)
├── CategoryGrid
│   ├── CategoryCard (multiple)
├── ActionButtons
│   ├── VoucherButton
│   ├── RewardsButton
├── FeaturedItems
│   ├── FeaturedItemCard (multiple)
└── Footer (optional)
```

### Integration Points

- **Routing**: New route `/` that displays after intro completion
- **State Management**: Utilizes existing CartContext for featured items
- **API Services**: Extends existing menuService for featured items
- **Navigation**: Integrates with existing Navigation component

## Components and Interfaces

### 1. HomePage Component (`HomePage.jsx`)

Main container component that orchestrates the home page layout.

**Props:**
- None (uses context for state)

**Features:**
- Responsive grid layout
- Smooth scroll behavior for navigation
- Loading states for dynamic content
- Error boundaries for failed API calls

**Layout Structure:**
```
┌─────────────────────────────────────┐
│           Navigation Bar             │
├─────────────────────────────────────┤
│                                     │
│         Category Grid               │
│    [Food] [Groceries] [Health]      │
│    [Gift]  [Store]   [More...]      │
│                                     │
├─────────────────────────────────────┤
│                                     │
│      Action Buttons Section        │
│    [Voucher]    [Rewards]          │
│                                     │
├─────────────────────────────────────┤
│                                     │
│       Featured Items Section       │
│  [Item1] [Item2] [Item3] [Item4]   │
│                                     │
└─────────────────────────────────────┘
```

### 2. CategoryGrid Component (`CategoryGrid.jsx`)

Displays food categories in a responsive grid layout.

**Props:**
- `categories`: Array of category objects
- `onCategoryClick`: Handler for category selection

**Features:**
- Responsive grid (3 cols mobile, 4 cols tablet, 5 cols desktop)
- Hover animations and transitions
- Icon support (SVG or image)
- Loading skeleton while data loads

**Category Object Structure:**
```javascript
{
  id: string,
  name: string,
  icon: string, // SVG path or image URL
  color: string, // Background color for category
  itemCount: number // Number of items in category
}
```

### 3. CategoryCard Component (`CategoryCard.jsx`)

Individual category display card.

**Props:**
- `category`: Category object
- `onClick`: Click handler

**Features:**
- Rounded card design with shadow
- Icon display with background color
- Category name and item count
- Hover effects (lift, scale)
- Touch-friendly sizing (minimum 120x120px)

**Styling:**
- Background: White (#FFFFFF)
- Border-radius: 12px
- Box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)
- Hover: translateY(-4px), increased shadow

### 4. ActionButtons Component (`ActionButtons.jsx`)

Container for voucher and rewards buttons.

**Props:**
- `onVoucherClick`: Handler for voucher button
- `onRewardsClick`: Handler for rewards button

**Features:**
- Side-by-side button layout
- Responsive stacking on mobile
- Professional styling with icons
- Loading states for button actions

### 5. VoucherButton Component (`VoucherButton.jsx`)

Professional styled button for voucher access.

**Props:**
- `onClick`: Click handler
- `voucherCount`: Number of available vouchers (optional)

**Features:**
- Primary button styling with red background
- Voucher icon (ticket or percentage symbol)
- Badge showing available voucher count
- Disabled state when no vouchers available

**Styling:**
- Background: #C41E3A (brand red)
- Text: #FFFFFF
- Padding: 16px 32px
- Border-radius: 8px
- Icon: Left-aligned with text

### 6. RewardsButton Component (`RewardsButton.jsx`)

Professional styled button for rewards access.

**Props:**
- `onClick`: Click handler
- `rewardPoints`: Current reward points (optional)

**Features:**
- Secondary button styling with outline
- Rewards icon (star or gift symbol)
- Points display if user is logged in
- Gradient background on hover

**Styling:**
- Background: transparent
- Border: 2px solid #C41E3A
- Text: #C41E3A
- Padding: 14px 30px
- Border-radius: 8px
- Hover: Background gradient

### 7. FeaturedItems Component (`FeaturedItems.jsx`)

Displays popular or featured menu items.

**Props:**
- `featuredItems`: Array of menu items
- `onItemClick`: Handler for item selection
- `onAddToCart`: Handler for adding items to cart

**Features:**
- Horizontal scrollable layout on mobile
- Grid layout on desktop (4 items per row)
- "Add to Cart" quick action
- Item detail modal integration

### 8. FeaturedItemCard Component (`FeaturedItemCard.jsx`)

Individual featured item display.

**Props:**
- `item`: Menu item object
- `onItemClick`: Click handler for details
- `onAddToCart`: Handler for cart addition

**Features:**
- Compact card design
- Item image, name, price
- Quick "Add to Cart" button
- Hover effects and animations

## Data Models

### Category Model

```javascript
{
  id: string,
  name: string,
  displayName: string,
  icon: string, // SVG path or image URL
  backgroundColor: string, // Hex color
  itemCount: number,
  isActive: boolean,
  sortOrder: number
}
```

### Featured Item Model

```javascript
{
  id: string,
  name: string,
  description: string,
  price: number,
  image: string,
  category: string,
  isFeatured: boolean,
  featuredOrder: number,
  available: boolean
}
```

### Voucher Model

```javascript
{
  id: string,
  code: string,
  title: string,
  description: string,
  discountType: 'percentage' | 'fixed',
  discountValue: number,
  minimumOrder: number,
  expiryDate: Date,
  isActive: boolean,
  usageLimit: number,
  usedCount: number
}
```

### Rewards Model

```javascript
{
  userId: string, // If user is logged in
  currentPoints: number,
  totalEarned: number,
  availableRewards: [{
    id: string,
    title: string,
    description: string,
    pointsCost: number,
    rewardType: 'discount' | 'free_item' | 'upgrade'
  }]
}
```

## API Endpoints

### Category Endpoints

**GET /api/categories**
- Returns all active categories with item counts
- Response: `{ success: true, data: [categories] }`

**GET /api/categories/:id/items**
- Returns menu items for specific category
- Response: `{ success: true, data: [menuItems] }`

### Featured Items Endpoints

**GET /api/menu/featured**
- Returns featured menu items (limit 6)
- Response: `{ success: true, data: [featuredItems] }`

### Voucher Endpoints

**GET /api/vouchers/available**
- Returns available vouchers for customer
- Response: `{ success: true, data: [vouchers] }`

**POST /api/vouchers/validate**
- Validates voucher code
- Body: `{ code: string, orderTotal: number }`
- Response: `{ success: true, data: { valid: boolean, discount: number } }`

### Rewards Endpoints

**GET /api/rewards/status**
- Returns customer rewards status (if logged in)
- Response: `{ success: true, data: rewardsData }`

**POST /api/rewards/redeem**
- Redeems reward points
- Body: `{ rewardId: string, pointsToRedeem: number }`
- Response: `{ success: true, data: { newBalance: number, reward: object } }`

## Styling and Design System

### Layout Specifications

**Category Grid:**
- Desktop: 5 columns, 24px gap
- Tablet: 4 columns, 20px gap
- Mobile: 3 columns, 16px gap
- Card size: 120x120px minimum

**Action Buttons:**
- Desktop: Side by side, 300px width each
- Mobile: Stacked, full width with 16px gap
- Height: 60px consistent

**Featured Items:**
- Desktop: 4 columns grid
- Tablet: 3 columns grid
- Mobile: Horizontal scroll, 280px card width

### Color Palette Extensions

- **Category Background Colors:**
  - Food: #FFE5E5 (light red tint)
  - Groceries: #E5F5E5 (light green)
  - Health & Beauty: #E5E5FF (light blue)
  - Gift & Donate: #FFE5F5 (light pink)
  - Store: #F5F5E5 (light yellow)

- **Button Gradients:**
  - Voucher hover: linear-gradient(135deg, #C41E3A, #A01729)
  - Rewards hover: linear-gradient(135deg, transparent, rgba(196, 30, 58, 0.1))

### Typography

- **Category Names**: 16px, font-weight: 600
- **Button Text**: 18px, font-weight: 700
- **Featured Item Names**: 14px, font-weight: 500
- **Featured Item Prices**: 16px, font-weight: 700, color: #C41E3A

### Animations and Transitions

**Category Cards:**
- Hover: transform: translateY(-4px), transition: 0.3s ease
- Click: scale(0.95), transition: 0.1s ease

**Action Buttons:**
- Hover: transform: translateY(-2px), transition: 0.2s ease
- Loading: pulse animation on button content

**Featured Items:**
- Hover: transform: scale(1.05), transition: 0.2s ease
- Add to cart: success animation (checkmark)

## Responsive Design

### Breakpoints

- **Mobile**: < 768px
  - Single column layout
  - Stacked action buttons
  - Horizontal scroll for featured items
  - Larger touch targets (minimum 44px)

- **Tablet**: 768px - 1024px
  - Two column sections
  - Side-by-side action buttons
  - Grid layout for featured items

- **Desktop**: > 1024px
  - Full grid layouts
  - Hover effects enabled
  - Optimal spacing and sizing

### Performance Considerations

1. **Image Optimization:**
   - Category icons: SVG preferred, max 24KB
   - Featured item images: WebP format, 300x200px, < 50KB
   - Lazy loading for featured items below fold

2. **Code Splitting:**
   - Voucher modal loaded on demand
   - Rewards component lazy loaded
   - Featured items API call only when section is visible

3. **Caching Strategy:**
   - Categories cached for 1 hour
   - Featured items cached for 30 minutes
   - Vouchers fetched fresh each time

## Error Handling

### Category Loading Errors

- Show skeleton cards while loading
- Display error message if categories fail to load
- Provide retry button
- Fallback to basic menu navigation

### Featured Items Errors

- Hide section if API fails
- Show placeholder cards during loading
- Graceful degradation without featured items

### Voucher/Rewards Errors

- Disable buttons if services unavailable
- Show error toast for failed actions
- Provide alternative navigation to menu

## Accessibility

### Keyboard Navigation

- Tab order: Categories → Action buttons → Featured items
- Enter/Space activation for all interactive elements
- Focus indicators visible and high contrast
- Skip links for screen readers

### Screen Reader Support

- Alt text for category icons
- ARIA labels for buttons
- Semantic HTML structure
- Descriptive text for voucher/rewards status

### Color Contrast

- All text meets WCAG AA standards (4.5:1 ratio)
- Button states clearly distinguishable
- Focus indicators high contrast
- Alternative indicators beyond color

## Integration with Existing System

### Routing Updates

```javascript
// App.jsx routing changes
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/menu" element={<Menu />} />
  <Route path="/menu/:category" element={<Menu />} />
  // ... existing routes
</Routes>
```

### State Management Integration

- Utilizes existing CartContext for featured items
- Extends with VoucherContext for voucher state
- Integrates with AuthContext for rewards (if user logged in)

### API Service Extensions

```javascript
// menuService.js additions
export const getFeaturedItems = () => api.get('/api/menu/featured');
export const getCategories = () => api.get('/api/categories');

// New voucherService.js
export const getAvailableVouchers = () => api.get('/api/vouchers/available');
export const validateVoucher = (code, total) => api.post('/api/vouchers/validate', { code, total });

// New rewardsService.js
export const getRewardsStatus = () => api.get('/api/rewards/status');
export const redeemReward = (rewardId, points) => api.post('/api/rewards/redeem', { rewardId, points });
```

### Backend Extensions

The existing Express.js backend will be extended with new routes and controllers for categories, vouchers, and rewards functionality while maintaining the current architecture and database structure.