// server/api/routes/login.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../config/database');
const { verifyToken } = require('../middleware/globalAuth');
require('dotenv').config();

/* ======================== Constants ======================== */
const SALT_ROUNDS = 10;
const ACCESS_TOKEN_KEY = process.env.ACCESS_TOKEN_PRIVATE_KEY;
const REFRESH_TOKEN_KEY = process.env.REFRESH_TOKEN_PRIVATE_KEY;
const ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE || '1h';
const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || '5h';

/* ======================== Token Helpers ======================== */
const generateTokens = (user) => {
  const payload = {
    id: user.Login || user.id,
    name: user.Name || user.name,
    role: user.StAdmin || user.role,
    saleCode: user.SaleCode || user.saleCode || null,
  };

  const accessToken = jwt.sign(payload, ACCESS_TOKEN_KEY, {
    expiresIn: ACCESS_TOKEN_EXPIRE,
    algorithm: 'HS256',
  });

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_KEY, {
    expiresIn: REFRESH_TOKEN_EXPIRE,
    algorithm: 'HS256',
  });

  return { accessToken, refreshToken };
};

/* ======================== Rate Limiters ======================== */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, please try again later',
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

/* ======================== Database Helpers ======================== */
const saveRefreshToken = async (userId, token) => {
  try {
    const decoded = jwt.decode(token);
    const updateQuery = 'UPDATE Token SET token = @token, expire_date = @exp WHERE user_id = @Login2';
    
    await db.queryDB('Sigma', updateQuery, {
      token: token,
      exp: decoded.exp,
      Login2: userId
    });
  } catch (error) {
    console.error('Error saving refresh token:', error);
    throw error;
  }
};

const clearRefreshToken = async (userId) => {
  try {
    const updateQuery = 'UPDATE Token SET token = null, expire_date = null WHERE user_id = @Login2';
    await db.queryDB('Sigma', updateQuery, { Login2: userId });
  } catch (error) {
    console.error('Error clearing refresh token:', error);
  }
};

