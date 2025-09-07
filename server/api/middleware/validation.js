// server/api/middleware/validation.js
const { body, query, param, validationResult } = require('express-validator');
const xss = require('xss');

// Sanitize input to prevent XSS
const sanitizeInput = (value) => {
  if (typeof value === 'string') {
    return xss(value, {
      whiteList: {}, // No HTML tags allowed
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script'],
    });
  }
  return value;
};

// Common validation rules
const validationRules = {
  // ID validation
  id: param('id')
    .isInt({ min: 1 }).withMessage('ID must be a positive integer')
    .toInt(),

  // Code validation (for customer code, item code, etc.)
  code: (field = 'code') => 
    body(field)
      .trim()
      .notEmpty().withMessage(`${field} is required`)
      .isLength({ min: 1, max: 50 }).withMessage(`${field} must be 1-50 characters`)
      .matches(/^[a-zA-Z0-9-_]+$/).withMessage(`${field} contains invalid characters`),

  // Name validation
  name: (field = 'name') =>
    body(field)
      .trim()
      .notEmpty().withMessage(`${field} is required`)
      .isLength({ min: 1, max: 200 }).withMessage(`${field} must be 1-200 characters`)
      .customSanitizer(sanitizeInput),

  // Email validation
  email: body('email')
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  // Phone validation
  phone: body('phone')
    .trim()
    .matches(/^[0-9-+()\s]+$/).withMessage('Invalid phone format')
    .isLength({ min: 9, max: 20 }).withMessage('Phone must be 9-20 characters'),

  // Pagination
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100')
      .toInt(),
  ],

  // Date range
  dateRange: [
    query('startDate')
      .optional()
      .isISO8601().withMessage('Invalid start date format')
      .toDate(),
    query('endDate')
      .optional()
      .isISO8601().withMessage('Invalid end date format')
      .toDate()
      .custom((value, { req }) => {
        if (req.query.startDate && value < req.query.startDate) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
  ],

  // Search query
  search: query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query too long')
    .customSanitizer(sanitizeInput),

  // Sort parameters
  sort: [
    query('sortBy')
      .optional()
      .isIn(['name', 'code', 'date', 'price', 'quantity'])
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['ASC', 'DESC', 'asc', 'desc'])
      .withMessage('Invalid sort order')
      .toUpperCase(),
  ],

  // Price/Amount validation
  amount: (field = 'amount') =>
    body(field)
      .isFloat({ min: 0 }).withMessage(`${field} must be a positive number`)
      .toFloat(),

  // Quantity validation
  quantity: body('quantity')
    .isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
    .toInt(),
};

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }
  
  next();
};

// SQL Injection prevention for raw queries
const sanitizeSQLInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove or escape dangerous SQL characters
  return input
    .replace(/['";\\]/g, '') // Remove quotes and backslash
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove multi-line comments start
    .replace(/\*\//g, '') // Remove multi-line comments end
    .replace(/xp_/gi, '') // Remove xp_ commands
    .replace(/sp_/gi, '') // Remove sp_ commands
    .trim();
};

// Middleware to sanitize all inputs
const sanitizeAll = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });
  }

  // Sanitize query params
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeInput(req.query[key]);
      }
    });
  }

  // Sanitize params
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = sanitizeInput(req.params[key]);
      }
    });
  }

  next();
};

// Specific validators for your routes
const validators = {
  // Product validators
  createProduct: [
    validationRules.code('itemCode'),
    validationRules.name('name'),
    body('pack').optional().isLength({ max: 50 }),
    body('departCode').optional().isLength({ max: 20 }),
    validationRules.amount('cost'),
    validationRules.amount('price'),
    handleValidationErrors,
  ],

  updateProduct: [
    validationRules.id,
    validationRules.amount('value'),
    body('type').isIn(['cost', 'price']).withMessage('Invalid update type'),
    handleValidationErrors,
  ],

  // Customer validators
  searchCustomers: [
    ...validationRules.pagination,
    validationRules.search,
    ...validationRules.sort,
    query('maxCredit').optional().isFloat({ min: 0 }).toFloat(),
    query('isActive').optional().isBoolean().toBoolean(),
    handleValidationErrors,
  ],

  // Reservation validators
  createReservation: [
    validationRules.code('itemCode'),
    validationRules.name('saleName'),
    validationRules.name('nameFGS'),
    validationRules.code('code'),
    validationRules.quantity,
    body('note').optional().isLength({ max: 500 }).customSanitizer(sanitizeInput),
    handleValidationErrors,
  ],

  // Price list validators
  getPriceList: [
    ...validationRules.pagination,
    validationRules.search,
    query('departCode').optional().isLength({ max: 20 }),
    ...validationRules.sort,
    handleValidationErrors,
  ],
};

module.exports = {
  validationRules,
  handleValidationErrors,
  sanitizeInput,
  sanitizeSQLInput,
  sanitizeAll,
  validators,
};