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

// Security middleware
app.use(helmet());

// ✅ แก้ CORS ให้รองรับหลาย origin
app.use(cors({
  origin: [
    'http://localhost:3000',    // React dev server (ปกติ)
    'http://localhost:9000',    // Production หรือ custom port
    'http://1.0.169.153:3000',  // ถ้าใช้ IP
    process.env.CLIENT_URL      // จาก environment variable
  ].filter(Boolean), // กรอง undefined ออก
  credentials: true
}));

// Compression middleware
app.use(compression());

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Static files
app.use(express.static(path.join(__dirname, 'build')));

// Routes
const loginRouter = require('./routes/login');
// const lineRouter = require('./routes/line');
const priceListRouter = require('./routes/priceList');
const productListRouter = require('./routes/productList');
const reserveRouter = require('./routes/reserveList');
const customerRouter = require('./routes/customerList');

app.use('/api/auth', loginRouter);
// app.use('/api/line', lineRouter);
app.use('/api/products', productListRouter);
app.use('/api/prices', priceListRouter);
app.use('/api/reservations', reserveRouter);
app.use('/api/customers', customerRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 9001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`CORS enabled for: http://localhost:3000, http://localhost:9000`);
});

module.exports = app;