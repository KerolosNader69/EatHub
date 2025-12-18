const supabase = require('../config/supabase');

/**
 * Middleware to verify Supabase JWT token and authenticate admin users
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

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        }
      });
    }

    // Attach admin user to request object
    req.admin = {
      id: data.user.id,
      email: data.user.email,
      username: data.user.user_metadata?.username || data.user.email.split('@')[0]
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
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