/* ======================== POST /login ======================== */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    console.log(`🔐 Login attempt for user: ${username}`);

    // Query user from Sigma database
    const userQuery = `
      SELECT Login, Name, StAdmin, Password, SaleCode 
      FROM [DATASIGMA].[dbo].[Users] 
      WHERE Login = @Login AND Password = @Password
    `;
    
    const userData = await db.queryDB('Sigma', userQuery, {
      Login: username,
      Password: password
    });

    if (!userData.recordset || userData.recordset.length === 0) {
      console.log(`❌ Invalid credentials for user: ${username}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const user = userData.recordset[0];
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token
    await saveRefreshToken(user.Login, refreshToken);

    // Get sale info if exists
    let saleInfo = null;
    if (user.SaleCode && user.SaleCode !== '') {
      try {
        const saleQuery = `
          SELECT Name, SurName 
          FROM sale 
          WHERE Code = @salecode
        `;
        const saleData = await db.queryDB('SigmaOffice', saleQuery, {
          salecode: user.SaleCode
        });

        if (saleData.recordset && saleData.recordset.length > 0) {
          saleInfo = saleData.recordset[0];
        }
      } catch (error) {
        console.error('Error fetching sale info:', error);
      }
    }

    console.log(`✅ Login successful for user: ${username}`);

    const userPayload = {
        Login: user.Login,
        Name: user.Name,
        StAdmin: String(user.StAdmin ?? ''),
        SaleCode: user.SaleCode || ''
  };

    // Return format ที่เข้ากับไฟล์เก่า
    return res.json({
      success: true,

      // ฟอร์แมตใหม่ (ให้ FE รุ่นใหม่ใช้ได้เลย)
      user: userPayload,
      accessToken,
      refreshToken,
      tokenType: 'Bearer',

      // ฟอร์แมตเดิม (ไม่ทำให้โค้ดเก่าพัง)
      access_token: accessToken,
      refresh_token: refreshToken,
      result: [[userPayload]],
      resultInfo: [[userPayload]]
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/* ======================== POST /refresh ======================== */
router.post('/refresh', generalLimiter, async (req, res) => {
  try {
    const { token: refreshToken, username } = req.body;

    if (!refreshToken || !username) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token and username are required',
      });
    }

    // Verify token in database
    const tokenQuery = 'SELECT * FROM [DATASIGMA].[dbo].[Token] WHERE user_id = @user';
    const result = await db.queryDB('Sigma', tokenQuery, { user: username });

    if (!result.recordset || result.recordset.length === 0 || result.recordset[0].token !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: 'Refresh token is not valid',
      });
    }

    // Verify JWT
    try {
      jwt.verify(refreshToken, REFRESH_TOKEN_KEY);
    } catch (err) {
      return res.status(403).json({
        success: false,
        message: 'Refresh token expired or invalid',
      });
    }

    // Generate new tokens
    const newAccessToken = jwt.sign(
      { id: username },
      ACCESS_TOKEN_KEY,
      { expiresIn: ACCESS_TOKEN_EXPIRE, algorithm: 'HS256' }
    );
    
    const newRefreshToken = jwt.sign(
      { id: username },
      REFRESH_TOKEN_KEY,
      { expiresIn: REFRESH_TOKEN_EXPIRE, algorithm: 'HS256' }
    );

    // Update refresh token in database
    const decoded = jwt.decode(newRefreshToken);
    const updateQuery = 'UPDATE Token SET token = @token, expire_date = @exp WHERE user_id = @Login2';
    
    await db.queryDB('Sigma', updateQuery, {
      token: newRefreshToken,
      exp: decoded.exp,
      Login2: username
    });

    return res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

  } catch (error) {
    console.error('❌ Refresh token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Token Invalid',
    });
  }
});

/* ======================== POST /logout ======================== */
router.post('/logout', async (req, res) => {
  try {
    const { username } = req.body;

    if (username) {
      await clearRefreshToken(username);
    }

    return res.status(200).json({
      success: true,
      message: 'You Logged out Successfully',
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/* ======================== GET / (Users List) ======================== */
router.get('/', verifyToken, async (req, res) => {
  try {
    const query = 'SELECT * FROM [DATASIGMA].[dbo].[Users]';
    const result = await db.queryDB('Sigma', query);

    return res.json({
      success: true,
      result: result.recordset,
    });

  } catch (error) {
    console.error('❌ Get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching users',
    });
  }
});

/* ======================== GET /me ======================== */
router.get('/me', verifyToken, (req, res) => {
  return res.json({
    success: true,
    user: req.user,
    message: 'Token valid',
    timestamp: new Date().toISOString(),
  });
});

/* ======================== POST /table (Product List with Pagination) ======================== */
router.post('/table', verifyToken, async (req, res) => {
  try {
    // ----- Normalize type parameter -----
    const raw = req.body?.e;
    const types = Array.isArray(raw)
      ? raw
      : String(raw ?? '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);

    if (!types.length) {
      return res.status(400).json({ success: false, message: 'Type array is required' });
    }
    const valueSearch = types.join(',');

    // ----- Pagination parameters -----
    const page = Math.max(1, Number(req.body?.page) || 1);
    const limit = Math.max(1, Math.min(1000, Number(req.body?.limit || req.body?.pageSize) || 20));
    const offset = (page - 1) * limit;

    console.log(`📄 Fetching page ${page}, limit ${limit}, offset ${offset}`);

    // ----- COUNT Query (สำหรับ total records) -----
    const countQuery = `
      SELECT COUNT(*) as totalCount
      FROM (
        SELECT DepartName
        FROM DATASIGMA.dbo.ItemDm WITH (NOLOCK)
        WHERE TyItemDm LIKE '%[' + @Type + ']%'
        GROUP BY DepartName

        UNION ALL

        SELECT itemdm.ItemCode
        FROM DATASIGMA.dbo.ItemDm itemdm WITH (NOLOCK)
        WHERE itemdm.TyItemDm LIKE '%[' + @Type + ']%'
          AND itemdm.StDispPrice <> '2'
      ) tmp
    `;

    // ----- Optimized Main Query with Pagination -----
    const mainQuery = `
      WITH RankedItems AS (
        -- Header rows (DepartName groups)
        SELECT 
          0 as rowNum, 
          '' as codem, 
          '' as PriceOffer, 
          '' as ItemCode,
          DepartName as Name, 
          '' as Barcode, 
          DepartName, 
          '' as Pack,
          '' as minPrice, 
          '' as maxPrice, 
          '' as TyItemDm, 
          '' as QBal,
          '' as BAL, 
          '' as CostN, 
          '' as DateCn, 
          '' as costNew,
          '' as price, 
          '' as PriceRE, 
          '' as datePrice, 
          '' as datePriceRe,
          ROW_NUMBER() OVER (ORDER BY DepartName ASC) as num
        FROM DATASIGMA.dbo.ItemDm WITH (NOLOCK)
        WHERE TyItemDm LIKE '%[' + @Type + ']%'
        GROUP BY DepartName

        UNION ALL

        -- Item rows
        SELECT 
          1 as rowNum, 
          itemdm.codem, 
          itemDm.PriceOffer, 
          itemDm.ItemCode,
          itemdm.Name, 
          itemDm.Barcode, 
          itemdm.DePartName, 
          itemdm.Pack,
          CAST(CONVERT(VARCHAR, CAST(ISNULL(priceRange.p1, 0) AS MONEY), 1) AS VARCHAR) as minPrice,
          CAST(CONVERT(VARCHAR, CAST(ISNULL(priceRange.p2, 0) AS MONEY), 1) AS VARCHAR) as maxPrice,
          itemdm.TyItemDm,
          CAST(CONVERT(VARCHAR, CAST(ISNULL(stock.QBAL, 0) AS MONEY), 1) AS VARCHAR) as QBal,
          CAST(ISNULL(stock.BAL, 0) AS VARCHAR) as BAL,
          CAST(CONVERT(VARCHAR, CAST(ISNULL(itemdm.COSTN, 0) AS MONEY), 1) AS VARCHAR) as CostN,
          FORMAT(itemdm.DateCN, 'dd/MM/yyyy') as DateCn,
          CASE
            WHEN (CAST(itemdm.DateAddI AS DATETIME) > CAST(itemdm.DateAddE AS DATETIME) OR itemdm.DateAddE IS NULL) 
                 AND itemdm.DateAddI IS NOT NULL
              THEN CAST(CONVERT(VARCHAR, CAST(ISNULL(itemdm.CostI, 0) AS MONEY), 1) AS VARCHAR)
            WHEN (CAST(itemdm.DateAddE AS DATETIME) > CAST(itemdm.DateAddI AS DATETIME) OR itemdm.DateAddI IS NULL) 
                 AND itemdm.DateAddE IS NOT NULL
              THEN CAST(CONVERT(VARCHAR, CAST(ISNULL(itemdm.CostE, 0) AS MONEY), 1) AS VARCHAR)
            ELSE '0.00'
          END as costNew,
          CAST(CONVERT(VARCHAR, CAST(ISNULL(itemdm.price, 0) AS MONEY), 1) AS VARCHAR) as price,
          CAST(CONVERT(VARCHAR, CAST(ISNULL(itemdm.PriceRE, 0) AS MONEY), 1) AS VARCHAR) as PriceRE,
          FORMAT(itemdm.datePrice, 'dd/MM/yyyy') as datePrice,
          FORMAT(itemdm.datepriceRe, 'dd/MM/yyyy') as datePriceRe,
          DENSE_RANK() OVER (ORDER BY itemdm.DepartName ASC) as num
        FROM DATASIGMA.dbo.ItemDm itemdm WITH (NOLOCK)
        INNER JOIN DATASIGMA.dbo.qitemdmbal WITH (NOLOCK) 
          ON itemdm.itemcode = qitemdmbal.itemcode
        LEFT JOIN (
          SELECT 
            MIN(price) as p1, 
            MAX(price) as p2, 
            ItemCode
          FROM DATASIGMA.dbo.IteminSub WITH (NOLOCK)
          GROUP BY ItemCode
        ) priceRange ON priceRange.ItemCode = itemDm.itemcode
        LEFT JOIN (
          SELECT 
            itemcode, 
            SUM(qbal) as QBal,
            SUM(qbal) - SUM(ISNULL(QD, 0)) - SUM(ISNULL(QP1, 0)) - SUM(ISNULL(qp2, 0)) 
              - SUM(ISNULL(QP3, 0)) - SUM(ISNULL(QP4, 0)) + SUM(ISNULL(Qs, 0)) as BAL
          FROM DATASIGMA.dbo.rptstock2 WITH (NOLOCK)
          GROUP BY itemcode
        ) stock ON stock.itemcode = itemDm.itemcode
        WHERE itemdm.TyItemDm LIKE '%[' + @Type + ']%'
          AND itemdm.StDispPrice <> '2'
      )
      SELECT *
      FROM RankedItems
      ORDER BY num, rowNum, Name ASC
      OFFSET @Offset ROWS
      FETCH NEXT @Limit ROWS ONLY;
    `;

    // ----- Execute queries in parallel -----
    const [countResult, dataResult] = await Promise.all([
      db.queryDB('Sigma', countQuery, { Type: valueSearch }),
      db.queryDB('Sigma', mainQuery, { 
        Type: valueSearch, 
        Offset: offset, 
        Limit: limit 
      })
    ]);

    const totalItems = countResult.recordset?.[0]?.totalCount || 0;
    const totalPages = Math.ceil(totalItems / limit);
    const items = dataResult.recordset || [];

    // ----- Fetch supplementary data (only once, not per page) -----
    // ใช้ Promise.all เพื่อเรียกแบบ parallel
    const [bomData, bomSummary, deptData, reserveData] = await Promise.all([
      db.queryDB('Sigma', `
        SELECT a.Code, a.ItemCode, a.ItemName, a.Qty, a.Pack,
               CAST(CONVERT(VARCHAR, CAST(ISNULL(a.cost, 0) AS MONEY), 1) AS VARCHAR) as Cost,
               CAST(CONVERT(VARCHAR, CAST(ISNULL(a.costn, 0) AS MONEY), 1) AS VARCHAR) as CostN
        FROM DATASIGMA.dbo.QitemBom a WITH (NOLOCK);
      `),
      db.queryDB('Sigma', `
        SELECT Code,
               CAST(CONVERT(VARCHAR, CAST(ISNULL(AmtDM, 0) AS MONEY), 1) AS VARCHAR) as AmtDM,
               AmtEXP,
               CAST(CONVERT(VARCHAR, CAST(ISNULL(AmtCost, 0) AS MONEY), 1) AS VARCHAR) as AmtCost,
               DateCN
        FROM DATASIGMA.dbo.bom WITH (NOLOCK);
      `),
      db.queryDB('Sigma', `
        SELECT DISTINCT DePartName 
        FROM DATASIGMA.dbo.ItemDm WITH (NOLOCK) 
        WHERE TyItemDm LIKE '%[' + @Type + ']%';
      `, { Type: valueSearch }),
      db.queryDB('Sigma', `
        SELECT tmp.itemCode, SUM(calBal) as calBal
        FROM (
          SELECT tmp.itemCode, b.bal, tmp.BomQTY, tmp.ReserveQTY, tmp.num,
                 CASE
                   WHEN tmp.num = 1 THEN ((tmp.BomQTY * ABS((b.bal - tmp.ReserveQTY)))/1000)
                   ELSE ABS(tmp.ReserveQTY)
                 END as calBal
          FROM (
            SELECT CASE WHEN tmp.code = '' THEN tmp.item ELSE tmp.code END as itemCode,
                   tmp.BomQTY, tmp.ReserveQTY, tmp.code, tmp.item, tmp.Num
            FROM (
              SELECT 0 AS NUM, itemCode as item, SUM(QTY) as BomQTY, SUM(QTY) as ReserveQTY, '' as code
              FROM DATASIGMA.dbo.ReserveProduct WITH (NOLOCK)
              GROUP BY itemCode
              UNION ALL
              SELECT 1 AS NUM, a.code as item, a.QTY as BomSubQTY, b.QTY as ReserveQTY, a.ItemCode as code
              FROM DATASIGMA.dbo.BomSub a WITH (NOLOCK)
              LEFT JOIN (
                SELECT itemCode, SUM(QTY) as QTY
                FROM DATASIGMA.dbo.ReserveProduct WITH (NOLOCK)
                GROUP BY itemcode
              ) b ON b.itemCode = a.code
              WHERE b.QTY IS NOT NULL
            ) tmp
          ) tmp
          LEFT JOIN (
            SELECT 
              a.itemCode,
              SUM(qbal) - SUM(ISNULL(QD, 0)) - SUM(ISNULL(QP1, 0)) - SUM(ISNULL(qp2, 0)) 
                - SUM(ISNULL(QP3, 0)) - SUM(ISNULL(QP4, 0)) + SUM(ISNULL(Qs, 0)) as BAL
            FROM DATASIGMA.dbo.rptstock2 a WITH (NOLOCK)
            GROUP BY a.itemCode
          ) b ON b.itemCode = tmp.item
          WHERE tmp.NUM = CASE WHEN (b.bal - tmp.ReserveQTY) < 0 THEN tmp.NUM ELSE 0 END
        ) Tmp
        GROUP BY itemCode;
      `)
    ]);

    const bomItems = bomData.recordset || [];
    const bomSummaryItems = bomSummary.recordset || [];
    const departments = deptData.recordset || [];
    const reserves = reserveData.recordset || [];

    // ----- Process items with BOM and Reserve data -----
    const processedItems = items.map((it) => {
      const rsv = reserves.find(r => r.itemCode === it.ItemCode);
      const balVal = parseFloat(String(it.BAL || '0').replace(/,/g, ''));
      const reserveVal = rsv ? parseFloat(rsv.calBal || 0) : 0;

      const out = {
        ...it,
        NewArr: bomItems.filter(b => it.ItemCode === b.Code),
        SumArr: bomSummaryItems.filter(s => it.ItemCode === s.Code),
      };

      if (it.rowNum === 1) {
        out.Reserve = reserveVal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        if (!isNaN(balVal)) {
          out.BAL = (balVal - reserveVal).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
      }

      return out;
    });

    // ----- Return with full pagination metadata -----
    console.log(`✅ Returned ${processedItems.length} items (page ${page}/${totalPages})`);

    return res.json({
      success: true,
      result: processedItems,
      Data4: departments,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        itemsOnPage: processedItems.length
      }
    });

  } catch (error) {
    console.error('❌ Table query error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error fetching table data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/* ======================== GET /subTable ======================== */
router.get('/subTable', verifyToken, async (req, res) => {
  try {
    const { itemCode } = req.query;

    let query = 'SELECT * FROM DATASIGMA.dbo.QitemBom';
    let params = {};
    
    if (itemCode) {
      query += ' WHERE Code = @itemCode';
      params.itemCode = itemCode;
    }

    const result = await db.queryDB('Sigma', query, params);

    return res.json({
      success: true,
      result: result.recordset || [],
    });

  } catch (error) {
    console.error('❌ SubTable query error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching subtable data',
    });
  }
});

/* ======================== GET /callback (LINE webhook) ======================== */
router.get('/callback', (req, res) => {
  console.log('LINE callback:', req.body);
  res.send('hi');
});

/* ======================== Error Handler ======================== */
router.use((err, req, res, next) => {
  console.error('Router error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: 'An error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

module.exports = router;