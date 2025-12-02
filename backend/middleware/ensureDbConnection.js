const connectDB = require('../config/db');
const logger = require('../utils/logger');

/**
 * Middleware to ensure database connection before handling requests
 * Important for serverless environments where connection might not persist
 */
const ensureDbConnection = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    logger.error('Database connection failed in middleware', { error: error.message });
    res.status(503).json({
      success: false,
      error: {
        message: 'Database connection unavailable',
        code: 'DB_CONNECTION_ERROR'
      }
    });
  }
};

module.exports = ensureDbConnection;
