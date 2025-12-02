const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const monitor = require('../utils/monitoring');
const logger = require('../utils/logger');

/**
 * GET /api/monitoring/health
 * Health check endpoint for uptime monitoring services
 */
router.get('/health', async (req, res) => {
  try {
    const health = await monitor.healthCheck(mongoose);
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check endpoint error', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/monitoring/metrics
 * System metrics endpoint (should be protected in production)
 */
router.get('/metrics', (req, res) => {
  try {
    const metrics = monitor.getMetrics();
    res.json(metrics);
  } catch (error) {
    logger.error('Metrics endpoint error', { error: error.message });
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve metrics',
        code: 'METRICS_ERROR'
      }
    });
  }
});

/**
 * GET /api/monitoring/status
 * Detailed status endpoint
 */
router.get('/status', async (req, res) => {
  try {
    const health = await monitor.healthCheck(mongoose);
    const metrics = monitor.getMetrics();

    res.json({
      ...health,
      metrics,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    logger.error('Status endpoint error', { error: error.message });
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve status',
        code: 'STATUS_ERROR'
      }
    });
  }
});

/**
 * POST /api/monitoring/error
 * Frontend error logging endpoint
 */
router.post('/error', (req, res) => {
  try {
    const errorData = req.body;
    
    logger.error('Frontend error', {
      ...errorData,
      source: 'frontend'
    });

    res.json({ success: true });
  } catch (error) {
    logger.error('Error logging endpoint failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to log error',
        code: 'ERROR_LOGGING_FAILED'
      }
    });
  }
});

module.exports = router;
