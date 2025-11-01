// server/api/routes/productList.js
// ========================================
// COMPLETE, POOL-FREE, BACKWARD-COMPATIBLE
// ========================================
const express = require('express');
const router = express.Router();

const db = require('../config/database');         // ✅ ใช้ DatabaseManager -> db.queryDB
const cache = require('../config/cache');
const { verifyToken } = require('../middleware/globalAuth'); // ✅ ตัวเดียวพอ

// ============================================
// Helpers
// ============================================
function formatDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getItemType(tyItem) {
  const typeMap = { '1': 'RM', '2': 'TE', '3': 'SI', '4': 'SF' };
  return typeMap[tyItem] || '';
}

/** Core query + pagination */
async function queryProducts({
  page = 1,
  limit = 50,
  departCode = '',
  search = '',
  sortBy = 'ItemCode',
  sortOrder = 'ASC'
}) {
  const offset = (page - 1) * limit;

  const whereConds = ['1=1'];
  const params = { offset: +offset, limit: +limit };

  if (departCode) {
    whereConds.push('DepartCode = @departCode');
    params.departCode = departCode;
  }
  if (search) {
    whereConds.push('(ItemCode LIKE @search OR Name LIKE @search)');
    params.search = `%${search}%`;
  }

  const allowedOrder = new Set(['ItemCode', 'Name', 'DepartCode', 'CostN', 'Price']);
  const orderCol = allowedOrder.has(sortBy) ? sortBy : 'ItemCode';
  const orderDir = String(sortOrder).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const sql = `
    WITH ProductData AS (
      SELECT
        ItemCode,
        Name,
        Pack,
        DepartCode,
        DepartName,
        CostN,
        Price,
        PriceRE,
        DateCN,
        DatePrice,
        DatePriceRE,
        TyItemDm,
        ROW_NUMBER() OVER (ORDER BY ${orderCol} ${orderDir}) AS RowNum,
        COUNT(*) OVER() AS TotalCount
      FROM dbo.ItemDm WITH (NOLOCK)
      WHERE ${whereConds.join(' AND ')}
    )
    SELECT *
    FROM ProductData
    WHERE RowNum > @offset AND RowNum <= (@offset + @limit)
  `;

  const result = await db.queryDB('Sigma', sql, params);
  const rows = result.recordset || [];
  const total = rows[0]?.TotalCount || 0;

  return {
    data: rows,
    pagination: {
      page: +page,
      limit: +limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / Math.max(1, limit))),
      hasNext: +page < Math.max(1, Math.ceil(total / Math.max(1, limit))),
      hasPrev: +page > 1
    }
  };
}

// ============================================
// GET Endpoints
// ============================================

// Legacy Users endpoint (เก็บไว้เพื่อ BC)
router.get('/', verifyToken, async (req, res) => {
  try {
    const sql = 'SELECT * FROM UNoGroup.dbo.Users';
    // ⚠️ ชื่อ connection ให้ใช้ตามที่ตั้งใน DatabaseManager ของคุณ
    const result = await db.queryDB('Unogroup', sql);
    res.json({ result });
  } catch (error) {
    console.error('❌ GET /productList error:', error);
    res.status(500).json({ result: 'Error', message: error.message });
  }
});

