/**
 * ⚡ CORRECTED OPTIMIZED Route
 * แก้ไขให้ตรงกับ logic เดิม 100%:
 * - เพิ่ม qitemdmbal JOIN
 * - Type filtering ใช้ pattern [1] เหมือนเดิม
 * - Reserve calculation รวม BomSub
 * - ยังคงเร็วด้วย parallel queries + indexes
 */

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
const REFRESH_TOKEN_KEY = process.env.ACCESS_TOKEN_PRIVATE_KEY
  ? process.env.REFRESH_TOKEN_PRIVATE_KEY
  : process.env.REFRESH_TOKEN_PRIVATE_KEY;
const ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE || '1h';
const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || '5h';
const PAGINATION_MODE = (process.env.PAGINATION_MODE || 'auto').toLowerCase();
const USE_TYPE_BITS = String(process.env.USE_TYPE_BITS || '0') === '1';

/* ======================== Token Helpers ======================== */
const generateTokens = (userOrPayload) => {
  const payload = {
    id: userOrPayload.Login || userOrPayload.id,
    name: userOrPayload.Name || userOrPayload.name,
    role: userOrPayload.StAdmin || userOrPayload.role,
    saleCode: userOrPayload.SaleCode || userOrPayload.saleCode || null,
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
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, please try again later',
});
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

/* ======================== DB Helpers ======================== */
const saveRefreshToken = async (userId, token) => {
  try {
    const decoded = jwt.decode(token);
    const updateQuery =
      'UPDATE Token SET token = @token, expire_date = @exp WHERE user_id = @Login2';
    await db.queryDB('Sigma', updateQuery, {
      token,
      exp: decoded?.exp ?? null,
      Login2: userId,
    });
  } catch (error) {
    console.error('Error saving refresh token:', error);
    throw error;
  }
};

const clearRefreshToken = async (userId) => {
  try {
    await db.queryDB(
      'Sigma',
      'UPDATE Token SET token = null, expire_date = null WHERE user_id = @Login2',
      { Login2: userId }
    );
  } catch (error) {
    console.error('Error clearing refresh token:', error);
  }
};

/* ======================== POST /login ======================== */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Username and password are required' });
    }

    console.log(`🔐 Login attempt for user: ${username}`);

    const userQuery = `
      SELECT Login, Name, StAdmin, Password, SaleCode
      FROM [DATASIGMA].[dbo].[Users]
      WHERE Login = @Login AND Password = @Password
    `;
    const userData = await db.queryDB('Sigma', userQuery, {
      Login: username,
      Password: password,
    });

    if (!userData.recordset || userData.recordset.length === 0) {
      console.log(`❌ Invalid credentials for user: ${username}`);
      return res
        .status(401)
        .json({ success: false, message: 'Invalid username or password' });
    }

    const user = userData.recordset[0];
    const { accessToken, refreshToken } = generateTokens(user);
    await saveRefreshToken(user.Login, refreshToken);

    try {
      if (user.SaleCode && user.SaleCode !== '') {
        await db.queryDB(
          'SigmaOffice',
          `SELECT Name, SurName FROM sale WHERE Code = @salecode`,
          { salecode: user.SaleCode }
        );
      }
    } catch (e) {
      console.error('Error fetching sale info:', e);
    }

    console.log(`✅ Login successful for user: ${username}`);
    const userPayload = {
      Login: user.Login,
      Name: user.Name,
      StAdmin: String(user.StAdmin ?? ''),
      SaleCode: user.SaleCode || '',
    };

    return res.json({
      success: true,
      user: userPayload,
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      access_token: accessToken,
      refresh_token: refreshToken,
      result: [[userPayload]],
      resultInfo: [[userPayload]],
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
    const { token: refreshToken, username } = req.body || {};
    if (!refreshToken || !username) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token and username are required',
      });
    }

    const tokenQuery =
      'SELECT * FROM [DATASIGMA].[dbo].[Token] WHERE user_id = @user';
    const result = await db.queryDB('Sigma', tokenQuery, { user: username });
    if (
      !result.recordset ||
      result.recordset.length === 0 ||
      result.recordset[0].token !== refreshToken
    ) {
      return res
        .status(403)
        .json({ success: false, message: 'Refresh token is not valid' });
    }

    let payloadFromRT;
    try {
      jwt.verify(refreshToken, REFRESH_TOKEN_KEY);
      payloadFromRT = jwt.decode(refreshToken) || { id: username };
    } catch (err) {
      return res
        .status(403)
        .json({ success: false, message: 'Refresh token expired or invalid' });
    }

    const {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    } = generateTokens(payloadFromRT);
    const decoded = jwt.decode(newRefreshToken);
    await db.queryDB(
      'Sigma',
      'UPDATE Token SET token = @token, expire_date = @exp WHERE user_id = @Login2',
      { token: newRefreshToken, exp: decoded?.exp ?? null, Login2: username }
    );

    return res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('❌ Refresh token error:', error);
    return res.status(500).json({ success: false, message: 'Token Invalid' });
  }
});

