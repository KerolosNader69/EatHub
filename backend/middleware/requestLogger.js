const logger = require('../utils/logger');

/**
 * Request logging middleware
 * Logs all incoming requests with details
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent')
  });

  // Capture response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel]('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress
    });
  });

  next();
};

module.exports = requestLogger;
