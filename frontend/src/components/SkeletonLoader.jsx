import './SkeletonLoader.css';

/**
 * SkeletonLoader Component
 * Displays loading placeholders for content
 */

/**
 * Generic skeleton element
 */
export const Skeleton = ({ width, height, className = '' }) => (
  <div 
    className={`skeleton ${className}`}
    style={{ width, height }}
  />
);

/**
 * Skeleton for menu item cards
 */
export const MenuItemSkeleton = () => (
  <div className="menu-item-skeleton">
    <Skeleton className="skeleton-image" height="200px" />
    <div className="skeleton-content">
      <Skeleton width="70%" height="24px" className="skeleton-title" />
      <Skeleton width="100%" height="16px" className="skeleton-text" />
      <Skeleton width="90%" height="16px" className="skeleton-text" />
      <div className="skeleton-footer">
        <Skeleton width="60px" height="24px" />
        <Skeleton width="100px" height="40px" className="skeleton-button" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton for order cards in admin panel
 */
export const OrderCardSkeleton = () => (
  <div className="order-card-skeleton">
    <div className="skeleton-header">
      <Skeleton width="120px" height="20px" />
      <Skeleton width="80px" height="24px" />
    </div>
    <Skeleton width="150px" height="16px" className="skeleton-text" />
    <Skeleton width="100%" height="16px" className="skeleton-text" />
    <Skeleton width="80%" height="16px" className="skeleton-text" />
  </div>
);

/**
 * Skeleton for table rows
 */
export const TableRowSkeleton = ({ columns = 4 }) => (
  <tr className="table-row-skeleton">
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index}>
        <Skeleton width="90%" height="16px" />
      </td>
    ))}
  </tr>
);

/**
 * Grid of menu item skeletons
 */
export const MenuGridSkeleton = ({ count = 8 }) => (
  <div className="menu-grid">
    {Array.from({ length: count }).map((_, index) => (
      <MenuItemSkeleton key={index} />
    ))}
  </div>
);

/**
 * List of order card skeletons
 */
export const OrderListSkeleton = ({ count = 5 }) => (
  <div className="order-list-skeleton">
    {Array.from({ length: count }).map((_, index) => (
      <OrderCardSkeleton key={index} />
    ))}
  </div>
);

/**
 * Skeleton for category cards
 */
export const CategoryCardSkeleton = () => (
  <div className="category-card-skeleton">
    <Skeleton className="skeleton-category-icon" width="60px" height="60px" />
    <Skeleton width="70px" height="12px" className="skeleton-category-name" />
  </div>
);

/**
 * Horizontal scroll of category card skeletons
 */
export const CategoryGridSkeleton = ({ count = 8 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="category-grid-item">
        <CategoryCardSkeleton />
      </div>
    ))}
  </>
);

/**
 * Skeleton for featured item cards
 */
export const FeaturedItemSkeleton = () => (
  <div className="featured-item-skeleton">
    <Skeleton className="skeleton-featured-image" height="150px" />
    <div className="skeleton-featured-content">
      <Skeleton width="90%" height="16px" className="skeleton-featured-name" />
      <Skeleton width="50%" height="18px" className="skeleton-featured-price" />
      <Skeleton width="100%" height="36px" className="skeleton-featured-button" />
    </div>
  </div>
);

/**
 * Grid of featured item skeletons
 */
export const FeaturedItemsGridSkeleton = ({ count = 4 }) => (
  <div className="featured-items-grid-skeleton">
    {Array.from({ length: count }).map((_, index) => (
      <FeaturedItemSkeleton key={index} />
    ))}
  </div>
);

export default Skeleton;
