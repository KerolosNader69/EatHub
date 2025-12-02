const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const monitor = require('./utils/monitoring');
const requestLogger = require('./middleware/requestLogger');
const errorLogger = require('./middleware/errorLogger');

// Load environment variables
dotenv.config();

// Log application startup
logger.info('Starting Eat Hub API server', {
  environment: process.env.NODE_ENV || 'development',
  nodeVersion: process.version
});

// Initialize Express app
const app = express();

// Connect to MongoDB (async, will handle errors in routes)
connectDB().catch(err => {
  logger.error('Failed to connect to MongoDB', { error: err.message });
});

// Middleware
// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser middleware for JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Eat Hub API' });
});

// Monitoring routes
const monitoringRoutes = require('./routes/monitoring');
app.use('/api/monitoring', monitoringRoutes);

// Legacy health check endpoint (redirect to new endpoint)
app.get('/api/health', (req, res) => {
  res.redirect('/api/monitoring/health');
});

// Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Menu routes
const menuRoutes = require('./routes/menu');
app.use('/api/menu', menuRoutes);

// Order routes
const orderRoutes = require('./routes/orders');
app.use('/api/orders', orderRoutes);

// Track requests for monitoring
app.use((req, res, next) => {
  monitor.trackRequest();
  next();
});

// Error logging middleware
app.use(errorLogger);

// Error handling middleware
app.use((err, req, res, next) => {
  monitor.trackError();
  
  // Log error
  logger.error('Request error', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    status: err.status
  });

  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'SERVER_ERROR'
    }
  });
});

// For Vercel serverless deployment, just export the app
// For local development, start the server
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`, {
      port: PORT,
      environment: process.env.NODE_ENV || 'development'
    });
    
    // Start periodic metrics logging (every 15 minutes)
    monitor.startMetricsLogging(15);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });
}

module.exports = app;
