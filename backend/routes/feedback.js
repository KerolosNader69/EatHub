const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticateAdmin } = require('../middleware/auth');

/**
 * @route   POST /api/feedback
 * @desc    Submit user feedback
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, rating, category, message } = req.body;

    // Validate required fields
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Feedback message is required',
          code: 'MISSING_MESSAGE'
        }
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Rating must be between 1 and 5',
          code: 'INVALID_RATING'
        }
      });
    }

    // Insert feedback into Supabase
    const { data, error } = await supabase
      .from('feedback')
      .insert([
        {
          name: name?.trim() || 'Anonymous',
          email: email?.trim() || null,
          rating: parseInt(rating),
          category: category || 'general',
          message: message.trim(),
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to save feedback');
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      feedback: data[0]
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to submit feedback',
        code: 'SUBMISSION_ERROR'
      }
    });
  }
});

/**
 * @route   GET /api/feedback
 * @desc    Get all feedback (admin only)
 * @access  Private
 */
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch feedback');
    }

    res.json({
      success: true,
      feedback: data
    });
  } catch (error) {
    console.error('Fetch feedback error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to fetch feedback',
        code: 'FETCH_ERROR'
      }
    });
  }
});

module.exports = router;