/* ======================== POST /logout ======================== */
router.post('/logout', async (req, res) => {
  try {
    const { username } = req.body || {};
    if (username) await clearRefreshToken(username);
    return res
      .status(200)
      .json({ success: true, message: 'You Logged out Successfully' });
  } catch (error) {
    console.error('❌ Logout error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
});

/* ======================== GET / (Users List) ======================== */
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await db.queryDB(
      'Sigma',
      'SELECT * FROM [DATASIGMA].[dbo].[Users]'
    );
    return res.json({ success: true, result: result.recordset });
  } catch (error) {
    console.error('❌ Get users error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Error fetching users' });
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

/* ======================== Helpers ======================== */
const fmtMoney = (v) => {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return '0.00';
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const fmtDate = (d) => {
  if (!d) return null;
  const x = new Date(d);
  if (isNaN(x.getTime())) return null;
  const dd = String(x.getDate()).padStart(2, '0');
  const mm = String(x.getMonth() + 1).padStart(2, '0');
  const yyyy = x.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

/**
 * ✅ CORRECTED: Type filter ใช้ pattern [1] เหมือนเดิม
 */
function buildTypeFilter(types) {
  if (!types || !types.length) {
    return { where: '', params: {} };
  }

  const isAll = types.some((t) => /^all$/i.test(String(t)));
  if (isAll) {
    return { where: '', params: {} };
  }

  const normTypes = types
    .map((t) => String(t).trim())
    .filter((t) => ['1', '2', '3', '4'].includes(t));

  if (!normTypes.length) {
    return { where: '', params: {} };
  }

  // ✅ ใช้ pattern [1] เหมือนเดิม
  const conditions = [];
  const params = {};

  normTypes.forEach((t, i) => {
    const pN = `TN${i}`;
    params[pN] = `%[${t}]%`; // ✅ เพิ่ม bracket [1]
    conditions.push(`itemdm.TyItemDm LIKE @${pN}`);
  });

  return {
    where: `AND (${conditions.join(' OR ')})`,
    params,
  };
}

function buildInClause(codes) {
  if (!codes || !codes.length) {
    return { inClause: null, params: {} };
  }

  const params = {};
  const placeholders = codes.map((code, i) => {
    const key = `code${i}`;
    params[key] = String(code).trim();
    return `@${key}`;
  });

  return {
    inClause: placeholders.join(','),
    params,
  };
}

/* ======================== POST /table (CORRECTED OPTIMIZED) ======================== */
router.post('/table', verifyToken, async (req, res) => {
  const startTime = Date.now();
  const perfLog = {};

  try {
    const searchTerm = req.body?.search || '';
    const searchPattern = searchTerm ? `%${searchTerm}%` : '';

    const raw = req.body?.e;
    const types = Array.isArray(raw)
      ? raw
      : String(raw ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    if (!types.length) {
      return res
        .status(400)
        .json({ success: false, message: 'Type array is required' });
    }

    const page = Math.max(1, Number(req.body?.page) || 1);
    const limit = Math.max(
      1,
      Math.min(1000, Number(req.body?.limit || req.body?.pageSize) || 20)
    );
    const offset = (page - 1) * limit;

    const afterInput =
      req.body?.after === undefined || req.body?.after === null
        ? null
        : String(req.body.after).trim();
    const isFirstPage = page === 1;
    const useSeek =
      PAGINATION_MODE === 'seek' ||
      (PAGINATION_MODE === 'auto' && (isFirstPage || !!afterInput));
    const afterItemCode = useSeek ? afterInput ?? '' : null;

    console.log(`\n${'='.repeat(80)}`);
    console.log(`📄 [CORRECTED] Page ${page}, limit ${limit}, search: "${searchTerm}"`);
    console.log(`   types(raw) =`, raw);
    console.log(`   types(norm)=`, types);
    console.log(`   mode       = ${PAGINATION_MODE}, useSeek=${useSeek}`);
    console.log(`${'='.repeat(80)}`);

    const searchCondition = searchTerm
      ? `AND (itemdm.Name LIKE @searchPattern OR itemdm.ItemCode LIKE @searchPattern OR itemdm.Barcode LIKE @searchPattern)`
      : '';

    const { where: typeWhere, params: typeParams } = buildTypeFilter(types);

    console.log('🚩 Generated typeWhere =', typeWhere || '(none)');
    console.log('🚩 Type params =', typeParams);

    // ===== COUNT Query =====
    const countQuery = `
      SELECT COUNT(*) as totalCount
      FROM DATASIGMA.dbo.ItemDm itemdm WITH (NOLOCK, INDEX(IX_ItemDm_FilterSeek))
      INNER JOIN DATASIGMA.dbo.qitemdmbal WITH (NOLOCK)
        ON itemdm.itemcode = qitemdmbal.itemcode
      WHERE itemdm.StDispPrice <> '2'
        ${typeWhere}
        ${searchCondition}
    `;

    // ===== MAIN Query (✅ เพิ่ม qitemdmbal JOIN) =====
    const mainQuery = useSeek
      ? `
      SELECT TOP (@Limit)
        itemdm.ItemCode,
        itemdm.codem,
        itemdm.PriceOffer,
        itemdm.Name,
        itemdm.Barcode,
        itemdm.DePartName AS DepartName,
        itemdm.Pack,
        itemdm.TyItemDm,
        itemdm.COSTN AS CostN,
        itemdm.DateCN AS DateCn,
        CASE
          WHEN (itemdm.DateAddI > itemdm.DateAddE OR itemdm.DateAddE IS NULL) 
            AND itemdm.DateAddI IS NOT NULL THEN itemdm.CostI
          WHEN (itemdm.DateAddE > itemdm.DateAddI OR itemdm.DateAddI IS NULL) 
            AND itemdm.DateAddE IS NOT NULL THEN itemdm.CostE
          ELSE 0
        END AS costNew,
        itemdm.price,
        itemdm.PriceRE,
        itemdm.datePrice,
        itemdm.datepriceRe
      FROM DATASIGMA.dbo.ItemDm AS itemdm WITH (NOLOCK, INDEX(IX_ItemDm_FilterSeek))
      INNER JOIN DATASIGMA.dbo.qitemdmbal WITH (NOLOCK)
        ON itemdm.itemcode = qitemdmbal.itemcode
      WHERE itemdm.StDispPrice <> '2'
        ${typeWhere}
        ${searchCondition}
        AND itemdm.ItemCode > @AfterItemCode
      ORDER BY itemdm.ItemCode ASC
      OPTION (RECOMPILE);
    `
      : `
      SELECT 
        itemdm.ItemCode,
        itemdm.codem,
        itemdm.PriceOffer,
        itemdm.Name,
        itemdm.Barcode,
        itemdm.DePartName AS DepartName,
        itemdm.Pack,
        itemdm.TyItemDm,
        itemdm.COSTN AS CostN,
        itemdm.DateCN AS DateCn,
        CASE
          WHEN (itemdm.DateAddI > itemdm.DateAddE OR itemdm.DateAddE IS NULL) 
            AND itemdm.DateAddI IS NOT NULL THEN itemdm.CostI
          WHEN (itemdm.DateAddE > itemdm.DateAddI OR itemdm.DateAddI IS NULL) 
            AND itemdm.DateAddE IS NOT NULL THEN itemdm.CostE
          ELSE 0
        END AS costNew,
        itemdm.price,
        itemdm.PriceRE,
        itemdm.datePrice,
        itemdm.datepriceRe
      FROM DATASIGMA.dbo.ItemDm AS itemdm WITH (NOLOCK, INDEX(IX_ItemDm_FilterSeek))
      INNER JOIN DATASIGMA.dbo.qitemdmbal WITH (NOLOCK)
        ON itemdm.itemcode = qitemdmbal.itemcode
      WHERE itemdm.StDispPrice <> '2'
        ${typeWhere}
        ${searchCondition}
      ORDER BY itemdm.ItemCode ASC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
      OPTION (RECOMPILE);
    `;

    const baseParams = {
      searchPattern,
      Offset: offset,
      Limit: limit,
      AfterItemCode: afterItemCode,
      ...typeParams,
    };

    console.log('⏱️  Executing COUNT + MAIN queries in parallel...');
    const parallelStart = Date.now();

    const [countResult, dataResult] = await Promise.all([
      db.queryDB('Sigma', countQuery, baseParams),
      db.queryDB('Sigma', mainQuery, baseParams),
    ]);

    perfLog.parallelQueries = Date.now() - parallelStart;
    console.log(`   └─ COUNT + MAIN: ${perfLog.parallelQueries}ms`);

    const totalItems = countResult.recordset?.[0]?.totalCount || 0;
    const totalPages = Math.ceil(totalItems / limit);
    const itemsRaw = dataResult.recordset || [];
    console.log(`📊 Found ${totalItems} total items, returning ${itemsRaw.length} items`);

    if (itemsRaw.length === 0) {
      return res.json({
        success: true,
        result: [],
        Data4: [],
        pagination: {
          mode: useSeek ? 'seek' : 'offset',
          page,
          limit,
          totalItems,
          totalPages,
          hasNext: false,
          hasPrev: false,
          itemsOnPage: 0,
          nextAfter: null,
        },
      });
    }

    const codes = itemsRaw.map((r) => r.ItemCode);
    const { inClause, params: codeParams } = buildInClause(codes);

    console.log('⏱️  Fetching Stock + Price + BOM/Reserve in parallel...');
    const dataStart = Date.now();

    const [stockData, priceData, bomData, bomSummary, reserveData] =
      await Promise.all([
        // Stock calculation
        db.queryDB(
          'Sigma',
          `
          SELECT r.itemcode,
                 SUM(r.qbal) AS QBal,
                 SUM(r.qbal) - SUM(ISNULL(r.QD,0)) - SUM(ISNULL(r.QP1,0)) 
                 - SUM(ISNULL(r.qp2,0)) - SUM(ISNULL(r.QP3,0)) - SUM(ISNULL(r.QP4,0)) 
                 + SUM(ISNULL(r.Qs,0)) AS BAL
          FROM DATASIGMA.dbo.rptstock2 AS r WITH (NOLOCK, INDEX(IX_rptstock2_itemcode))
          WHERE r.itemcode IN (${inClause})
          GROUP BY r.itemcode;
        `,
          codeParams
        ),

        // Price range
        db.queryDB(
          'Sigma',
          `
          SELECT ItemCode, MIN(price) AS minPrice, MAX(price) AS maxPrice
          FROM DATASIGMA.dbo.IteminSub WITH (NOLOCK, INDEX(IX_IteminSub_ItemCode))
          WHERE ItemCode IN (${inClause})
          GROUP BY ItemCode;
        `,
          codeParams
        ),

        // BOM items
        db.queryDB(
          'Sigma',
          `
          SELECT a.Code, a.ItemCode, a.ItemName, a.Qty, a.Pack, a.cost, a.costn
          FROM DATASIGMA.dbo.QitemBom a WITH (NOLOCK, INDEX(IX_QitemBom_Code))
          WHERE a.Code IN (${inClause});
        `,
          codeParams
        ),

        // BOM summary
        db.queryDB(
          'Sigma',
          `
          SELECT Code, AmtDM, AmtEXP, AmtCost, DateCN
          FROM DATASIGMA.dbo.bom WITH (NOLOCK, INDEX(IX_bom_Code))
          WHERE Code IN (${inClause});
        `,
          codeParams
        ),

        // ✅ Reserve calculation with BomSub (เหมือนเดิม!)
        db.queryDB(
          'Sigma',
          `
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
                WHERE itemCode IN (${inClause})
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
                  AND a.code IN (${inClause})
              ) tmp
            ) tmp
            LEFT JOIN (
              SELECT 
                a.itemCode,
                SUM(qbal) - SUM(ISNULL(QD, 0)) - SUM(ISNULL(QP1, 0)) - SUM(ISNULL(qp2, 0)) 
                  - SUM(ISNULL(QP3, 0)) - SUM(ISNULL(QP4, 0)) + SUM(ISNULL(Qs, 0)) as BAL
              FROM DATASIGMA.dbo.rptstock2 a WITH (NOLOCK)
              WHERE a.itemCode IN (${inClause})
              GROUP BY a.itemCode
            ) b ON b.itemCode = tmp.item
            WHERE tmp.NUM = CASE WHEN (b.bal - tmp.ReserveQTY) < 0 THEN tmp.NUM ELSE 0 END
          ) Tmp
          GROUP BY itemCode;
        `,
          codeParams
        ),
      ]);

    perfLog.dataQueries = Date.now() - dataStart;
    console.log(`✅ All data queries: ${perfLog.dataQueries}ms`);

    const stockMap = new Map(
      (stockData.recordset || []).map((s) => [s.itemcode, s])
    );
    const priceMap = new Map(
      (priceData.recordset || []).map((p) => [p.ItemCode, p])
    );
    const bomItems = bomData.recordset || [];
    const bomSummaryItems = bomSummary.recordset || [];
    const reserves = reserveData.recordset || [];
    const reserveMap = new Map(reserves.map((r) => [r.itemCode, r]));

    const deptSet = new Set(
      itemsRaw.map((x) => x.DepartName).filter(Boolean)
    );
    const departments = Array.from(deptSet).map((n) => ({ DePartName: n }));

    console.log('⏱️  Merging and formatting data...');
    const mergeStart = Date.now();

    const processedItems = itemsRaw.map((it) => {
      const stock = stockMap.get(it.ItemCode);
      const price = priceMap.get(it.ItemCode);
      const rsv = reserveMap.get(it.ItemCode);
      const reserveVal = rsv ? Number(rsv.calBal || 0) : 0;
      const balVal = Number(stock?.BAL || 0);

      return {
        rowNum: 1,
        ItemCode: it.ItemCode,
        codem: it.codem,
        PriceOffer: it.PriceOffer,
        Name: it.Name,
        Barcode: it.Barcode,
        DepartName: it.DepartName,
        Pack: it.Pack,
        TyItemDm: it.TyItemDm,
        minPrice: fmtMoney(price?.minPrice),
        maxPrice: fmtMoney(price?.maxPrice),
        QBal: fmtMoney(stock?.QBal),
        BAL: fmtMoney(balVal - reserveVal),
        CostN: fmtMoney(it.CostN),
        DateCn: fmtDate(it.DateCn),
        price: fmtMoney(it.price),
        PriceRE: fmtMoney(it.PriceRE),
        datePrice: fmtDate(it.datePrice),
        datePriceRe: fmtDate(it.datepriceRe),
        costNew: fmtMoney(it.costNew),
        Reserve: fmtMoney(reserveVal),
        NewArr: bomItems
          .filter((b) => it.ItemCode === b.Code)
          .map((b) => ({
            ...b,
            Cost: fmtMoney(b.cost),
            CostN: fmtMoney(b.costn),
          })),
        SumArr: bomSummaryItems
          .filter((s) => it.ItemCode === s.Code)
          .map((s) => ({
            ...s,
            AmtDM: fmtMoney(s.AmtDM),
            AmtCost: fmtMoney(s.AmtCost),
            DateCN: fmtDate(s.DateCN),
          })),
      };
    });

    perfLog.merge = Date.now() - mergeStart;
    console.log(`✅ Merge complete: ${perfLog.merge}ms`);

    const nextAfter =
      useSeek && processedItems.length
        ? String(processedItems[processedItems.length - 1].ItemCode)
        : null;

    perfLog.total = Date.now() - startTime;

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎉 [CORRECTED] Completed in ${perfLog.total}ms (${(perfLog.total / 1000).toFixed(2)}s)`);
    console.log(`   ├─ Parallel (COUNT+MAIN): ${perfLog.parallelQueries}ms (${((perfLog.parallelQueries / perfLog.total) * 100).toFixed(1)}%)`);
    console.log(`   ├─ Data queries: ${perfLog.dataQueries}ms (${((perfLog.dataQueries / perfLog.total) * 100).toFixed(1)}%)`);
    console.log(`   ├─ Merge: ${perfLog.merge}ms (${((perfLog.merge / perfLog.total) * 100).toFixed(1)}%)`);
    console.log(`   └─ Items: ${processedItems.length}/${totalItems} (page ${page}/${totalPages})`);
    
    if (perfLog.total < 2000) {
      console.log(`   ✅ EXCELLENT! (Target: <2s, Actual: ${(perfLog.total / 1000).toFixed(2)}s)`);
    } else if (perfLog.total < 3000) {
      console.log(`   ✅ GOOD (Target: <2s, Actual: ${(perfLog.total / 1000).toFixed(2)}s)`);
    } else {
      console.log(`   ⚠️  Needs optimization (Target: <2s, Actual: ${(perfLog.total / 1000).toFixed(2)}s)`);
    }
    console.log(`${'='.repeat(80)}\n`);

    return res.json({
      success: true,
      result: processedItems,
      Data4: departments,
      pagination: {
        mode: useSeek ? 'seek' : 'offset',
        page,
        limit,
        totalItems,
        totalPages,
        hasNext: useSeek
          ? processedItems.length === limit
          : page < totalPages,
        hasPrev: useSeek ? !!afterInput : page > 1,
        itemsOnPage: processedItems.length,
        nextAfter,
      },
      _perf: process.env.NODE_ENV === 'development' ? perfLog : undefined,
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`\n${'='.repeat(80)}`);
    console.error(`❌ Error after ${totalTime}ms: ${error.message}`);
    console.error(`${'='.repeat(80)}\n`);
    console.error('Stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Error fetching table data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/* ======================== GET /subTable ======================== */
router.get('/subTable', verifyToken, async (req, res) => {
  try {
    const { itemCode } = req.query || {};
    let query =
      'SELECT Code, ItemCode, ItemName, Qty, Pack, cost, costn FROM DATASIGMA.dbo.QitemBom WITH (NOLOCK)';
    const params = {};
    if (itemCode) {
      query += ' WHERE Code = @itemCode';
      params.itemCode = itemCode;
    }
    const result = await db.queryDB('Sigma', query, params);
    const rows = (result.recordset || []).map((r) => ({
      ...r,
      Cost: fmtMoney(r.cost),
      CostN: fmtMoney(r.costn),
    }));
    return res.json({ success: true, result: rows });
  } catch (error) {
    console.error('❌ SubTable query error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Error fetching subtable data' });
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