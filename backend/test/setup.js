// Test setup file
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRE = '24h';

// Increase timeout for database operations
jest.setTimeout(10000);