router.get('/list', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, departCode = '', search = '', sortBy = 'ItemCode', sortOrder = 'ASC' } = req.query;

    const cacheKey = `products:list:${page}:${limit}:${departCode}:${search}:${sortBy}:${sortOrder}`;
    const cached = await cache.get?.(cacheKey);
    if (cached) return res.json(cached);

    const response = await queryProducts({
      page: Number(page),
      limit: Number(limit),
      departCode,
      search,
      sortBy,
      sortOrder
    });

    await cache.set?.(cacheKey, response, 120);
    res.json(response);
  } catch (error) {
    console.error('❌ GET /productList/list:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Legacy client (table) — เพิ่ม “data” + “result.recordset” ให้คลไคลเอนต์อ่านได้ทั้งเก่า/ใหม่
router.post('/table', verifyToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      departCode = '',
      search = '',
      sortBy = 'ItemCode',
      sortOrder = 'ASC',
      e // legacy param
    } = req.body || {};

    const response = await queryProducts({
      page: Number(page),
      limit: Number(limit),
      departCode: departCode || e || '',
      search,
      sortBy,
      sortOrder
    });

    // ✅ รองรับทั้งสองฟอร์แมต (client จะเลือกอ่านเอง)
    res.json({
      // legacy shape
      result: { recordset: response.data },
      Data4: null,
      // new shape
      data: response.data,
      pagination: response.pagination
    });
  } catch (error) {
    console.error('❌ POST /productList/table:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/subTable', verifyToken, async (req, res) => {
  try {
    const { itemCode } = req.query;
    if (!itemCode) return res.status(400).json({ message: 'Missing itemCode' });

    const sql = `
      SELECT TOP (100)
        s.Code, s.ItemCode, s.ItemName, s.Qty, s.Pack, s.Cost, s.CostN,
        ISNULL(b.AmtEXP,0) AS AmtEXP, ISNULL(b.AmtCost,0) AS AmtCost, ISNULL(b.AmtDM,0) AS AmtDM
      FROM DATASIGMA.dbo.BomSub s WITH (NOLOCK)
      LEFT JOIN DATASIGMA.dbo.Bom b WITH (NOLOCK) ON b.Code = s.Code
      WHERE s.ItemCode = @itemCode
      ORDER BY s.Code
    `;
    const result = await db.queryDB('Sigma', sql, { itemCode });
    res.json({ result: { recordset: result.recordset || [] } });
  } catch (error) {
    console.error('❌ GET /productList/subTable:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ============================================
// PUT Endpoint (update cost/price/priceRe)
// ============================================
router.put('/', verifyToken, async (req, res) => {
  try {
    const { itemRowAll, inputValue, columnInput } = req.body;

    const tyItem = itemRowAll?.TyItemDm;
    const item = itemRowAll?.ItemCode || itemRowAll?.itemcode;  // 🔧 รองรับ key สองแบบ
    const itemName = itemRowAll?.Name;
    const pack = itemRowAll?.Pack;
    const value = inputValue;
    const type = columnInput;

    if (!item || value == null || !type) {
      return res.status(400).json({ result: 'Error', message: 'Missing required fields' });
    }

    const dateToday = formatDate();
    const itemType = getItemType(tyItem);

    // ---- TYPE: COST (cascade) ----
    if (type === 'cost') {
      const sql = `
        -- 1) BomSub
        UPDATE DATASIGMA.dbo.BomSub
        SET Cost = @value,
            CostN = CAST(CAST(@value AS FLOAT) * qty / 1000 AS VARCHAR),
            DateN = GETDATE()
        WHERE ItemCode = @item;

        -- 2) Bom (recalc by QSumBom)
        UPDATE a
        SET AmtDM = (SELECT CostN FROM DATASIGMA.dbo.QSumBom WHERE Code = b.Code),
            AmtCost = (SELECT CostN FROM DATASIGMA.dbo.QSumBom WHERE Code = b.Code) + AmtEXP
        FROM DATASIGMA.dbo.Bom AS a
        INNER JOIN DATASIGMA.dbo.BomSub AS b ON b.Code = a.Code
        WHERE b.ItemCode = @item;

        -- 3) ItemDm direct
        UPDATE DATASIGMA.dbo.ItemDm
        SET CostN = @value, DateCN = GETDATE()
        WHERE ItemCode = @item;

        -- 4) ItemDm from QSumBom
        UPDATE a
        SET CostN = b.CostN, DateCN = GETDATE()
        FROM DATASIGMA.dbo.ItemDm a
        INNER JOIN DATASIGMA.dbo.QSumBom b ON b.code = a.itemcode
        INNER JOIN DATASIGMA.dbo.BomSub c ON c.code = b.code
        WHERE c.itemcode = @item;

        -- 5) Nested BomSub
        UPDATE b
        SET Cost = c.AmtDM,
            CostN = CAST(CAST(c.AmtDM AS FLOAT) * b.qty / 1000 AS VARCHAR)
        FROM ( SELECT * FROM DATASIGMA.dbo.BomSub a WHERE a.ItemCode = @item ) a
        INNER JOIN DATASIGMA.dbo.BomSub b ON b.ItemCode = a.code
        INNER JOIN DATASIGMA.dbo.QItemBom c ON c.Code = a.Code AND c.ItemCode = a.itemCode;
      `;
      await db.queryDB('Sigma', sql, { value, item });
      await cache.del?.('products:*');
      return res.json({ result: { success: true } });
    }

    // ---- TYPE: PRICE (with doc history) ----
    if (type === 'price') {
      const updateSql = `
        UPDATE DATASIGMA.dbo.ItemDm
        SET Price = @value, DatePrice = GETDATE()
        WHERE ItemCode = @item;
      `;
      await db.queryDB('Sigma', updateSql, { value, item });

      const checkSql = `
        SELECT TOP 1 FORMAT(DocDate, 'yyyy-MM-dd') AS DocDate, DocNo
        FROM DATASIGMA.dbo.ItemPrice
        WHERE MONTH(DocDate) = MONTH(GETDATE()) AND YEAR(DocDate) = YEAR(GETDATE())
        ORDER BY RIGHT(DocNo,4) DESC
      `;
      let docRecord = (await db.queryDB('Sigma', checkSql)).recordset?.[0] || { DocDate: '', DocNo: '' };

      if (docRecord.DocDate !== dateToday) {
        const insertDocSql = `
          INSERT INTO DATASIGMA.dbo.ItemPrice (DocNo, QNo, DocDate, EmpCode, MonthCal, GrItem)
          VALUES (
            (SELECT CONCAT('P-', RIGHT(FORMAT(GETDATE(), 'yyyy') + 543, 2), FORMAT(GETDATE(), 'MM'),
                    (SELECT FORMAT(COALESCE(
                      (SELECT MAX(b.DocNo) FROM (SELECT RIGHT(DocNo,4) AS DocNo
                       FROM DATASIGMA.dbo.ItemPrice a
                       WHERE MONTH(DocDate)=MONTH(GETDATE()) AND YEAR(DocDate)=YEAR(GETDATE())) b) + 1,'0001'),'0000')))),
            (SELECT COALESCE(
              (SELECT MAX(b.DocNo) FROM (SELECT RIGHT(DocNo,4) AS DocNo
               FROM DATASIGMA.dbo.ItemPrice a
               WHERE MONTH(DocDate)=MONTH(GETDATE()) AND YEAR(DocDate)=YEAR(GETDATE())) b) + 1,'0001')),
            GETDATE(),'ADMIN',MONTH(GETDATE()),@TypeMain
          )
        `;
        await db.queryDB('Sigma', insertDocSql, { TypeMain: itemType });
        docRecord = (await db.queryDB('Sigma', checkSql)).recordset?.[0];
      }

      const insertSubSql = `
        INSERT INTO DATASIGMA.dbo.ItemPriceSub
          (DocNo, IDNO, Code, Name, Pack, GrItem, Price, DatePrice)
        VALUES (
          @docNo,
          (SELECT COALESCE(STR((SELECT TOP 1 IDNo
            FROM DATASIGMA.dbo.ItemPriceSub WHERE DocNo=@docNo ORDER BY IDNo DESC) + 1),'1')),
          @code, @itemName, @pack, @Type, @values, GETDATE()
        )
      `;
      await db.queryDB('Sigma', insertSubSql, {
        docNo: docRecord.DocNo, code: item, itemName, pack, Type: itemType, values: value
      });

      await cache.del?.('products:*');
      return res.json({ result: { success: true } });
    }

    // ---- TYPE: PRICERE (with ItemF + doc history) ----
    if (type === 'priceRe') {
      const updateSql = `
        UPDATE DATASIGMA.dbo.ItemDm
          SET PriceRE = @value, DatePriceRE = GETDATE()
        WHERE ItemCode = @item;

        UPDATE ItemF
          SET CU = @value, DateADD = GETDATE(),
              CP = Rpack * CAST(@value AS FLOAT) / RpackRPT,
              TOT = COP + (Rpack * CAST(@value AS FLOAT) / RpackRPT),
              PriceSale = ROUND((COP + (Rpack * CAST(@value AS FLOAT) / RpackRPT)),0)
                          + Depart.RateCOP * (COP + (Rpack * CAST(@value AS FLOAT) / RpackRPT)) / 100
        FROM ItemF, Depart
        WHERE ItemF.Departcode = Depart.code AND ItemF.ItemCode = @item;
      `;
      await db.queryDB('Sigma', updateSql, { value, item });

      const checkSql = `
        SELECT TOP 1 FORMAT(DocDate, 'yyyy-MM-dd') AS DocDate, DocNo
        FROM DATASIGMA.dbo.ItemPriceRE
        WHERE MONTH(DocDate)=MONTH(GETDATE()) AND YEAR(DocDate)=YEAR(GETDATE())
        ORDER BY RIGHT(DocNo,4) DESC
      `;
      let docRecord = (await db.queryDB('Sigma', checkSql)).recordset?.[0] || { DocDate: '', DocNo: '' };

      if (docRecord.DocDate !== dateToday) {
        const insertDocSql = `
          INSERT INTO DATASIGMA.dbo.ItemPriceRE (DocNo, QNo, DocDate, EmpCode, MonthCal, GrItem)
          VALUES (
            (SELECT CONCAT('PRE-', RIGHT(FORMAT(GETDATE(), 'yyyy') + 543, 2), FORMAT(GETDATE(), 'MM'),
                    (SELECT FORMAT(COALESCE(
                      (SELECT MAX(b.DocNo) FROM (SELECT RIGHT(DocNo,4) AS DocNo
                       FROM DATASIGMA.dbo.ItemPriceRE a
                       WHERE MONTH(DocDate)=MONTH(GETDATE()) AND YEAR(DocDate)=YEAR(GETDATE())) b) + 1,'0001'),'0000')))),
            (SELECT COALESCE(
              (SELECT MAX(b.DocNo) FROM (SELECT RIGHT(DocNo,4) AS DocNo
               FROM DATASIGMA.dbo.ItemPriceRE a
               WHERE MONTH(DocDate)=MONTH(GETDATE()) AND YEAR(DocDate)=YEAR(GETDATE())) b) + 1,'0001')),
            GETDATE(),'ADMIN',MONTH(GETDATE()),@TypeMain
          )
        `;
        await db.queryDB('Sigma', insertDocSql, { TypeMain: itemType });
        docRecord = (await db.queryDB('Sigma', checkSql)).recordset?.[0];
      }

      const insertSubSql = `
        INSERT INTO DATASIGMA.dbo.ItemPriceRESub
          (DocNo, IDNO, Code, Name, Pack, GrItem, PriceRE, DatePriceRE)
        VALUES (
          @docNo,
          (SELECT COALESCE(STR((SELECT TOP 1 IDNo
            FROM DATASIGMA.dbo.ItemPriceRESub WHERE DocNo=@docNo ORDER BY IDNo DESC)+1),'1')),
          @code, @itemName, @pack, @Type, @values, GETDATE()
        )
      `;
      await db.queryDB('Sigma', insertSubSql, {
        docNo: docRecord.DocNo, code: item, itemName, pack, Type: itemType, values: value
      });

      await cache.del?.('products:*');
      return res.json({ result: { success: true } });
    }

    return res.status(400).json({ result: 'Error', message: 'Invalid update type' });
  } catch (error) {
    console.error('❌ PUT /productList:', error);
    res.status(500).json({ result: 'Error', message: error.message });
  }
});

// ============================================
// Error Handler
// ============================================
router.use((err, req, res, next) => {
  console.error('❌ Router Error:', err);
  res.status(err.status || 500).json({
    result: 'Error',
    message: err.message || 'Internal server error'
  });
});

module.exports = router;
