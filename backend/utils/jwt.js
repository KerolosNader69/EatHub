const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for admin authentication
 * @param {Object} payload - Data to encode in token (typically admin id and username)
 * @returns {String} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken
};
