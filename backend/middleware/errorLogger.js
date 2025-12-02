const logger = require('../utils/logger');

/**
 * Error logging middleware
 * Logs all errors with full details including stack traces
 */
const errorLogger = (err, req, res, next) => {
  // Log error with full context
  logger.error('Application error', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    status: err.status || 500,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Pass to next error handler
  next(err);
};

module.exports = errorLogger;
