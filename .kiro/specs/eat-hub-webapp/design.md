# Eat Hub Webapp - Design Document

## Overview

Eat Hub is a single-page web application (SPA) built for a home-based cloud kitchen. The application features a memorable animated intro sequence followed by a modern, responsive interface for browsing menu items, managing a shopping cart, and placing orders. The design emphasizes the brand identity through consistent use of the color palette (black #000000, white #FFFFFF, red #C41E3A) and clean, attractive UI components.

The application will be built using modern web technologies with a focus on performance, user experience, and maintainability. The architecture separates concerns between presentation, business logic, and data management.

## Architecture

### Technology Stack

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- React.js for component-based UI architecture
- React Router for client-side routing
- Context API or Redux for state management
- CSS Modules or Styled Components for styling

**Backend:**
- Node.js with Express.js for REST API
- MongoDB for database (flexible schema for menu items and orders)
- Mongoose ODM for data modeling

**Additional Tools:**
- Axios for HTTP requests
- JWT for authentication (admin panel)
- Multer for image uploads (menu item images)

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │           React Application (SPA)                  │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────┐ │  │
│  │  │   Intro     │  │   Customer   │  │  Admin   │ │  │
│  │  │  Sequence   │  │     Pages    │  │  Panel   │ │  │
│  │  └─────────────┘  └──────────────┘  └──────────┘ │  │
│  │         │                 │                │       │  │
│  │         └─────────────────┴────────────────┘       │  │
│  │                          │                          │  │
│  │                   State Management                  │  │
│  │              (Context API / Redux)                  │  │
│  └──────────────────────────┬──────────────────────────┘  │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP/REST
                             │
┌────────────────────────────┴────────────────────────────┐
│                   Express.js Server                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │              REST API Endpoints                    │  │
│  │  /api/menu  /api/orders  /api/admin  /api/auth   │  │
│  └───────────────────────────┬───────────────────────┘  │
│                              │                           │
│  ┌───────────────────────────┴───────────────────────┐  │
│  │           Business Logic Layer                     │  │
│  │  (Controllers, Services, Validators)              │  │
│  └───────────────────────────┬───────────────────────┘  │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────┐
│                    MongoDB Database                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   MenuItems  │  │    Orders    │  │    Admins    │  │
│  │  Collection  │  │  Collection  │  │  Collection  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Frontend Components

#### 1. Intro Sequence Component (`IntroSequence.jsx`)

Displays the animated loading screen with brand elements.

**Props:**
- `onComplete`: Callback function triggered when intro finishes
- `skipIntro`: Boolean to skip animation (for reduced motion preference)

**Behavior:**
- Renders four sequential scenes: EAT text, laptop icon, play/pause interaction, final logo
- Uses CSS transitions and JavaScript setTimeout for timing
- Automatically transitions to main app after completion
- Respects `prefers-reduced-motion` media query

**Styling:**
- Black background (#000000)
- White text (#FFFFFF) for "Eat"
- Red accent (#C41E3A) for "hub" and interactive elements
- Responsive sizing for mobile devices

#### 2. Navigation Component (`Navigation.jsx`)

Top navigation bar with logo and cart icon.

**Props:**
- `cartItemCount`: Number of items in cart
- `onCartClick`: Handler for cart icon click

**Features:**
- Sticky positioning at top of viewport
- Eat Hub logo (clickable, returns to home)
- Cart icon with badge showing item count
- Mobile hamburger menu for smaller screens

#### 3. Menu Component (`Menu.jsx`)

Displays categorized list of available food items.

**Props:**
- `menuItems`: Array of menu item objects
- `onItemClick`: Handler when item is clicked

**Features:**
- Category tabs/sections (Appetizers, Main Courses, Desserts, Beverages)
- Grid layout for menu items (responsive: 4 cols desktop, 2 cols tablet, 1 col mobile)
- Each item shows image, name, price, brief description
- "Add to Cart" button on each item
- Filter for available items only

#### 4. Menu Item Card (`MenuItemCard.jsx`)

Individual menu item display.

**Props:**
- `item`: Object with {id, name, description, price, image, category, available}
- `onAddToCart`: Handler for add to cart action

**Features:**
- Image with fallback placeholder
- Item name and price prominently displayed
- Truncated description with "View Details" link
- Add to Cart button (disabled if unavailable)
- Hover effects for interactivity

#### 5. Menu Item Detail Modal (`MenuItemDetail.jsx`)

Expanded view of a single menu item.

**Props:**
- `item`: Full menu item object with ingredients, portion size
- `onClose`: Handler to close modal
- `onAddToCart`: Handler for add to cart

**Features:**
- Large image display
- Complete description and ingredients list
- Portion size information
- Quantity selector
- Add to Cart button
- Close button/overlay click to dismiss

#### 6. Cart Component (`Cart.jsx`)

Shopping cart view with item list and totals.

**Props:**
- `cartItems`: Array of items in cart with quantities
- `onUpdateQuantity`: Handler for quantity changes
- `onRemoveItem`: Handler for item removal
- `onCheckout`: Handler for proceeding to checkout

**Features:**
- List of cart items with thumbnails, names, prices, quantities
- Quantity adjustment controls (+/- buttons)
- Remove item button
- Subtotal calculation
- Checkout button
- Empty cart state message

#### 7. Checkout Component (`Checkout.jsx`)

Order form for delivery information.

**Props:**
- `cartItems`: Items being ordered
- `totalAmount`: Total order price
- `onSubmit`: Handler for order submission

**Features:**
- Form fields: name, phone, address, special instructions
- Form validation (required fields, phone format)
- Order summary display
- Submit order button
- Loading state during submission

#### 8. Order Confirmation Component (`OrderConfirmation.jsx`)

Displays successful order details.

**Props:**
- `orderNumber`: Unique order identifier
- `estimatedDelivery`: Estimated delivery time
- `orderDetails`: Complete order information

**Features:**
- Order number prominently displayed
- Order status indicator
- Estimated delivery time
- Order items list with quantities and prices
- Delivery address confirmation
- "Track Order" button

#### 9. Order Status Component (`OrderStatus.jsx`)

Allows customers to check order status.

**Props:**
- `orderNumber`: Order ID to look up

**Features:**
- Input field for order number
- Status display (Received → Preparing → Out for Delivery → Delivered)
- Visual progress indicator
- Order details (items, address, time)
- Refresh button to update status

#### 10. Admin Dashboard (`AdminDashboard.jsx`)

Admin panel for managing menu and orders.

**Props:**
- `isAuthenticated`: Boolean for auth state

**Features:**
- Login form (if not authenticated)
- Two main sections: Menu Management, Order Management
- Tab navigation between sections
- Logout button

#### 11. Admin Menu Management (`AdminMenuManagement.jsx`)

Interface for CRUD operations on menu items.

**Features:**
- Table/grid view of all menu items
- Add New Item button (opens form modal)
- Edit button for each item
- Toggle availability switch
- Delete button with confirmation
- Image upload for menu items
- Form validation

#### 12. Admin Order Management (`AdminOrderManagement.jsx`)

Interface for viewing and updating orders.

**Features:**
- List of orders sorted by time (newest first)
- Order cards showing: order number, customer name, items, status, time
- Status dropdown for each order
- Expand/collapse for full order details
- Filter by status (All, Received, Preparing, Out for Delivery, Delivered)
- Auto-refresh every 30 seconds for new orders

### Backend API Endpoints

#### Menu Endpoints

**GET /api/menu**
- Returns all available menu items
- Response: `{ success: true, data: [menuItems] }`

**GET /api/menu/:id**
- Returns single menu item by ID
- Response: `{ success: true, data: menuItem }`

**POST /api/menu** (Admin only)
- Creates new menu item
- Body: `{ name, description, price, category, image, ingredients, portionSize }`
- Response: `{ success: true, data: newMenuItem }`

**PUT /api/menu/:id** (Admin only)
- Updates existing menu item
- Body: Fields to update
- Response: `{ success: true, data: updatedMenuItem }`

**DELETE /api/menu/:id** (Admin only)
- Deletes menu item
- Response: `{ success: true, message: "Item deleted" }`

#### Order Endpoints

**POST /api/orders**
- Creates new order
- Body: `{ items: [{itemId, quantity}], customerInfo: {name, phone, address}, specialInstructions }`
- Response: `{ success: true, data: { orderNumber, estimatedDelivery, order } }`

**GET /api/orders/:orderNumber**
- Returns order details by order number
- Response: `{ success: true, data: order }`

**GET /api/orders** (Admin only)
- Returns all orders
- Query params: `?status=received` (optional filter)
- Response: `{ success: true, data: [orders] }`

**PUT /api/orders/:orderNumber/status** (Admin only)
- Updates order status
- Body: `{ status: "preparing" | "out_for_delivery" | "delivered" }`
- Response: `{ success: true, data: updatedOrder }`

#### Auth Endpoints

**POST /api/auth/login**
- Admin login
- Body: `{ username, password }`
- Response: `{ success: true, token: "jwt_token", admin: {id, username} }`

**POST /api/auth/verify**
- Verifies JWT token
- Headers: `Authorization: Bearer <token>`
- Response: `{ success: true, admin: {id, username} }`

## Data Models

### MenuItem Schema

```javascript
{
  _id: ObjectId,
  name: String (required, max 100 chars),
  description: String (required, max 500 chars),
  price: Number (required, min 0),
  category: String (required, enum: ['appetizers', 'main_courses', 'desserts', 'beverages']),
  image: String (URL or path),
  ingredients: [String],
  portionSize: String,
  available: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema

```javascript
{
  _id: ObjectId,
  orderNumber: String (unique, auto-generated, format: "EH" + timestamp + random),
  items: [{
    menuItem: ObjectId (ref: 'MenuItem'),
    name: String (snapshot at order time),
    price: Number (snapshot at order time),
    quantity: Number (min 1)
  }],
  customerInfo: {
    name: String (required),
    phone: String (required),
    address: String (required)
  },
  specialInstructions: String,
  totalAmount: Number (calculated),
  status: String (enum: ['received', 'preparing', 'out_for_delivery', 'delivered'], default: 'received'),
  estimatedDelivery: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Admin Schema

```javascript
{
  _id: ObjectId,
  username: String (required, unique),
  password: String (required, hashed with bcrypt),
  email: String,
  createdAt: Date
}
```

## Error Handling

### Frontend Error Handling

1. **Network Errors**: Display user-friendly error messages with retry options
2. **Validation Errors**: Show inline validation messages on form fields
3. **404 Errors**: Redirect to home page or show "Item not found" message
4. **Auth Errors**: Redirect to login page for admin routes
5. **Loading States**: Show spinners/skeletons during data fetching

### Backend Error Handling

1. **Validation Errors**: Return 400 status with specific field errors
2. **Authentication Errors**: Return 401 status with error message
3. **Authorization Errors**: Return 403 status
4. **Not Found Errors**: Return 404 status with helpful message
5. **Server Errors**: Return 500 status, log error details, return generic message to client

**Error Response Format:**
```javascript
{
  success: false,
  error: {
    message: "User-friendly error message",
    code: "ERROR_CODE",
    details: {} // Optional additional info
  }
}
```

### Error Logging

- Use console.error for development
- Implement proper logging service for production (e.g., Winston, Morgan)
- Log all 500 errors with stack traces
- Log failed authentication attempts

## Testing Strategy

### Unit Testing

**Frontend:**
- Test individual components with React Testing Library
- Test utility functions and helpers
- Test state management logic (reducers, actions)
- Mock API calls with MSW (Mock Service Worker)

**Backend:**
- Test API route handlers
- Test database models and methods
- Test middleware functions
- Test validation logic
- Mock database calls with jest-mongodb

**Coverage Target:** 70% minimum

### Integration Testing

**Frontend:**
- Test user flows (browse → add to cart → checkout)
- Test component interactions
- Test routing and navigation

**Backend:**
- Test complete API endpoints with real database (test DB)
- Test authentication flow
- Test order creation and status updates

### End-to-End Testing

- Use Cypress or Playwright
- Test critical user journeys:
  1. Customer places order (intro → browse → cart → checkout → confirmation)
  2. Admin manages menu (login → add item → edit item → toggle availability)
  3. Admin processes order (login → view orders → update status)
- Test on multiple browsers (Chrome, Firefox, Safari)
- Test responsive behavior on mobile devices

### Performance Testing

- Lighthouse audits (target: 90+ performance score)
- Test intro sequence animation performance (60fps target)
- Test page load times (< 3 seconds on 4G)
- Test API response times (< 500ms for most endpoints)

### Accessibility Testing

- WCAG 2.1 AA compliance
- Keyboard navigation testing
- Screen reader testing (NVDA, JAWS)
- Color contrast validation (especially with red accent color)
- Test reduced motion preferences

## Design System

### Color Palette

- **Primary Black**: #000000 (backgrounds, primary text)
- **Primary White**: #FFFFFF (text on dark backgrounds, card backgrounds)
- **Accent Red**: #C41E3A (buttons, highlights, "hub" text, interactive elements)
- **Gray Scale**:
  - Light Gray: #F5F5F5 (subtle backgrounds)
  - Medium Gray: #999999 (secondary text)
  - Dark Gray: #333333 (borders, dividers)

### Typography

- **Primary Font**: Inter or system-ui fallback
- **Headings**: Bold (700-800 weight)
  - H1: 36-40px
  - H2: 28-32px
  - H3: 20-24px
- **Body Text**: Regular (400 weight), 16px
- **Small Text**: 13-14px for captions, labels

### Spacing System

- Base unit: 4px
- Common spacing: 8px, 12px, 16px, 24px, 32px, 48px

### Button Styles

**Primary Button** (Call-to-action):
- Background: #C41E3A (red)
- Text: #FFFFFF
- Padding: 12px 24px
- Border-radius: 6px
- Hover: Darken background by 10%

**Secondary Button**:
- Background: transparent
- Border: 2px solid #C41E3A
- Text: #C41E3A
- Padding: 10px 22px
- Border-radius: 6px
- Hover: Background #C41E3A, Text #FFFFFF

**Disabled State**:
- Background: #CCCCCC
- Text: #666666
- Cursor: not-allowed

### Card Styles

- Background: #FFFFFF
- Border-radius: 8px
- Box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)
- Padding: 16px
- Hover: Lift effect (increase shadow, slight translateY)

### Form Input Styles

- Border: 1px solid #CCCCCC
- Border-radius: 4px
- Padding: 10px 12px
- Focus: Border color #C41E3A, outline none
- Error: Border color #FF0000, show error message below

### Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Performance Optimizations

1. **Image Optimization**:
   - Use WebP format with JPEG fallback
   - Lazy load images below the fold
   - Serve responsive images (srcset)
   - Compress images (target: < 200KB per image)

2. **Code Splitting**:
   - Split admin panel into separate bundle
   - Lazy load route components
   - Dynamic imports for heavy components

3. **Caching**:
   - Cache menu items in browser (localStorage with TTL)
   - Service worker for offline support (optional)
   - HTTP caching headers for static assets

4. **Bundle Optimization**:
   - Tree shaking unused code
   - Minification and compression (gzip/brotli)
   - Target bundle size: < 200KB initial load

5. **Database Optimization**:
   - Index on orderNumber field
   - Index on menuItem category and available fields
   - Limit query results with pagination

## Security Considerations

1. **Authentication**:
   - JWT tokens with expiration (24 hours)
   - Secure password hashing (bcrypt, 10 rounds)
   - HTTPS only in production

2. **Input Validation**:
   - Sanitize all user inputs
   - Validate on both client and server
   - Prevent XSS attacks (escape HTML)

3. **API Security**:
   - Rate limiting on endpoints
   - CORS configuration (whitelist frontend domain)
   - Protect admin routes with auth middleware

4. **Data Protection**:
   - Don't expose sensitive data in API responses
   - Validate file uploads (type, size)
   - Environment variables for secrets

## Deployment Architecture

**Frontend**:
- Host on Vercel, Netlify, or similar
- CDN for static assets
- Environment variables for API URL

**Backend**:
- Host on Heroku, Railway, or DigitalOcean
- Environment variables for DB connection, JWT secret
- Process manager (PM2) for Node.js

**Database**:
- MongoDB Atlas (cloud) or self-hosted
- Regular backups
- Connection pooling

**Domain & SSL**:
- Custom domain for professional appearance
- SSL certificate (Let's Encrypt or provider)
