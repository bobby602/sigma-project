// server/api/routes/customerList.js - รองรับทั้ง legacy และ new API ใน URL เดียว
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const cache = require('../config/cache');
const verifyToken = require('../middleware/auth');

// ===== Helper function สำหรับตรวจสอบ auth =====
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    // มี token = ใช้ auth middleware
    verifyToken(req, res, next);
  } else {
    // ไม่มี token = ไม่ auth (legacy mode)
    console.log('🔓 No token provided - using legacy mode');
    next();
  }
};

// ===== LEGACY + NEW API ENDPOINTS =====

// Legacy: GET /api/customers (เดิม: /customerList)
// New: GET /api/customers/search
router.get('/', async (req, res) => {
  try {
    console.log('📞 API called: GET /api/customers (legacy format)');
    
    const query = `
      SELECT TOP 100
        Code,
        Name,
        Phone,
        addr,
        MaxCr,
        ISNULL(IsActive, 1) as IsActive
      FROM DATASIGMA.dbo.Customer WITH (NOLOCK)
      WHERE ISNULL(IsActive, 1) = 1
      ORDER BY Name ASC
    `;

    const result = await db.query(query);

    // ส่งในรูปแบบ legacy ที่ client คาดหวัง
    res.json({
      result: {
        recordset: result.recordset || []
      }
    });

    console.log(`✅ Legacy format: Returned ${result.recordset?.length || 0} customers`);

  } catch (error) {
    console.error('❌ Customer list error:', error);
    res.status(500).json({
      result: {
        recordset: []
      },
      error: error.message
    });
  }
});

// New API: Search customers with pagination (ต้อง auth)
router.get('/search', verifyToken, async (req, res) => {
  try {
    const { 
      q = '', 
      page = 1, 
      limit = 20,
      sortBy = 'Name',
      sortOrder = 'ASC',
      maxCredit,
      isActive = true
    } = req.query;

    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const whereConditions = ['1=1'];
    const queryParams = {
      offset: parseInt(offset),
      limit: parseInt(limit)
    };

    if (q) {
      whereConditions.push(`
        (Code LIKE @searchTerm 
        OR Name LIKE @searchTerm 
        OR Phone LIKE @searchTerm 
        OR addr LIKE @searchTerm)
      `);
      queryParams.searchTerm = `%${q}%`;
    }

    if (maxCredit) {
      whereConditions.push('MaxCr >= @maxCredit');
      queryParams.maxCredit = parseInt(maxCredit);
    }

    if (isActive !== undefined) {
      whereConditions.push('IsActive = @isActive');
      queryParams.isActive = isActive === 'true' ? 1 : 0;
    }

    // Query with pagination
    const query = `
      WITH CustomerData AS (
        SELECT 
          Code,
          Name,
          Phone,
          addr,
          MaxCr,
          IsActive,
          ROW_NUMBER() OVER (ORDER BY ${sortBy} ${sortOrder}) as RowNum,
          COUNT(*) OVER() as TotalCount
        FROM DATASIGMA.dbo.Customer WITH (NOLOCK)
        WHERE ${whereConditions.join(' AND ')}
      )
      SELECT * FROM CustomerData
      WHERE RowNum > @offset AND RowNum <= (@offset + @limit)
    `;

    const result = await db.query(query, queryParams);

    res.json({
      data: result.recordset,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.recordset[0]?.TotalCount || 0,
        totalPages: Math.ceil((result.recordset[0]?.TotalCount || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Legacy: GET /api/customers/custReg (เดิม: /customerList/custReg)
router.get('/custReg', async (req, res) => {
  try {
    console.log('📞 API called: GET /api/customers/custReg (legacy format)');
    
    const query = `
      SELECT TOP 50
        a.*,
        FORMAT(a.DocDate, 'dd/MM/yyyy') as DocDateFormatted
      FROM DATASIGMA.dbo.CustReg a WITH (NOLOCK)
      ORDER BY a.DocDate DESC
    `;

    const result = await db.query(query);

    res.json({
      result: {
        recordset: result.recordset || []
      }
    });

    console.log(`✅ Legacy format: Returned ${result.recordset?.length || 0} customer registrations`);

  } catch (error) {
    console.error('❌ Customer reg error:', error);
    res.status(500).json({
      result: {
        recordset: []
      },
      error: error.message
    });
  }
});

// Legacy: POST /api/customers/selectSummaryUser (เดิม: /customerList/selectSummaryUser)
router.post('/selectSummaryUser', async (req, res) => {
  try {
    console.log('📞 API called: POST /api/customers/selectSummaryUser (legacy format)', req.body);
    
    const { input, saleCode } = req.body;
    
    let query = `
      SELECT 
        Code as CustCode,
        Name as CustName,
        MaxCr as NetAmt,
        MaxCr as Target
      FROM DATASIGMA.dbo.Customer WITH (NOLOCK)
      WHERE ISNULL(IsActive, 1) = 1
    `;

    const queryParams = {};

    if (saleCode) {
      query += ` AND SaleCode = @saleCode`;
      queryParams.saleCode = saleCode;
    }

    query += ` ORDER BY MaxCr DESC`;

    const result = await db.query(query, queryParams);

    res.json({
      finalResult: result.recordset || []
    });

    console.log(`✅ Legacy format: Returned ${result.recordset?.length || 0} summary records`);

  } catch (error) {
    console.error('❌ Summary error:', error);
    res.status(500).json({
      finalResult: [],
      error: error.message
    });
  }
});

// Legacy: GET /api/customers/custCode (เดิม: /customerList/custCode)
router.get('/custCode', async (req, res) => {
  try {
    console.log('📞 API called: GET /api/customers/custCode (legacy format)', req.query);
    
    const { custCode, date1, date2 } = req.query;
    
    if (!custCode) {
      return res.status(400).json({
        finalResult: [],
        error: 'custCode is required'
      });
    }

    const query = `
      SELECT 
        c.*,
        FORMAT(GETDATE(), 'dd/MM/yyyy') as RegDateFormatted
      FROM DATASIGMA.dbo.Customer c WITH (NOLOCK)
      WHERE c.Code = @custCode
    `;

    const result = await db.query(query, { custCode });

    res.json({
      finalResult: result.recordset || []
    });

    console.log(`✅ Legacy format: Returned customer details for ${custCode}`);

  } catch (error) {
    console.error('❌ Customer details error:', error);
    res.status(500).json({
      finalResult: [],
      error: error.message
    });
  }
});

// New API: Get customer by code (ต้อง auth)
router.get('/:code', verifyToken, async (req, res) => {
  try {
    const { code } = req.params;

    // Check cache
    const cacheKey = `customer:${code}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const query = `
      SELECT * FROM DATASIGMA.dbo.Customer 
      WHERE Code = @code
    `;

    const result = await db.query(query, { code });

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const customer = result.recordset[0];

    // Cache for 5 minutes
    await cache.set(cacheKey, customer, 300);

    res.json(customer);

  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// New API: Get customer registration data (ต้อง auth)
router.get('/:code/registration', verifyToken, async (req, res) => {
  try {
    const { code } = req.params;

    const query = `
      SELECT 
        a.*,
        FORMAT(a.DocDate, 'dd/MM/yyyy') as DocDateFormatted
      FROM DATASIGMA.dbo.CustReg a
      WHERE a.CustCode = @code
      ORDER BY a.DocDate DESC
    `;

    const result = await db.query(query, { code });

    res.json(result.recordset);

  } catch (error) {
    console.error('Error fetching registration data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;