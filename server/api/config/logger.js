// server/api/config/logger.js
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'sigma-api' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write access logs
    new winston.transports.File({ 
      filename: path.join(logsDir, 'access.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production, log to the console too
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

// Create a stream object for Morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Request logger middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.info({
    type: 'request',
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Capture response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    
    // Log response
    logger.info({
      type: 'response',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });

    // Log slow requests
    if (duration > 1000) {
      logger.warn({
        type: 'slow-request',
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
      });
    }

    originalSend.apply(res, arguments);
  };

  next();
};

// Error logger
const errorLogger = (err, req, res, next) => {
  logger.error({
    type: 'error',
    method: req.method,
    url: req.url,
    error: {
      message: err.message,
      stack: err.stack,
      status: err.status || 500,
    },
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  next(err);
};

// Database query logger
const queryLogger = {
  logQuery: (query, params, duration, success = true) => {
    const logData = {
      type: 'database-query',
      query: query.substring(0, 200), // Log first 200 chars
      duration: `${duration}ms`,
      success,
    };

    if (!success) {
      logger.error(logData);
    } else if (duration > 500) {
      logger.warn({ ...logData, type: 'slow-query' });
    } else {
      logger.debug(logData);
    }
  },
};

module.exports = {
  logger,
  requestLogger,
  errorLogger,
  queryLogger,
};