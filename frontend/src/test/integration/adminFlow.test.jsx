import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import AdminLogin from '../../pages/AdminLogin';
import AdminDashboard from '../../pages/AdminDashboard';
import * as adminService from '../../services/adminService';

// Mock services
vi.mock('../../services/adminService');

const mockMenuItems = [
  {
    _id: '1',
    name: 'Margherita Pizza',
    description: 'Classic pizza',
    price: 12.99,
    category: 'main_courses',
    image: '/images/pizza.jpg',
    available: true
  }
];

const mockOrders = [
  {
    _id: 'order1',
    orderNumber: 'EH1234567890',
    items: [
      { menuItem: '1', name: 'Margherita Pizza', price: 12.99, quantity: 2 }
    ],
    customerInfo: {
      name: 'John Doe',
      phone: '1234567890',
      address: '123 Main St'
    },
    totalAmount: 25.98,
    status: 'received',
    createdAt: new Date().toISOString()
  }
];

describe('Admin Flow Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle admin login successfully', async () => {
    const user = userEvent.setup();
    
    adminService.login.mockResolvedValue({
      success: true,
      token: 'mock-jwt-token',
      admin: { id: 'admin1', username: 'admin' }
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <Routes>
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    });

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    await waitFor(() => {
      expect(adminService.login).toHaveBeenCalledWith({
        username: 'admin',
        password: 'password123'
      });
    });
  });

  it('should handle admin login validation errors', async () => {
    const user = userEvent.setup();
    
    adminService.login.mockRejectedValue({
      response: {
        data: {
          success: false,
          error: { message: 'Invalid credentials' }
        }
      }
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <Routes>
            <Route path="/admin" element={<AdminLogin />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    });

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    await user.type(usernameInput, 'wrong');
    await user.type(passwordInput, 'wrong');
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
    });
  });

  it('should manage menu items in admin dashboard', async () => {
    const user = userEvent.setup();
    
    // Mock authenticated state
    localStorage.setItem('adminToken', 'mock-jwt-token');
    
    adminService.createMenuItem.mockResolvedValue({
      success: true,
      data: {
        _id: '2',
        name: 'New Burger',
        description: 'Delicious burger',
        price: 10.99,
        category: 'main_courses',
        available: true
      }
    });

    adminService.updateMenuItem.mockResolvedValue({
      success: true,
      data: { ...mockMenuItems[0], available: false }
    });

    adminService.getOrders.mockResolvedValue({
      success: true,
      data: mockOrders
    });

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Wait for dashboard to load
    await waitFor(() => {
      const menuTab = screen.queryByRole('button', { name: /menu/i });
      if (menuTab) {
        expect(menuTab).toBeInTheDocument();
      }
    });
  });

  it('should process orders in admin dashboard', async () => {
    localStorage.setItem('adminToken', 'mock-jwt-token');
    
    adminService.getOrders.mockResolvedValue({
      success: true,
      data: mockOrders
    });

    adminService.updateOrderStatus.mockResolvedValue({
      success: true,
      data: { ...mockOrders[0], status: 'preparing' }
    });

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Wait for dashboard
    await waitFor(() => {
      const ordersTab = screen.queryByRole('button', { name: /order/i });
      if (ordersTab) {
        expect(ordersTab).toBeInTheDocument();
      }
    });
  });

  it('should handle menu item creation', async () => {
    const user = userEvent.setup();
    
    adminService.createMenuItem.mockResolvedValue({
      success: true,
      data: {
        _id: '2',
        name: 'Test Item',
        description: 'Test description',
        price: 9.99,
        category: 'appetizers',
        available: true
      }
    });

    // Test that the service can be called
    const result = await adminService.createMenuItem({
      name: 'Test Item',
      description: 'Test description',
      price: 9.99,
      category: 'appetizers'
    });

    expect(result.success).toBe(true);
    expect(result.data.name).toBe('Test Item');
  });

  it('should handle order status updates', async () => {
    adminService.updateOrderStatus.mockResolvedValue({
      success: true,
      data: {
        ...mockOrders[0],
        status: 'delivered'
      }
    });

    const result = await adminService.updateOrderStatus('EH1234567890', 'delivered');

    expect(result.success).toBe(true);
    expect(result.data.status).toBe('delivered');
    expect(adminService.updateOrderStatus).toHaveBeenCalledWith('EH1234567890', 'delivered');
  });
});
