const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

/**
 * @route   POST /api/auth/login
 * @desc    Admin login with Supabase
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide email and password',
          code: 'MISSING_CREDENTIALS'
        }
      });
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Return success response with Supabase session
    res.json({
      success: true,
      token: data.session.access_token,
      admin: {
        id: data.user.id,
        email: data.user.email,
        username: data.user.user_metadata?.username || data.user.email.split('@')[0]
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
 * @desc    Verify Supabase JWT token
 * @access  Private
 */
router.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'No token provided',
          code: 'NO_TOKEN'
        }
      });
    }

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        }
      });
    }

    res.json({
      success: true,
      admin: {
        id: data.user.id,
        email: data.user.email,
        username: data.user.user_metadata?.username || data.user.email.split('@')[0]
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

/**
 * @route   POST /api/auth/signup
 * @desc    Admin signup with Supabase
 * @access  Public (can be restricted later)
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide email and password',
          code: 'MISSING_CREDENTIALS'
        }
      });
    }

    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0]
        }
      }
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: 'SIGNUP_ERROR'
        }
      });
    }

    res.json({
      success: true,
      message: 'Admin account created successfully',
      admin: {
        id: data.user.id,
        email: data.user.email,
        username: data.user.user_metadata?.username
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Signup failed',
        code: 'SIGNUP_ERROR'
      }
    });
  }
});

/**
 * @route   POST /api/auth/user/signup
 * @desc    User signup with Supabase
 * @access  Public
 */
router.post('/user/signup', async (req, res) => {
  try {
    const { fullName, email, phone, address, password } = req.body;

    // Validate input
    if (!fullName || !email || !phone || !address || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide all required fields',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide a valid email address',
          code: 'INVALID_EMAIL'
        }
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Password must be at least 6 characters long',
          code: 'WEAK_PASSWORD'
        }
      });
    }

    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          role: 'user'
        }
      }
    });

    if (error) {
      console.error('Supabase signup error:', error);
      return res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Unable to create account. Please try a different email.',
          code: 'SIGNUP_ERROR'
        }
      });
    }

    // Return success with token for auto-login
    res.json({
      success: true,
      message: 'Account created successfully',
      token: data.session?.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.fullName,
        phone: data.user.user_metadata?.phone,
        address: data.user.user_metadata?.address
      }
    });
  } catch (error) {
    console.error('User signup error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Signup failed. Please try again.',
        code: 'SIGNUP_ERROR'
      }
    });
  }
});

/**
 * @route   POST /api/auth/user/login
 * @desc    User login with Supabase
 * @access  Public
 */
router.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide email and password',
          code: 'MISSING_CREDENTIALS'
        }
      });
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Return success response
    res.json({
      success: true,
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.fullName,
        phone: data.user.user_metadata?.phone,
        address: data.user.user_metadata?.address
      }
    });
  } catch (error) {
    console.error('User login error:', error);
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
 * @route   PUT /api/auth/user/update
 * @desc    Update user profile
 * @access  Private
 */
router.put('/user/update', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'No token provided',
          code: 'NO_TOKEN'
        }
      });
    }

    const { fullName, email, phone, address } = req.body;

    // Verify token and get user
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        }
      });
    }

    // Update user metadata
    const { data, error } = await supabase.auth.updateUser({
      email,
      data: {
        fullName,
        phone,
        address
      }
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: 'UPDATE_ERROR'
        }
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.fullName,
        phone: data.user.user_metadata?.phone,
        address: data.user.user_metadata?.address
      }
    });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Update failed',
        code: 'UPDATE_ERROR'
      }
    });
  }
});

module.exports = router;
