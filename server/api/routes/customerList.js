// server/api/routes/customerList.js
// ✅ ใช้ DatabaseManager เพียว ๆ (db.queryDB) — ไม่ใช้ pool-manager อีก
const express = require('express');
const db = require('../config/database');
const { verifyToken } = require('../middleware/globalAuth');

const router = express.Router();

// ถ้า app หลัก parse JSON/URL-Encoded อยู่แล้ว สามารถลบบรรทัดสองบรรทัดนี้ได้
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

console.log('🧭 customerList router (DBManager-only) initialized');

function parseDDMMYYYY(str) {
  // "dd/MM/yyyy" -> "yyyy-MM-dd"; อินพุตผิดรูปแบบให้คืนค่าว่าง
  if (!str || typeof str !== 'string') return '';
  const [dd, mm, yyyy] = str.split('/');
  if (!dd || !mm || !yyyy) return '';
  return `${yyyy}-${mm}-${dd}`;
}

function toMoney(n) {
  // แสดงทศนิยม 2 หลัก + คอมม่าพัน
  return Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function toIntString(n) {
  return String(Math.round(Number(n || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/* =========================================================================
 * GET /api/customers/  — รายชื่อลูกค้าหลัก
 * ========================================================================= */
router.get('/', verifyToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  console.log('📞 API: GET /api/customers/ - Main customer list');
  console.log('🔐 Authenticated user:', req.user?.name);

  const sql = `
    SELECT 
      Code, 
      Name, 
      CONCAT(ADDR1, ' ', ADDR2) AS addr, 
      Phone, 
      CAST(CONVERT(VARCHAR, CAST(ISNULL(MaxCr, '0') AS MONEY), 1) AS VARCHAR) AS MaxCr, 
      CAST(ISNULL(CRTERM, 0) AS DECIMAL(30,2)) AS CRTERM 
    FROM cust 
    WHERE SUBSTRING(codeSale, 1, 2) = 'RE'
    ORDER BY Name ASC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `;
   const countSql = `
    SELECT COUNT(*) as total 
    FROM cust 
    WHERE SUBSTRING(codeSale, 1, 2) = 'RE'
  `;

  try {
    const [result, countResult] = await Promise.all([
      db.queryDB('SigmaOffice', sql, { offset, limit }),
      db.queryDB('SigmaOffice', countSql)
    ]);

    const total = countResult.recordset[0].total;
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      result: { recordset: result.recordset || [] },
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      success: true,
    });
    console.log(`✅ Returned ${result.recordset?.length || 0} customers to user: ${req.user?.name}`);
  } catch (err) {
    console.error('❌ Customer list error:', err);
    res.status(500).json({
      result: { recordset: [] },
      success: false,
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/* =========================================================================
 * POST /api/customers/selectSummaryUser  — สรุปยอดตาม saleCode + ช่วงวันที่
 * body: { input: { date1Val: 'dd/MM/yyyy', date2Val: 'dd/MM/yyyy' }, saleCode: 'RE007' }
 * ========================================================================= */
router.post('/selectSummaryUser', verifyToken, async (req, res) => {
  console.log('📞 API: POST /api/customers/selectSummaryUser', req.body);
  console.log('🔐 Authenticated user:', req.user?.name);

  const sql = `
    SELECT  
      CustCode,
      CustName,
      CAST(CONVERT(VARCHAR, CAST(ISNULL(SUM(NetAmt), 0.00) AS MONEY), 1) AS VARCHAR) AS NetAmt,  
      CAST(CONVERT(VARCHAR, CAST(ISNULL(SUM(Amt), 0.00) AS MONEY), 1) AS VARCHAR) AS Amt,  
      CAST(CONVERT(VARCHAR, CAST(ISNULL(SUM(Cost), 0.00) AS MONEY), 1) AS VARCHAR) AS Cost, 
      CAST(CONVERT(VARCHAR, CAST(ISNULL(SUM(amtdiff), 0.00) AS MONEY), 1) AS VARCHAR) AS amtdiff, 
      CAST(CONVERT(VARCHAR, CAST(ISNULL(SUM(Coltd), 0.00) AS MONEY), 1) AS VARCHAR) AS Coltd, 
      CAST(CONVERT(VARCHAR, CAST(ISNULL(SUM(CUMSSP), 0.00) AS MONEY), 1) AS VARCHAR) AS CUMSSP, 
      CAST(CONVERT(VARCHAR, CAST(ISNULL(SUM(MS), 0.00) AS MONEY), 1) AS VARCHAR) AS MS,
      CAST(CONVERT(VARCHAR, CAST(ISNULL(SUM(Comsale), 0.00) AS MONEY), 1) AS VARCHAR) AS Comsale,
      CAST(CONVERT(VARCHAR, CAST(ISNULL(SUM(Target), 0) AS INT), 1) AS VARCHAR) AS Target 
    FROM RptAR1G 
    WHERE DocDate BETWEEN @date1 AND @date2 AND saleCode = @salecode 
    GROUP BY CustCode, CustName
    ORDER BY CustName ASC
  `;

  try {
    const date1 = parseDDMMYYYY(req.body?.input?.date1Val);
    const date2 = parseDDMMYYYY(req.body?.input?.date2Val);
    const saleCode = String(req.body?.saleCode || '').trim();

    if (!date1 || !date2 || !saleCode) {
      // ยึดพฤติกรรมเดิม: ถ้าไม่ครบ ให้คืนว่าง (หรือจะ 400 ก็ได้)
      return res.json({
        finalResult: [],
        success: true,
        authenticatedUser: req.user?.name,
        timestamp: new Date().toISOString(),
      });
    }

    const result = await db.queryDB('SigmaOffice', sql, {
      date1,
      date2,
      salecode: saleCode,
    });

    // รวมยอดจากผลลัพธ์ (แปลง string เงินกลับเป็น number)
    const totals = {
      sumNetAmt: 0, sumAmt: 0, sumCost: 0, sumamtdiff: 0,
      sumColtd: 0, sumCUMSSP: 0, sumMS: 0, sumComsale: 0, sumTarget: 0,
    };

    const rows = result.recordset || [];
    const parseNum = (v) => (v ? parseFloat(String(v).replaceAll(',', '')) : 0);

    rows.forEach((r) => {
      totals.sumNetAmt  += parseNum(r.NetAmt);
      totals.sumAmt     += parseNum(r.Amt);
      totals.sumCost    += parseNum(r.Cost);
      totals.sumamtdiff += parseNum(r.amtdiff);
      totals.sumColtd   += parseNum(r.Coltd);
      totals.sumCUMSSP  += parseNum(r.CUMSSP);
      totals.sumMS      += parseNum(r.MS);
      totals.sumComsale += parseNum(r.Comsale);
      totals.sumTarget  += parseNum(r.Target);
    });

    // จัดรูปผลลัพธ์ให้มีรายการ "รวม" ต่อท้าย (key '110' ตามโค้ดเดิมของคุณ)
    const finalResult = {
      ...rows,
      '110': {
        CustCode: 'รวม',
        NetAmt:  toMoney(totals.sumNetAmt),
        Amt:     toMoney(totals.sumAmt),
        Cost:    toMoney(totals.sumCost),
        amtdiff: toMoney(totals.sumamtdiff),
        Coltd:   toMoney(totals.sumColtd),
        CUMSSP:  toMoney(totals.sumCUMSSP),
        MS:      toMoney(totals.sumMS),
        Comsale: toMoney(totals.sumComsale),
        Target:  toIntString(totals.sumTarget),
      },
    };

    res.json({
      finalResult,
      success: true,
      authenticatedUser: req.user?.name,
      timestamp: new Date().toISOString(),
    });

    console.log(`✅ Summary returned for sale code: ${saleCode}, user: ${req.user?.name}`);
  } catch (err) {
    console.error('❌ Summary error:', err);
    res.status(500).json({
      finalResult: [],
      success: false,
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/* =========================================================================
 * GET /api/customers/custReg  — ตาราง custREG
 * ========================================================================= */
router.get('/custReg', verifyToken, async (req, res) => {
  console.log('📞 API: GET /api/customers/custReg');
  console.log('🔐 Authenticated user:', req.user?.name);

  const sql = 'SELECT * FROM custREG ';

  try {
    const result = await db.queryDB('SigmaOffice', sql);
    res.json({
      result: { recordset: result.recordset || [] },
      success: true,
      authenticatedUser: req.user?.name,
      timestamp: new Date().toISOString(),
    });
    console.log(`✅ Customer registration returned: ${result.recordset?.length || 0} records`);
  } catch (err) {
    console.error('❌ Customer registration error:', err);
    res.status(500).json({
      result: { recordset: [] },
      success: false,
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/* =========================================================================
 * GET /api/customers/custCode?custCode=XXX&date1=dd/MM/yyyy&date2=dd/MM/yyyy
 * ========================================================================= */
router.get('/custCode', verifyToken, async (req, res) => {
  console.log('📞 API: GET /api/customers/custCode', req.query);
  console.log('🔐 Authenticated user:', req.user?.name);

  const sql = `
    SELECT 
      FORMAT(docdate, 'dd/MM/yyyy') AS docdate, 
      DocNo,
      ItemCode, 
      ItemName,
      PackSale, 
      CAST(CONVERT(VARCHAR, CAST(ISNULL(SUM(Price), '0.00') AS MONEY), 1) AS VARCHAR) AS Price,  
      CAST(CONVERT(VARCHAR, CAST(ISNULL(SUM(priceSale), '0.00') AS MONEY), 1) AS VARCHAR) AS priceSale,  
      CAST(CONVERT(VARCHAR, CAST(ISNULL(SUM(QtySale), '0.00') AS MONEY), 1) AS VARCHAR) AS QtySale, 
      CAST(CONVERT(VARCHAR, CAST(ISNULL(SUM(Amt), '0.00') AS MONEY), 1) AS VARCHAR) AS Amt, 
      CAST(CONVERT(VARCHAR, CAST(ISNULL(SUM(Amtdiff), '0.00') AS MONEY), 1) AS VARCHAR) AS Margin, 
      CAST(CONVERT(VARCHAR, CAST(ISNULL(SUM(NetAmt), '0.00') AS MONEY), 1) AS VARCHAR) AS NetAmt, 
      CAST(CONVERT(VARCHAR, CAST(ISNULL(SUM(QtyPackD), '0.00') AS MONEY), 1) AS VARCHAR) AS QtyPackD,
      Package,
      PackD  
    FROM RptAr1N  
    WHERE DocDate BETWEEN @date1 AND @date2 AND CustCode = @custCode  
    GROUP BY DocNo, ItemName, Docdate, PackSale, Package, PackD, ItemCode
    ORDER BY docdate DESC, DocNo ASC
  `;

  try {
    let { custCode, date1, date2 } = req.query;
    const date1Query = parseDDMMYYYY(date1);
    const date2Query = parseDDMMYYYY(date2);
    custCode = String(custCode || '').trim();

    if (!custCode || !date1Query || !date2Query) {
      // พฤติกรรมเดิมของคุณคือคืนผลว่างเมื่อพารามิเตอร์ไม่ครบ
      return res.json({
        finalResult: [],
        success: true,
        authenticatedUser: req.user?.name,
        timestamp: new Date().toISOString(),
      });
    }

    const result = await db.queryDB('SigmaOffice', sql, {
      date1: date1Query,
      date2: date2Query,
      custCode,
    });

    const rows = result.recordset || [];
    const parseNum = (v) => (v ? parseFloat(String(v).replaceAll(',', '')) : 0);

    const totals = {
      sumPrice: 0, sumPriceSale: 0, sumQtySale: 0, sumAmt: 0,
      sumMargin: 0, sumNetAmt: 0, sumQtyPackD: 0,
    };

    rows.forEach((r) => {
      totals.sumPrice     += parseNum(r.Price);
      totals.sumPriceSale += parseNum(r.priceSale);
      totals.sumQtySale   += parseNum(r.QtySale);
      totals.sumAmt       += parseNum(r.Amt);
      totals.sumMargin    += parseNum(r.Margin);
      totals.sumNetAmt    += parseNum(r.NetAmt);
      totals.sumQtyPackD  += parseNum(r.QtyPackD);
    });

    const finalResult = {
      ...rows,
      '110': {
        DocNo:   'รวม',
        Price:   toMoney(totals.sumPrice),
        priceSale: toMoney(totals.sumPriceSale),
        QtySale: toMoney(totals.sumQtySale),
        Amt:     toMoney(totals.sumAmt),
        Margin:  toMoney(totals.sumMargin),
        NetAmt:  toMoney(totals.sumNetAmt),
        QtyPackD: toMoney(totals.sumQtyPackD),
      },
    };

    res.json({
      finalResult,
      success: true,
      authenticatedUser: req.user?.name,
      timestamp: new Date().toISOString(),
    });

    console.log(`✅ Customer details returned for: ${custCode}, user: ${req.user?.name}`);
  } catch (err) {
    console.error('❌ Customer details error:', err);
    res.status(500).json({
      finalResult: [],
      success: false,
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/* =========================================================================
 * Error handler ของ router
 * ========================================================================= */
router.use((err, req, res, next) => {
  console.error('❌ Router error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: 'Internal server error',
    error: err.message,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
