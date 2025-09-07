// server/api/middleware/monitoring.js
const os = require('os');
const db = require('../config/database');
const cache = require('../config/cache');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        errors: 0,
        active: 0,
      },
      response_times: [],
      slow_queries: [],
      errors: [],
      startTime: Date.now(),
    };

    // Clean old data every hour
    setInterval(() => this.cleanOldMetrics(), 3600000);
  }

  // Record request start
  startRequest() {
    this.metrics.requests.total++;
    this.metrics.requests.active++;
    return Date.now();
  }

  // Record request end
  endRequest(startTime, statusCode) {
    this.metrics.requests.active--;
    const duration = Date.now() - startTime;
    
    if (statusCode >= 200 && statusCode < 400) {
      this.metrics.requests.success++;
    } else if (statusCode >= 400) {
      this.metrics.requests.errors++;
    }

    // Keep last 1000 response times
    this.metrics.response_times.push({
      time: Date.now(),
      duration,
      statusCode,
    });

    if (this.metrics.response_times.length > 1000) {
      this.metrics.response_times.shift();
    }
  }

  // Record slow query
  recordSlowQuery(query, duration) {
    this.metrics.slow_queries.push({
      time: Date.now(),
      query: query.substring(0, 100),
      duration,
    });

    // Keep last 100 slow queries
    if (this.metrics.slow_queries.length > 100) {
      this.metrics.slow_queries.shift();
    }
  }

  // Record error
  recordError(error, context) {
    this.metrics.errors.push({
      time: Date.now(),
      message: error.message,
      stack: error.stack,
      context,
    });

    // Keep last 100 errors
    if (this.metrics.errors.length > 100) {
      this.metrics.errors.shift();
    }
  }

  // Clean old metrics
  cleanOldMetrics() {
    const oneHourAgo = Date.now() - 3600000;
    
    this.metrics.response_times = this.metrics.response_times.filter(
      m => m.time > oneHourAgo
    );
    
    this.metrics.slow_queries = this.metrics.slow_queries.filter(
      m => m.time > oneHourAgo
    );
    
    this.metrics.errors = this.metrics.errors.filter(
      m => m.time > oneHourAgo
    );
  }

  // Get current metrics
  getMetrics() {
    const uptime = Date.now() - this.metrics.startTime;
    const avgResponseTime = this.metrics.response_times.length > 0
      ? this.metrics.response_times.reduce((sum, m) => sum + m.duration, 0) / this.metrics.response_times.length
      : 0;

    return {
      uptime: Math.floor(uptime / 1000), // seconds
      requests: this.metrics.requests,
      avgResponseTime: Math.round(avgResponseTime),
      slowQueries: this.metrics.slow_queries.length,
      recentErrors: this.metrics.errors.length,
      system: {
        memory: {
          total: Math.round(os.totalmem() / 1024 / 1024), // MB
          free: Math.round(os.freemem() / 1024 / 1024), // MB
          used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024), // MB
          percentage: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100),
        },
        cpu: {
          cores: os.cpus().length,
          model: os.cpus()[0]?.model,
          load: os.loadavg(),
        },
      },
    };
  }
}

// Create singleton instance
const monitor = new PerformanceMonitor();

// Monitoring middleware
const monitoringMiddleware = (req, res, next) => {
  const startTime = monitor.startRequest();

  // Override res.end to capture response
  const originalEnd = res.end;
  res.end = function(...args) {
    monitor.endRequest(startTime, res.statusCode);
    originalEnd.apply(res, args);
  };

  next();
};

// Health check endpoint handler
const healthCheck = async (req, res) => {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {},
    metrics: {},
  };

  try {
    // Check database connection
    const dbStart = Date.now();
    try {
      await db.query('SELECT 1 as test');
      checks.checks.database = {
        status: 'healthy',
        responseTime: Date.now() - dbStart,
      };
    } catch (error) {
      checks.checks.database = {
        status: 'unhealthy',
        error: error.message,
      };
      checks.status = 'degraded';
    }

    // Check cache connection
    const cacheStart = Date.now();
    try {
      await cache.set('health:check', Date.now(), 10);
      const value = await cache.get('health:check');
      if (value) {
        checks.checks.cache = {
          status: 'healthy',
          type: cache.getStats().type,
          responseTime: Date.now() - cacheStart,
        };
      } else {
        throw new Error('Cache test failed');
      }
    } catch (error) {
      checks.checks.cache = {
        status: 'unhealthy',
        error: error.message,
      };
      // Cache is optional, so don't change overall status
    }

    // Add performance metrics
    checks.metrics = monitor.getMetrics();

    // Determine overall health
    if (checks.metrics.system.memory.percentage > 90) {
      checks.status = 'degraded';
      checks.warnings = checks.warnings || [];
      checks.warnings.push('High memory usage');
    }

    if (checks.metrics.avgResponseTime > 1000) {
      checks.status = 'degraded';
      checks.warnings = checks.warnings || [];
      checks.warnings.push('High average response time');
    }

    // Return appropriate status code
    const statusCode = checks.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(checks);

  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      timestamp: new Date().toISOString(),
      status: 'unhealthy',
      error: error.message,
    });
  }
};

// Detailed metrics endpoint
const getMetrics = (req, res) => {
  const metrics = monitor.getMetrics();
  res.json(metrics);
};

module.exports = {
  monitor,
  monitoringMiddleware,
  healthCheck,
  getMetrics,
};