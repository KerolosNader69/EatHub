# Design Document

## Overview

This document outlines the technical design for implementing category-based item sections on the EatHub homepage. The system will organize menu items into distinct category sections, ensuring strict filtering logic, proper data relationships, and admin capabilities for managing category assignments.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
├─────────────────────────────────────────────────────────┤
│  HomePage Component                                      │
│  ├─ CategoryGrid (existing)                            │
│  ├─ CategorySections (new)                             │
│  │   ├─ CategorySection (new)                          │
│  │   │   ├─ Section Title                              │
│  │   │   ├─ Horizontal Item Scroller                   │
│  │   │   └─ View All Button                            │
│  │   └─ Multiple CategorySection instances             │
│  └─ FeaturedItems (existing)                           │
├─────────────────────────────────────────────────────────┤
│  Menu Page (updated)                                     │
│  ├─ Category-specific filtering                         │
│  └─ Back button navigation                              │
├─────────────────────────────────────────────────────────┤
│  Admin Dashboard (updated)                               │
│  ├─ Category dropdown in item form                      │
│  ├─ Category filter in item list                        │
│  └─ Bulk category assignment                            │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                  Backend API (Node.js)                   │
├─────────────────────────────────────────────────────────┤
│  GET /api/menu/items-by-category                        │
│  GET /api/menu/items?category=:categoryId               │
│  GET /api/categories                                     │
│  POST /api/admin/menu/items (with category)             │
│  PUT /api/admin/menu/items/:id (with category)          │
│  PUT /api/admin/menu/items/bulk-category                │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                Database (Supabase/PostgreSQL)            │
├─────────────────────────────────────────────────────────┤
│  menu_items table                                        │
│  ├─ id (primary key)                                    │
│  ├─ name                                                 │
│  ├─ price                                                │
│  ├─ description                                          │
│  ├─ category (VARCHAR, NOT NULL, indexed)               │
│  ├─ image                                                │
│  ├─ available (BOOLEAN)                                  │
│  ├─ featured (BOOLEAN)                                   │
│  └─ created_at                                           │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Frontend Components

#### 1. CategorySections Component (New)

**Purpose:** Container component that renders multiple category sections on the homepage.

**Props:**
```typescript
interface CategorySectionsProps {
  categories: Category[];
  itemsByCategory: Record<string, MenuItem[]>;
  onItemClick: (item: MenuItem) => void;
  onAddToCart: (item: MenuItem, quantity: number) => void;
  onViewAllClick: (categoryId: string) => void;
}
```

**Responsibilities:**
- Fetch categories and items grouped by category
- Render CategorySection for each category with items
- Handle loading and error states
- Implement lazy loading for images

#### 2. CategorySection Component (New)

**Purpose:** Displays a single category section with its items.

**Props:**
```typescript
interface CategorySectionProps {
  category: Category;
  items: MenuItem[];
  maxItems?: number; // Default: 6
  onItemClick: (item: MenuItem) => void;
  onAddToCart: (item: MenuItem, quantity: number) => void;
  onViewAllClick: () => void;
}
```

**Responsibilities:**
- Display category title
- Render horizontal scrollable item list
- Show "View All" button if items exceed maxItems
- Handle empty state (hide section)

#### 3. Updated Menu Page

**Changes:**
- Use URL param to filter items by category
- Hide category tabs when in category view
- Show back button + category title
- Strict filtering: `items.filter(item => item.category === categoryId)`

#### 4. Updated Admin Menu Management

**Changes:**
- Add category dropdown to MenuItemForm
- Add category filter to item list
- Add bulk category assignment feature
- Display category badge on each item card

### Backend API Endpoints

#### 1. GET /api/menu/items-by-category

**Purpose:** Fetch all items grouped by category for homepage display.

**Response:**
```json
{
  "success": true,
  "data": {
    "beef_burgers": [
      {
        "id": 1,
        "name": "Classic Beef Burger",
        "price": 85.00,
        "category": "beef_burgers",
        "image": "...",
        "available": true,
        "featured": false
      }
    ],
    "chicken_burgers": [...],
    "drinks": [...],
    "potatoes": [...]
  }
}
```

**Implementation:**
```javascript
// Group items by category
const items = await db.query(`
  SELECT * FROM menu_items 
  WHERE available = true 
  ORDER BY featured DESC, created_at DESC
`);

const grouped = items.reduce((acc, item) => {
  if (!acc[item.category]) acc[item.category] = [];
  acc[item.category].push(item);
  return acc;
}, {});
```

#### 2. GET /api/categories

**Purpose:** Fetch all categories with item counts.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "beef_burgers",
      "name": "Beef Burgers",
      "slug": "beef-burgers",
      "image": "...",
      "itemCount": 12,
      "displayOrder": 1
    }
  ]
}
```

#### 3. PUT /api/admin/menu/items/bulk-category

**Purpose:** Update category for multiple items at once.

**Request:**
```json
{
  "itemIds": [1, 2, 3, 4],
  "category": "beef_burgers"
}
```

**Response:**
```json
{
  "success": true,
  "message": "4 items updated successfully",
  "updatedCount": 4
}
```

## Data Models

### MenuItem Model (Updated)

```typescript
interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string; // Required, indexed
  image: string | null;
  available: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Database Schema Update:**
