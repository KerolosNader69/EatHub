import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';
import { OrderListSkeleton } from './SkeletonLoader';
import './AdminOrderManagement.css';

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  const fetchOrders = useCallback(async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setLoading(true);
      }
      setError('');
      const filterParam = statusFilter !== 'all' ? statusFilter : null;
      const fetchedOrders = await adminService.getOrders(filterParam);
      
      // Transform orders to match expected format
      const transformedOrders = fetchedOrders.map(order => ({
        ...order,
        orderNumber: order.order_number,
        customerInfo: {
          name: order.customer_name,
          phone: order.customer_phone,
          address: order.customer_address
        },
        items: order.order_items || [],
        totalAmount: parseFloat(order.total_amount),
        specialInstructions: order.special_instructions,
        createdAt: order.created_at,
        estimatedDelivery: order.estimated_delivery
      }));
      
      setOrders(transformedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh every 30 seconds (without loading state)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(false); // Don't show loading state for auto-refresh
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleRefresh = async () => {
    await fetchOrders(false); // Refresh without full loading state
  };

  const handleStatusChange = async (orderNumber, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderNumber, newStatus);
      
      // Update local state immediately
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.orderNumber === orderNumber
            ? { ...order, status: newStatus }
            : order
        )
      );
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
      // Refresh to get correct state
      fetchOrders(false);
    }
  };

  const toggleOrderExpansion = (orderNumber) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderNumber)) {
        newSet.delete(orderNumber);
      } else {
        newSet.add(orderNumber);
      }
      return newSet;
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      received: 'Received',
      preparing: 'Preparing',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    const classes = {
      received: 'status-received',
      preparing: 'status-preparing',
      out_for_delivery: 'status-delivery',
      delivered: 'status-delivered'
    };
    return classes[status] || '';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="admin-order-management">
        <div className="orders-header">
          <h2>Order Management</h2>
        </div>
        <OrderListSkeleton count={5} />
      </div>
    );
  }

  return (
    <div className="admin-order-management">
      <div className="orders-header">
        <h2>Order Management</h2>
        <button onClick={handleRefresh} className="btn-refresh" title="Refresh orders">
          ↻ Refresh
        </button>
      </div>

      {error && (
        <ErrorMessage 
          message={error}
          type="error"
          onDismiss={() => setError('')}
        />
      )}

      <div className="filter-bar">
        <label htmlFor="status-filter">Filter by status:</label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter-select"
        >
          <option value="all">All Orders</option>
          <option value="received">Received</option>
          <option value="preparing">Preparing</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="empty-state">
            <p>No orders found{statusFilter !== 'all' ? ' with this status' : ''}.</p>
          </div>
        ) : (
          orders.map(order => {
            const isExpanded = expandedOrders.has(order.orderNumber);
            
            return (
              <div key={order.orderNumber} className="order-card">
                <div className="order-summary">
                  <div className="order-info">
                    <div className="order-number">
                      Order #{order.orderNumber}
                    </div>
                    <div className="order-meta">
                      <span className="customer-name">{order.customerInfo.name}</span>
                      <span className="order-time">{formatTime(order.createdAt)}</span>
                      <span className="order-date">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="order-items-summary">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''} • {order.totalAmount.toFixed(2)} EGP
                    </div>
                  </div>

                  <div className="order-actions">
                    <div className="status-selector">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.orderNumber, e.target.value)}
                        className={`status-select ${getStatusClass(order.status)}`}
                      >
                        <option value="received">Received</option>
                        <option value="preparing">Preparing</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>

                    <button
                      onClick={() => toggleOrderExpansion(order.orderNumber)}
                      className="btn-expand"
                      aria-label={isExpanded ? 'Collapse order details' : 'Expand order details'}
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="order-details">
                    <div className="details-section">
                      <h4>Items</h4>
                      <div className="items-list">
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            <span className="item-name">
                              {item.name} × {item.quantity}
                            </span>
                            <span className="item-price">
                              {(item.price * item.quantity).toFixed(2)} EGP
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="order-total">
                        <span>Total:</span>
                        <span className="total-amount">{order.totalAmount.toFixed(2)} EGP</span>
                      </div>
                    </div>

                    <div className="details-section">
                      <h4>Customer Information</h4>
                      <div className="customer-details">
                        <div className="detail-row">
                          <span className="detail-label">Name:</span>
                          <span>{order.customerInfo.name}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Phone:</span>
                          <span>{order.customerInfo.phone}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Address:</span>
                          <span>{order.customerInfo.address}</span>
                        </div>
                      </div>
                    </div>

                    {order.specialInstructions && (
                      <div className="details-section">
                        <h4>Special Instructions</h4>
                        <p className="special-instructions">{order.specialInstructions}</p>
                      </div>
                    )}

                    <div className="details-section">
                      <h4>Order Timeline</h4>
                      <div className="timeline">
                        <div className="timeline-item">
                          <span className="timeline-label">Placed:</span>
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                        {order.estimatedDelivery && (
                          <div className="timeline-item">
                            <span className="timeline-label">Est. Delivery:</span>
                            <span>{formatDate(order.estimatedDelivery)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminOrderManagement;
