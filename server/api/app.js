// server/api/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// app.set('etag', false);

/* ------------------------ Security ------------------------ */
app.use(helmet());

/* ------------------------ CORS ------------------------ */
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:9000',
    'http://1.0.169.153:3000',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: false, // ใช้ Bearer token ไม่ต้องเปิด credentials
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
}));
app.options('*', cors());

/* ------------------------ Compression & Logging ------------------------ */
app.use(compression());
app.use(morgan('combined'));

/* ------------------------ Body parsing ------------------------ */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ------------------------ Rate limit (ทั่วไป) ------------------------ */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', generalLimiter);

/* ------------------------ Static (ถ้าจำเป็น) ------------------------ */
app.use(express.static(path.join(__dirname, 'build')));

/* ------------------------ ROUTES ------------------------ */
try {
  const loginRouter = require('./routes/login');
  app.use('/api/auth', loginRouter); // login limiter อยู่ภายในไฟล์ login แล้ว
  console.log('✅ Login router loaded');
} catch (error) {
  console.warn('❌ Failed to load login routes:', error.message);
}

try {
  const customerRouter = require('./routes/customerList');
  console.log('✅ customerList router loaded');
  app.use('/api/customers', (req, res, next) => {
    console.log('➡️ hit /api/customers mount', req.method, req.url);
    next();
  }, customerRouter);
} catch (error) {
  console.error('❌ Failed to load customer routes:', error.message);
}

try {
  const productListRouter = require('./routes/productList');
  console.log('✅ productList router loaded');
   app.use('/productList', (req,res,next)=>{
    console.log('➡️ hit /productList mount', req.method, req.url);
    next();
  }, productListRouter);
} catch (error) {
  console.log('⚠️ Product routes not found, skipping...', error.message);
}

try {
  const priceListRouter = require('./routes/priceList');
  app.use('/api/prices', priceListRouter);
} catch (error) {
  console.log('⚠️ Price routes not found, skipping...');
}

try {
  const reserveRouter = require('./routes/reserveList');
  app.use('/api/reservations', reserveRouter);
} catch (error) {
  console.log('⚠️ Reservation routes not found, skipping...');
}

/* ------------------------ Utility Endpoints ------------------------ */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/metrics', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    uptime: process.uptime(),
    memory: {
      rss: Math.round(mem.rss / 1024 / 1024) + ' MB',
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024) + ' MB',
    },
    cpu: process.cpuUsage(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'Sigma API',
    version: '2.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      metrics: '/api/metrics',
      auth: {
        login: '/api/auth/login',
        refresh: '/api/auth/refresh',
        logout: '/api/auth/logout',
        me: '/api/auth/me'
      },
      products: '/api/products',
      prices: '/api/prices',
      reservations: '/api/reservations',
      customers: '/api/customers',
    },
  });
});

/* ------------------------ Error Handling ------------------------ */
// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.url,
  });
});

// Global error
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

/* ------------------------ Start Server ------------------------ */
const PORT = process.env.PORT || 9001;
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║       SIGMA API SERVER v2.0           ║
╠════════════════════════════════════════╣
║  Status: ✅ Running                    ║
║  Port: ${PORT}                            ║
║  Environment: ${process.env.NODE_ENV || 'development'}           ║
║  CORS: Enabled                         ║
║  Rate Limiting: Active                 ║
║  Compression: Enabled                  ║
╚════════════════════════════════════════╝

📍 Available Endpoints:
   Health: http://localhost:${PORT}/api/health
   Metrics: http://localhost:${PORT}/api/metrics
   API Info: http://localhost:${PORT}/api
  `);
});

/* ------------------------ Graceful Shutdown ------------------------ */
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
