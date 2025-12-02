const logger = require('./logger');

/**
 * System monitoring utilities
 */
class SystemMonitor {
  constructor() {
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
    this.lastHealthCheck = null;
  }

  /**
   * Track request
   */
  trackRequest() {
    this.requestCount++;
  }

  /**
   * Track error
   */
  trackError() {
    this.errorCount++;
  }

  /**
   * Get system metrics
   */
  getMetrics() {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    return {
      uptime: {
        seconds: Math.floor(uptime),
        formatted: this.formatUptime(uptime)
      },
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
      },
      requests: {
        total: this.requestCount,
        errors: this.errorCount,
        errorRate: this.requestCount > 0 
          ? ((this.errorCount / this.requestCount) * 100).toFixed(2) + '%'
          : '0%'
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format uptime in human-readable format
   */
  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
  }

  /**
   * Perform health check
   */
  async healthCheck(db) {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {}
    };

    try {
      // Check database connection
      if (db && db.connection) {
        const dbState = db.connection.readyState;
        health.checks.database = {
          status: dbState === 1 ? 'connected' : 'disconnected',
          state: dbState
        };
      }

      // Check memory usage
      const memUsage = process.memoryUsage();
      const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      health.checks.memory = {
        status: heapUsedPercent < 90 ? 'healthy' : 'warning',
        heapUsedPercent: heapUsedPercent.toFixed(2) + '%'
      };

      // Overall status
      const allHealthy = Object.values(health.checks).every(
        check => check.status === 'connected' || check.status === 'healthy'
      );
      health.status = allHealthy ? 'healthy' : 'degraded';

      this.lastHealthCheck = health;
      return health;
    } catch (error) {
      logger.error('Health check failed', { error: error.message });
      health.status = 'unhealthy';
      health.error = error.message;
      return health;
    }
  }

  /**
   * Log system metrics periodically
   */
  startMetricsLogging(intervalMinutes = 15) {
    setInterval(() => {
      const metrics = this.getMetrics();
      logger.info('System metrics', metrics);
    }, intervalMinutes * 60 * 1000);
  }
}

// Create singleton instance
const monitor = new SystemMonitor();

module.exports = monitor;
