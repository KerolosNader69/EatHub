const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const MenuItem = require('../../models/MenuItem');
const Order = require('../../models/Order');
const Admin = require('../../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('API Integration Tests', () => {
  let adminToken;
  let testMenuItemId;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URL || global.__MONGO_URI__, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear all collections
    await MenuItem.deleteMany({});
    await Order.deleteMany({});
    await Admin.deleteMany({});

    // Create test admin
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const admin = await Admin.create({
      username: 'testadmin',
      password: hashedPassword,
      email: 'test@example.com'
    });

    // Generate admin token
    adminToken = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Create test menu items
    const menuItem = await MenuItem.create({
      name: 'Test Pizza',
      description: 'Delicious test pizza',
      price: 12.99,
      category: 'main_courses',
      image: '/images/test.jpg',
      ingredients: ['Cheese', 'Tomato'],
      portionSize: '12 inch',
      available: true
    });
    testMenuItemId = menuItem._id.toString();
  });

  describe('Menu API Endpoints', () => {
    it('GET /api/menu - should return all available menu items', async () => {
      const response = await request(app)
        .get('/api/menu')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Test Pizza');
    });

    it('GET /api/menu/:id - should return single menu item', async () => {
      const response = await request(app)
        .get(`/api/menu/${testMenuItemId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Pizza');
      expect(response.body.data.price).toBe(12.99);
    });

    it('GET /api/menu/:id - should return 404 for invalid ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/menu/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('POST /api/menu - should create new menu item with auth', async () => {
      const newItem = {
        name: 'New Burger',
        description: 'Tasty burger',
        price: 10.99,
        category: 'main_courses',
        ingredients: ['Beef', 'Lettuce'],
        portionSize: 'Regular'
      };

      const response = await request(app)
        .post('/api/menu')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newItem)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Burger');
      expect(response.body.data.price).toBe(10.99);

      // Verify in database
      const dbItem = await MenuItem.findById(response.body.data._id);
      expect(dbItem).toBeTruthy();
      expect(dbItem.name).toBe('New Burger');
    });

    it('POST /api/menu - should reject without auth token', async () => {
      const newItem = {
        name: 'New Burger',
        description: 'Tasty burger',
        price: 10.99,
        category: 'main_courses'
      };

      await request(app)
        .post('/api/menu')
        .send(newItem)
        .expect(401);
    });

    it('PUT /api/menu/:id - should update menu item with auth', async () => {
      const updates = {
        price: 15.99,
        available: false
      };

      const response = await request(app)
        .put(`/api/menu/${testMenuItemId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.price).toBe(15.99);
      expect(response.body.data.available).toBe(false);

      // Verify in database
      const dbItem = await MenuItem.findById(testMenuItemId);
      expect(dbItem.price).toBe(15.99);
      expect(dbItem.available).toBe(false);
    });

    it('DELETE /api/menu/:id - should delete menu item with auth', async () => {
      const response = await request(app)
        .delete(`/api/menu/${testMenuItemId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deleted from database
      const dbItem = await MenuItem.findById(testMenuItemId);
      expect(dbItem).toBeNull();
    });
  });

  describe('Order API Endpoints', () => {
    it('POST /api/orders - should create new order', async () => {
      const orderData = {
        items: [
          { itemId: testMenuItemId, quantity: 2 }
        ],
        customerInfo: {
          name: 'John Doe',
          phone: '1234567890',
          address: '123 Main St'
        },
        specialInstructions: 'No onions'
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderNumber).toMatch(/^EH/);
      expect(response.body.data.order.items).toHaveLength(1);
      expect(response.body.data.order.items[0].quantity).toBe(2);
      expect(response.body.data.order.totalAmount).toBe(25.98);
      expect(response.body.data.order.customerInfo.name).toBe('John Doe');

      // Verify in database
      const dbOrder = await Order.findOne({ orderNumber: response.body.data.orderNumber });
      expect(dbOrder).toBeTruthy();
      expect(dbOrder.status).toBe('received');
    });

    it('POST /api/orders - should validate required fields', async () => {
      const invalidOrder = {
        items: [{ itemId: testMenuItemId, quantity: 1 }],
        customerInfo: {
          name: 'John Doe'
          // Missing phone and address
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('POST /api/orders - should validate phone number format', async () => {
      const orderData = {
        items: [{ itemId: testMenuItemId, quantity: 1 }],
        customerInfo: {
          name: 'John Doe',
          phone: '123', // Too short
          address: '123 Main St'
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('GET /api/orders/:orderNumber - should retrieve order by order number', async () => {
      // Create order first
      const order = await Order.create({
        orderNumber: 'EH1234567890',
        items: [{
          menuItem: testMenuItemId,
          name: 'Test Pizza',
          price: 12.99,
          quantity: 1
        }],
        customerInfo: {
          name: 'John Doe',
          phone: '1234567890',
          address: '123 Main St'
        },
        totalAmount: 12.99,
        status: 'received',
        estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000)
      });

      const response = await request(app)
        .get(`/api/orders/${order.orderNumber}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderNumber).toBe('EH1234567890');
      expect(response.body.data.status).toBe('received');
    });

    it('GET /api/orders - should return all orders for admin', async () => {
      // Create multiple orders
      await Order.create([
        {
          orderNumber: 'EH1111111111',
          items: [{ menuItem: testMenuItemId, name: 'Test Pizza', price: 12.99, quantity: 1 }],
          customerInfo: { name: 'John', phone: '1234567890', address: '123 St' },
          totalAmount: 12.99,
          status: 'received',
          estimatedDelivery: new Date()
        },
        {
          orderNumber: 'EH2222222222',
          items: [{ menuItem: testMenuItemId, name: 'Test Pizza', price: 12.99, quantity: 2 }],
          customerInfo: { name: 'Jane', phone: '0987654321', address: '456 Ave' },
          totalAmount: 25.98,
          status: 'preparing',
          estimatedDelivery: new Date()
        }
      ]);

      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('GET /api/orders - should filter orders by status', async () => {
      // Create orders with different statuses
      await Order.create([
        {
          orderNumber: 'EH1111111111',
          items: [{ menuItem: testMenuItemId, name: 'Test Pizza', price: 12.99, quantity: 1 }],
          customerInfo: { name: 'John', phone: '1234567890', address: '123 St' },
          totalAmount: 12.99,
          status: 'received',
          estimatedDelivery: new Date()
        },
        {
          orderNumber: 'EH2222222222',
          items: [{ menuItem: testMenuItemId, name: 'Test Pizza', price: 12.99, quantity: 1 }],
          customerInfo: { name: 'Jane', phone: '0987654321', address: '456 Ave' },
          totalAmount: 12.99,
          status: 'delivered',
          estimatedDelivery: new Date()
        }
      ]);

      const response = await request(app)
        .get('/api/orders?status=received')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('received');
    });

    it('PUT /api/orders/:orderNumber/status - should update order status', async () => {
      const order = await Order.create({
        orderNumber: 'EH1234567890',
        items: [{ menuItem: testMenuItemId, name: 'Test Pizza', price: 12.99, quantity: 1 }],
        customerInfo: { name: 'John', phone: '1234567890', address: '123 St' },
        totalAmount: 12.99,
        status: 'received',
        estimatedDelivery: new Date()
      });

      const response = await request(app)
        .put(`/api/orders/${order.orderNumber}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'preparing' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('preparing');

      // Verify in database
      const dbOrder = await Order.findOne({ orderNumber: order.orderNumber });
      expect(dbOrder.status).toBe('preparing');
    });

    it('PUT /api/orders/:orderNumber/status - should validate status values', async () => {
      const order = await Order.create({
        orderNumber: 'EH1234567890',
        items: [{ menuItem: testMenuItemId, name: 'Test Pizza', price: 12.99, quantity: 1 }],
        customerInfo: { name: 'John', phone: '1234567890', address: '123 St' },
        totalAmount: 12.99,
        status: 'received',
        estimatedDelivery: new Date()
      });

      const response = await request(app)
        .put(`/api/orders/${order.orderNumber}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Auth API Endpoints', () => {
    it('POST /api/auth/login - should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testadmin',
          password: 'testpassword'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeTruthy();
      expect(response.body.admin.username).toBe('testadmin');
    });

    it('POST /api/auth/login - should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testadmin',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('POST /api/auth/verify - should verify valid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.admin.username).toBe('testadmin');
    });

    it('POST /api/auth/verify - should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Complete Order Flow', () => {
    it('should handle complete order lifecycle', async () => {
      // Step 1: Customer browses menu
      const menuResponse = await request(app)
        .get('/api/menu')
        .expect(200);

      expect(menuResponse.body.data).toHaveLength(1);
      const menuItem = menuResponse.body.data[0];

      // Step 2: Customer creates order
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          items: [{ itemId: menuItem._id, quantity: 2 }],
          customerInfo: {
            name: 'John Doe',
            phone: '1234567890',
            address: '123 Main St'
          }
        })
        .expect(201);

      const orderNumber = orderResponse.body.data.orderNumber;
      expect(orderNumber).toBeTruthy();

      // Step 3: Customer checks order status
      const statusResponse = await request(app)
        .get(`/api/orders/${orderNumber}`)
        .expect(200);

      expect(statusResponse.body.data.status).toBe('received');

      // Step 4: Admin views orders
      const adminOrdersResponse = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(adminOrdersResponse.body.data).toHaveLength(1);

      // Step 5: Admin updates order status to preparing
      await request(app)
        .put(`/api/orders/${orderNumber}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'preparing' })
        .expect(200);

      // Step 6: Admin updates to out for delivery
      await request(app)
        .put(`/api/orders/${orderNumber}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'out_for_delivery' })
        .expect(200);

      // Step 7: Admin marks as delivered
      const finalResponse = await request(app)
        .put(`/api/orders/${orderNumber}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'delivered' })
        .expect(200);

      expect(finalResponse.body.data.status).toBe('delivered');

      // Verify final state in database
      const finalOrder = await Order.findOne({ orderNumber });
      expect(finalOrder.status).toBe('delivered');
    });
  });
});
