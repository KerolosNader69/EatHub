const { verifyToken } = require('../utils/jwt');
const Admin = require('../models/Admin');

/**
 * Middleware to verify JWT token and authenticate admin users
 * Expects token in Authorization header as "Bearer <token>"
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'No token provided. Authorization required.',
          code: 'NO_TOKEN'
        }
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyToken(token);

    // Find admin user
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Admin user not found',
          code: 'INVALID_TOKEN'
        }
      });
    }

    // Attach admin to request object
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        message: 'Authentication failed',
        code: 'AUTH_ERROR'
      }
    });
  }
};

module.exports = { authenticateAdmin };
