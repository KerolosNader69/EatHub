# Implementation Plan

- [ ] 1. Database schema updates and migrations
- [ ] 1.1 Add category column to menu_items table with NOT NULL constraint and default value
  - Write SQL migration to add `category VARCHAR(100) NOT NULL DEFAULT 'uncategorized'`
  - Create index on category column for query performance
  - Create composite index on (category, available) for filtered queries
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 1.2 Update existing menu items with proper category assignments
  - Write script to assign categories to existing items based on their names or descriptions
  - Verify all items have valid category values
  - Test migration on development database
  - _Requirements: 1.1, 10.1_

- [ ] 2. Backend API endpoints for category-based item fetching
- [ ] 2.1 Create GET /api/menu/items-by-category endpoint
  - Implement controller to fetch all available items
  - Group items by category in the response
  - Sort items by featured status and creation date
  - Add response caching (5 minute TTL)
  - _Requirements: 2.1, 2.2, 12.1, 12.4_

- [ ] 2.2 Update GET /api/menu/items endpoint to support category filtering
  - Add optional category query parameter
  - Filter items where item.category === categoryParam when provided
  - Maintain backward compatibility (return all items if no category specified)
  - _Requirements: 2.5, 3.2_

- [ ] 2.3 Create GET /api/categories endpoint
  - Return list of all categories with metadata
  - Include item count for each category
  - Filter out categories with zero available items
  - _Requirements: 2.4, 8.1, 8.2_

- [ ] 3. Admin backend endpoints for category management
- [ ] 3.1 Update POST /api/admin/menu/items to require category
  - Add category validation in request body
  - Return 400 error if category is missing or invalid
  - Save item with assigned category
  - _Requirements: 4.1, 4.4, 10.3_

- [ ] 3.2 Update PUT /api/admin/menu/items/:id to allow category changes
  - Accept category in request body
  - Validate new category value
  - Update item's category assignment
  - Invalidate relevant caches
  - _Requirements: 4.2, 4.5_

- [ ] 3.3 Create PUT /api/admin/menu/items/bulk-category endpoint
  - Accept array of item IDs and target category
  - Validate all item IDs exist
  - Update category for all specified items in a transaction
  - Return count of updated items
  - _Requirements: 9.1, 9.2, 9.4_

- [ ] 4. Frontend CategorySection component
- [ ] 4.1 Create CategorySection component with horizontal scroll
  - Accept category and items as props
  - Render category title with proper formatting
  - Display items in horizontal scrollable container
  - Implement touch-friendly scrolling for mobile
  - _Requirements: 2.1, 2.2, 7.1, 7.2, 11.1_

- [ ] 4.2 Add "View All" button to CategorySection
  - Show button only when items.length > maxItems (default 6)
  - Navigate to /menu/:category on click
  - Style button to match design system
  - _Requirements: 6.2, 6.3_

- [ ] 4.3 Implement item limiting and prioritization in CategorySection
  - Limit displayed items to maxItems prop (default 6)
  - Sort items: featured first, then by creation date
  - Render items using existing MenuListCard component
  - _Requirements: 6.1, 6.4, 6.5_

- [ ] 4.4 Add empty state handling to CategorySection
  - Return null if items array is empty
  - Hide section completely when no items available
  - _Requirements: 8.1, 8.2_

- [ ] 5. Frontend CategorySections container component
- [ ] 5.1 Create CategorySections component to manage multiple sections
  - Fetch items-by-category data from API
  - Fetch categories list from API
  - Handle loading state with skeleton loaders
  - Handle error state with retry button
  - _Requirements: 2.1, 2.3, 12.5_

- [ ] 5.2 Render CategorySection for each category with items
  - Loop through categories
  - Pass filtered items to each CategorySection
  - Skip categories with no items
  - Maintain category display order
  - _Requirements: 2.2, 2.4, 2.5, 8.1_

- [ ] 5.3 Implement lazy loading for category section images
  - Use Intersection Observer to detect visible sections
  - Load images only when section enters viewport
  - Show placeholder while loading
  - _Requirements: 12.2, 12.3_

- [ ] 6. Update HomePage to include CategorySections
- [ ] 6.1 Integrate CategorySections component into HomePage
  - Add CategorySections after CategoryGrid and before FeaturedItems
  - Pass necessary callbacks (onItemClick, onAddToCart)
  - Wrap in ErrorBoundary for fault tolerance
  - _Requirements: 2.1, 2.3_

- [ ] 6.2 Add section heading for category sections
  - Display "Browse by Category" or similar heading
  - Style heading to match homepage design
  - Make heading accessible with proper ARIA labels
  - _Requirements: 2.3, 11.5_

- [ ] 7. Update Menu page for category-specific filtering
- [ ] 7.1 Update Menu component to use category URL parameter
  - Read category from useParams()
  - Filter items where item.category === category when param exists
  - Show all items when no category param
  - _Requirements: 3.2, 3.3_

- [ ] 7.2 Add back button and category title to Menu page
  - Show back button when viewing specific category
  - Display category name as page title
  - Navigate to /menu on back button click
  - _Requirements: 3.3, 3.4_

- [ ] 7.3 Hide category tabs when viewing specific category
  - Conditionally render category tabs only on main menu page
  - Hide tabs when category URL param is present
  - _Requirements: 3.5_

