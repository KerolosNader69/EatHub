const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const { generateToken } = require('../utils/jwt');
const { authenticateAdmin } = require('../middleware/auth');

/**
 * @route   POST /api/auth/login
 * @desc    Admin login
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide username and password',
          code: 'MISSING_CREDENTIALS'
        }
      });
    }

    // Find admin by username
    const admin = await Admin.findOne({ username: username.toLowerCase() });

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Generate token
    const token = generateToken({
      id: admin._id,
      username: admin.username
    });

    // Return success response
    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Login failed',
        code: 'LOGIN_ERROR'
      }
    });
  }
});

/**
 * @route   POST /api/auth/verify
 * @desc    Verify JWT token
 * @access  Private
 */
router.post('/verify', authenticateAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      admin: {
        id: req.admin._id,
        username: req.admin.username,
        email: req.admin.email
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Token verification failed',
        code: 'VERIFICATION_ERROR'
      }
    });
  }
});

module.exports = router;