```sql
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'uncategorized';

CREATE INDEX IF NOT EXISTS idx_menu_items_category 
ON menu_items(category);

CREATE INDEX IF NOT EXISTS idx_menu_items_category_available 
ON menu_items(category, available);
```

### Category Model

```typescript
interface Category {
  id: string; // e.g., "beef_burgers"
  name: string; // e.g., "Beef Burgers"
  slug: string; // e.g., "beef-burgers"
  image: string;
  displayOrder: number;
  active: boolean;
}
```

**Note:** Categories can be hardcoded initially or stored in a separate table for future extensibility.

## Error Handling

### Frontend Error Handling

1. **Category Section Load Failure**
   - Display error message in section
   - Provide retry button
   - Log error to error tracking service

2. **Empty Category**
   - Hide section completely
   - No error message needed

3. **Image Load Failure**
   - Display placeholder image
   - Retry loading on user interaction

### Backend Error Handling

1. **Invalid Category**
   - Return 400 Bad Request
   - Message: "Invalid category identifier"

2. **Database Query Failure**
   - Return 500 Internal Server Error
   - Log error details
   - Return generic error message to client

3. **Bulk Update Partial Failure**
   - Return 207 Multi-Status
   - Include list of successful and failed updates

## Testing Strategy

### Unit Tests

1. **CategorySections Component**
   - Renders correct number of sections
   - Filters items by category correctly
   - Handles empty categories
   - Calls callbacks correctly

2. **CategorySection Component**
   - Displays correct number of items
   - Shows "View All" when needed
   - Handles item clicks
   - Horizontal scroll works

3. **Backend API**
   - Items grouped correctly by category
   - Filtering works with category param
   - Bulk update validates input
   - Error handling works

### Integration Tests

1. **Homepage Category Flow**
   - Load homepage → See category sections
   - Click category card → Navigate to category page
   - See only items from that category
   - Click back → Return to homepage

2. **Admin Category Management**
   - Create item with category → Item appears in category
   - Update item category → Item moves to new category
   - Bulk update → Multiple items update correctly

### E2E Tests

1. **Customer Journey**
   - Browse homepage category sections
   - Click "View All" → See full category
   - Add item to cart from category section
   - Navigate between categories

2. **Admin Journey**
   - Create new item with category
   - Verify item appears in correct section
   - Change item category
   - Verify item moved to new section

## Performance Considerations

### Frontend Optimization

1. **Lazy Loading**
   - Load images only when section is in viewport
   - Use Intersection Observer API
   - Implement progressive image loading

2. **Data Caching**
   - Cache category data for 5 minutes
   - Cache item data per category
   - Invalidate cache on item updates

3. **Virtual Scrolling**
   - For categories with many items
   - Render only visible items
   - Improve scroll performance

### Backend Optimization

1. **Database Indexing**
   - Index on `category` column
   - Composite index on `(category, available)`
   - Index on `(category, featured, created_at)`

2. **Query Optimization**
   - Single query to fetch all items
   - Group in application layer
   - Use database views for complex queries

3. **Caching Strategy**
   - Cache items-by-category response
   - TTL: 5 minutes
   - Invalidate on item create/update/delete

## Security Considerations

1. **Admin Authorization**
   - Verify admin role for category management
   - Validate category values against whitelist
   - Sanitize bulk update input

2. **Input Validation**
   - Validate category exists before assignment
   - Prevent SQL injection in category filters
   - Validate item IDs in bulk operations

3. **Rate Limiting**
   - Limit bulk update operations
   - Prevent abuse of category endpoints
   - Monitor for suspicious patterns

## Migration Strategy

### Phase 1: Database Update
1. Add `category` column to `menu_items` table
2. Set default category for existing items
3. Create indexes

### Phase 2: Backend API
1. Update item endpoints to include category
2. Create items-by-category endpoint
3. Add bulk category update endpoint

### Phase 3: Admin Interface
1. Add category dropdown to item form
2. Add category filter to item list
3. Implement bulk category assignment

### Phase 4: Frontend Display
1. Create CategorySections component
2. Create CategorySection component
3. Update HomePage to use new components
4. Update Menu page for category filtering

### Phase 5: Testing & Deployment
1. Run all tests
2. Deploy to staging
3. Verify functionality
4. Deploy to production
5. Monitor for issues

## Rollback Plan

If issues arise:
1. Revert frontend changes (hide CategorySections)
2. Keep backend changes (backward compatible)
3. Database changes are additive (no rollback needed)
4. Monitor error rates and user feedback
5. Fix issues and redeploy

## Future Enhancements

1. **Dynamic Categories**
   - Admin can create/edit/delete categories
   - Category images and descriptions
   - Category ordering and visibility

2. **Category Analytics**
   - Track category view counts
   - Monitor item performance per category
   - A/B test category layouts

3. **Personalized Categories**
   - Show categories based on user preferences
   - Reorder categories by user behavior
   - Hide categories user never visits

4. **Category Promotions**
   - Feature specific categories
   - Category-specific discounts
   - Seasonal category highlighting