- [ ] 8. Admin dashboard category dropdown
- [ ] 8.1 Add category dropdown to MenuItemForm component
  - Fetch categories list from API
  - Render dropdown with all available categories
  - Set as required field with validation
  - Pre-select current category when editing
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 8.2 Add category validation to form submission
  - Validate category is selected before submission
  - Display error message if category is missing
  - Prevent form submission without category
  - _Requirements: 4.4_

- [ ] 9. Admin dashboard category filtering
- [ ] 9.1 Add category filter dropdown to AdminMenuManagement
  - Display dropdown above items list
  - Fetch and display all categories
  - Include "All Categories" option
  - _Requirements: 5.2_

- [ ] 9.2 Implement category filtering in items list
  - Filter displayed items based on selected category
  - Update URL with category filter parameter
  - Maintain filter state on page refresh
  - _Requirements: 5.2, 5.3_

- [ ] 9.3 Display category badge on each item card
  - Show category name as a badge on item cards
  - Style badge with category-specific colors
  - Make badge clickable to filter by that category
  - _Requirements: 5.1, 5.4_

- [ ] 10. Admin bulk category assignment
- [ ] 10.1 Add checkbox selection to admin items list
  - Add checkbox to each item card
  - Implement "Select All" checkbox
  - Track selected item IDs in state
  - _Requirements: 9.1_

- [ ] 10.2 Create bulk actions toolbar
  - Show toolbar when items are selected
  - Display count of selected items
  - Add "Change Category" button
  - Add "Cancel Selection" button
  - _Requirements: 9.1, 9.2_

- [ ] 10.3 Implement bulk category change modal
  - Show modal when "Change Category" is clicked
  - Display category dropdown
  - Show confirmation message with item count
  - Call bulk-category API endpoint on confirm
  - _Requirements: 9.2, 9.3, 9.4_

- [ ] 11. Styling and responsive design
- [ ] 11.1 Style CategorySection for mobile devices
  - Implement horizontal scroll with touch support
  - Use CSS scroll-snap for smooth scrolling
  - Ensure 44px minimum touch targets
  - Test on various mobile devices
  - _Requirements: 7.3, 7.4, 11.1, 11.2, 11.3_

- [ ] 11.2 Style CategorySection for desktop
  - Add scroll arrows for easier navigation
  - Implement hover states for items
  - Optimize spacing and layout
  - _Requirements: 7.5, 11.5_

- [ ] 11.3 Create responsive layout for category sections
  - Display 1-2 items on mobile
  - Display 3-4 items on tablet
  - Display 4-6 items on desktop
  - Maintain consistent spacing
  - _Requirements: 11.4, 11.5_

- [ ] 12. Testing and validation
- [ ]* 12.1 Write unit tests for CategorySection component
  - Test rendering with different item counts
  - Test "View All" button visibility
  - Test empty state handling
  - Test item click callbacks
  - _Requirements: All_

- [ ]* 12.2 Write unit tests for CategorySections component
  - Test data fetching and grouping
  - Test loading and error states
  - Test category filtering logic
  - _Requirements: All_

- [ ]* 12.3 Write integration tests for category API endpoints
  - Test items-by-category grouping
  - Test category filtering
  - Test bulk category update
  - _Requirements: All_

- [ ]* 12.4 Write E2E tests for category navigation flow
  - Test homepage category sections display
  - Test clicking category card navigation
  - Test category page filtering
  - Test back button navigation
  - _Requirements: All_

- [ ]* 12.5 Write E2E tests for admin category management
  - Test creating item with category
  - Test updating item category
  - Test bulk category assignment
  - Test category filtering in admin
  - _Requirements: All_

- [ ] 13. Performance optimization and caching
- [ ] 13.1 Implement API response caching
  - Cache items-by-category response (5 min TTL)
  - Cache categories list (5 min TTL)
  - Invalidate cache on item updates
  - _Requirements: 12.4_

- [ ] 13.2 Implement frontend data caching
  - Use React Query or similar for data caching
  - Cache category data in memory
  - Implement stale-while-revalidate strategy
  - _Requirements: 12.4_

- [ ] 13.3 Optimize database queries
  - Verify indexes are being used
  - Analyze query performance
  - Optimize grouping logic if needed
  - _Requirements: 12.1, 12.2_

- [ ] 14. Documentation and deployment
- [ ] 14.1 Update API documentation
  - Document new endpoints
  - Add request/response examples
  - Update Postman collection
  - _Requirements: All_

- [ ] 14.2 Create admin user guide
  - Document how to assign categories
  - Explain bulk category assignment
  - Add screenshots and examples
  - _Requirements: 4.1, 4.2, 9.1_

- [ ] 14.3 Deploy database migrations
  - Run migrations on staging
  - Verify data integrity
  - Run migrations on production
  - _Requirements: 1.1, 1.2_

- [ ] 14.4 Deploy backend changes
  - Deploy API updates to staging
  - Test all endpoints
  - Deploy to production
  - Monitor for errors
  - _Requirements: All backend tasks_

- [ ] 14.5 Deploy frontend changes
  - Build and deploy frontend to staging
  - Test all user flows
  - Deploy to production
  - Monitor performance metrics
  - _Requirements: All frontend tasks_
