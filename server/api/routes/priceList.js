// ============================================
// server/api/routes/priceList.js
// Version: แก้ DatePriceList ซ้ำ
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const cache = require('../config/cache');
const { verifyToken } = require('../middleware/globalAuth');

// ============================================
// GET /list - Price List with Pagination
// ============================================
router.get('/list', verifyToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      departCode = '',
      sortBy = 'ItemCode',
      sortOrder = 'ASC' 
    } = req.query;

    const offset = (page - 1) * limit;

    // Check cache first
    const cacheKey = `prices:${page}:${limit}:${search}:${departCode}:${sortBy}:${sortOrder}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      console.log('✅ Cache hit for price list');
      return res.json(cached);
    }

    console.log('🔍 Fetching price list:', { page, limit, search, departCode, sortBy, sortOrder });

    // ✅ Whitelist allowed sort columns
    const allowedSortColumns = {
      'ItemCode': 'a.ItemCode',
      'itemCode': 'a.ItemCode',
      'DepartCode': 'a.DepartCode',
      'departCode': 'a.DepartCode',
      'Name': 'a.Name',
      'name': 'a.Name',
      'NameFG': 'a.NameFG',
      'nameFG': 'a.NameFG'
    };

    const sortColumn = allowedSortColumns[sortBy] || 'a.DepartCode, a.NameFG';
    const sortDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Build WHERE clause
    let whereConditions = ['1=1'];
    const queryParams = {
      offset: parseInt(offset),
      limit: parseInt(limit)
    };

    if (search) {
      whereConditions.push(`(a.ItemCode LIKE @search OR a.name LIKE @search OR a.NameFG LIKE @search OR a.NameFGS LIKE @search)`);
      queryParams.search = `%${search}%`;
    }

    if (departCode) {
      whereConditions.push(`a.DepartCode = @departCode`);
      queryParams.departCode = departCode;
    }

    // ✅ Query ตามโค้ดเก่า - แก้ DatePriceList ซ้ำแล้ว
    const query = `
      WITH StockSummary AS (
        -- คำนวณ BAL จาก columns จริงใน rptstock2
        SELECT  
          itemcode,
          name,
          SUM(qbal) as QBal,
          pack,
          SUM(qbal) - SUM(QD) - SUM(QP1) - SUM(qp2) - SUM(QP3) - SUM(QP4) + SUM(Qs) as BAL,
          Note
        FROM DATASIGMA.dbo.rptstock2 WITH (NOLOCK)
        GROUP BY itemcode, name, pack, Note
      ),
      ReserveByCust AS (
        SELECT 
          itemCode,
          code,
          NameFGS,
          SUM(QTY) as QTY
        FROM DATASIGMA.dbo.ReserveProduct WITH (NOLOCK)
        GROUP BY itemCode, code, NameFGS
      ),
      ReserveTotal AS (
        SELECT 
          itemCode,
          SUM(QTY) as QTY
        FROM DATASIGMA.dbo.ReserveProduct WITH (NOLOCK)
        GROUP BY itemCode
      ),
      FilteredData AS (
        SELECT 
          ROW_NUMBER() OVER (ORDER BY ${sortColumn} ${sortDirection}) as number,
          CAST(CONVERT(VARCHAR, CAST(ISNULL((b.BAL - ISNULL(d.QTY, 0)), '0.00') AS MONEY), 1) AS VARCHAR) as bal,
          b.pack,
          a.code,
          a.name,
          a.ItemCode,
          a.Rpack,
          a.PackR,
          a.RpackSale,
          a.PackD,
          a.PackSale,
          a.RPackRpt,
          CONCAT(a.Rpack, ' ', a.PackR, ' x ', a.RpackSale) as containProduct,
          CAST(CONVERT(VARCHAR, CAST(a.CU AS MONEY), 1) AS VARCHAR) as CU,
          CAST(CONVERT(VARCHAR, CAST(a.CP AS MONEY), 1) AS VARCHAR) as CP,
          CAST(CONVERT(VARCHAR, CAST(a.COP AS MONEY), 1) AS VARCHAR) as COP,
          CAST(CONVERT(VARCHAR, CAST(a.TOT AS MONEY), 1) AS VARCHAR) as TOT,
          FORMAT(a.DateAdd, 'dd/MM/yyyy') as DateAdd,
          a.DepartCode,
          a.DepartName,
          a.NameFG,
          a.NameFGS,
          CAST(CONVERT(VARCHAR, CAST(ISNULL(a.Pricelist, '0.00') AS MONEY), 1) AS VARCHAR) as priceList,
          FORMAT(a.DatePriceList, 'dd/MM/yyyy') as datePriceList,
          ISNULL(a.NoteF, '') as NoteF,
          CAST(CONVERT(VARCHAR, CAST(a.Price10 AS MONEY), 1) AS VARCHAR) as Price10,
          a.AmtF10,
          CAST(CONVERT(VARCHAR, CAST(a.Price25 AS MONEY), 1) AS VARCHAR) as Price25,
          a.AmtF25,
          CAST(CONVERT(VARCHAR, CAST(a.Price50 AS MONEY), 1) AS VARCHAR) as Price50,
          a.AmtF50,
          CAST(CONVERT(VARCHAR, CAST(a.Price100 AS MONEY), 1) AS VARCHAR) as Price100,
          a.AmtF100,
          ISNULL(CAST(CONVERT(VARCHAR, CAST(c.QTY AS MONEY), 1) AS VARCHAR), '0.00') as Reserve,
          -- ✅ ลบ DatePriceList ที่ซ้ำออก (เก็บไว้แค่ datePriceList ด้านบน)
          CAST(ISNULL(a.point, 0) AS VARCHAR) as point,
          a.RateSP,
          ROW_NUMBER() OVER (ORDER BY ${sortColumn} ${sortDirection}) as RowNum,
          COUNT(*) OVER() as TotalCount
        FROM DATASIGMA.dbo.ItemF a WITH (NOLOCK)
        INNER JOIN StockSummary b ON b.itemcode = a.ItemCode
        LEFT JOIN ReserveByCust c ON c.itemCode = a.ItemCode 
          AND c.code = a.code 
          AND c.NameFGS = a.NameFGS
        LEFT JOIN ReserveTotal d ON d.itemCode = a.ItemCode
        WHERE ${whereConditions.join(' AND ')}
      )
      SELECT 
        number, bal, pack, code, name, ItemCode, Rpack, PackR, RpackSale, 
        PackD, PackSale, RPackRpt, containProduct, CU, CP, COP, TOT, 
        DateAdd, DepartCode, DepartName, NameFG, NameFGS, priceList, 
        datePriceList, NoteF, Price10, AmtF10, Price25, AmtF25, Price50, 
        AmtF50, Price100, AmtF100, Reserve, point, RateSP, TotalCount
      FROM FilteredData
      WHERE RowNum > @offset AND RowNum <= (@offset + @limit)
      ORDER BY RowNum
    `;

    console.log('🗄️ Executing SQL query...');
    console.log('📊 Query params:', queryParams);
    console.log('📊 Sort by:', sortColumn, sortDirection);

    const result = await db.queryDB('Sigma', query, queryParams);

    console.log(`✅ Query returned ${result.recordset?.length || 0} rows`);

    const response = {
      data: result.recordset || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.recordset[0]?.TotalCount || 0,
        totalPages: Math.ceil((result.recordset[0]?.TotalCount || 0) / limit)
      }
    };

    console.log('📄 Pagination:', response.pagination);

    // Cache for 1 minute
    await cache.set(cacheKey, response, 60);

    res.json(response);

  } catch (error) {
    console.error('❌ Error fetching price list:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      number: error.number,
      state: error.state,
      lineNumber: error.lineNumber
    });
    
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// PUT /update - Update Price (individual field)
// ============================================
router.put('/update', verifyToken, async (req, res) => {
  try {
    const { itemRowAll, inputValue, columnInput } = req.body;

    if (!itemRowAll || !columnInput) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const ItemCode = itemRowAll.ItemCode;
    let value = inputValue;
    const NameFGS = itemRowAll.NameFGS;
    const code = itemRowAll.code;
    const type = columnInput;

    console.log('📝 Updating price:', { ItemCode, NameFGS, code, type, value });

    let sql = '';
    const params = {
      value: value,
      ItemCode: ItemCode,
      NameFGS: NameFGS,
      code: code
    };

    // Build UPDATE query based on type
    switch(type) {
      case 'note':
        sql = `
          UPDATE DATASIGMA.dbo.itemF 
          SET NoteF = @value
          WHERE ItemCode = @ItemCode AND NameFGS = @NameFGS AND Code = @code
        `;
        break;
        
      case 'price10':
        sql = `
          UPDATE DATASIGMA.dbo.itemF 
          SET Price10 = ROUND(@value, 0)
          WHERE ItemCode = @ItemCode AND NameFGS = @NameFGS AND Code = @code
        `;
        break;
        
      case 'AmtF10':
        if (value === '-') value = '0';
        params.value = value;
        sql = `
          UPDATE DATASIGMA.dbo.itemF 
          SET AmtF10 = @value
          WHERE ItemCode = @ItemCode AND NameFGS = @NameFGS AND Code = @code
        `;
        break;
        
      case 'price25':
        sql = `
          UPDATE DATASIGMA.dbo.itemF 
          SET Price25 = ROUND(@value, 0)
          WHERE ItemCode = @ItemCode AND NameFGS = @NameFGS AND Code = @code
        `;
        break;
        
      case 'AmtF25':
        sql = `
          UPDATE DATASIGMA.dbo.itemF 
          SET AmtF25 = @value
          WHERE ItemCode = @ItemCode AND NameFGS = @NameFGS AND Code = @code
        `;
        break;
        
      case 'price50':
        sql = `
          UPDATE DATASIGMA.dbo.itemF 
          SET Price50 = ROUND(@value, 0)
          WHERE ItemCode = @ItemCode AND NameFGS = @NameFGS AND Code = @code
        `;
        break;
        
      case 'AmtF50':
        sql = `
          UPDATE DATASIGMA.dbo.itemF 
          SET AmtF50 = @value
          WHERE ItemCode = @ItemCode AND NameFGS = @NameFGS AND Code = @code
        `;
        break;
        
      case 'price100':
        sql = `
          UPDATE DATASIGMA.dbo.itemF 
          SET Price100 = ROUND(@value, 0)
          WHERE ItemCode = @ItemCode AND NameFGS = @NameFGS AND Code = @code
        `;
        break;
        
      case 'AmtF100':
        sql = `
          UPDATE DATASIGMA.dbo.itemF 
          SET AmtF100 = @value
          WHERE ItemCode = @ItemCode AND NameFGS = @NameFGS AND Code = @code
        `;
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid column type' });
    }

    const result = await db.queryDB('Sigma', sql, params);

    console.log('✅ Price updated successfully');

    // Clear cache
    await cache.del('prices:*');

    res.json({ result });

  } catch (error) {
    console.error('❌ Error updating price:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// POST /updatePriceList - Update PriceList (bulk with calculation)
// ============================================
router.post('/updatePriceList', verifyToken, async (req, res) => {
  try {
    const { itemRowAll, inputValue, columnInput } = req.body;

    if (!itemRowAll || columnInput !== 'priceList') {
      return res.status(400).json({ message: 'Invalid request for price list update' });
    }

    const DepartName = itemRowAll.DepartName;
    const ItemCode = itemRowAll.ItemCode;
    const value = inputValue;
    const itemName = itemRowAll.name;
    const DepartCode = itemRowAll.DepartCode;
    const RpackSale = itemRowAll.RpackSale;
    const PackR = itemRowAll.PackR;
    const Rpack = itemRowAll.Rpack;
    const NameFGS = itemRowAll.NameFGS;
    const NameFG = itemRowAll.NameFG;
    const code = itemRowAll.code;

    console.log('📝 Updating price list:', { ItemCode, DepartName, value });

    const date1 = new Date();
    const dateToday = date1.getFullYear() + '-' + 
                      ('0' + (date1.getMonth() + 1)).slice(-2) + '-' + 
                      ('0' + date1.getDate()).slice(-2);

    // 1. Update ItemF with price calculation
    const sqlUpdate = `
      UPDATE a 
      SET 
        a.Pricelist = @value,
        a.DatePriceList = GETDATE(),
        a.Price10 = ROUND((@value - (@value * Disc10/100)), 0),
        a.Price25 = ROUND((@value - (@value * Disc25/100)), 0),
        a.Price50 = ROUND((@value - (@value * Disc50/100)), 0),
        a.Price100 = ROUND((@value - (@value * Disc100/100)), 0),
        a.AmtF10 = b.AmtF10,
        a.AmtF25 = b.AmtF25,
        a.AmtF50 = b.AmtF50,
        a.AmtF100 = b.AmtF100
      FROM DATASIGMA.dbo.itemF a 
      INNER JOIN DATASIGMA.dbo.Depart b ON b.Name = a.DePartName
      WHERE a.ItemCode = @ItemCode 
        AND a.NameFGS = @NameFGS 
        AND a.Code = @code
    `;

    await db.queryDB('Sigma', sqlUpdate, {
      value: value,
      ItemCode: ItemCode,
      NameFGS: NameFGS,
      code: code
    });

    // 2. Check for existing doc today
    const checkInsert = `
      SELECT TOP 1 
        FORMAT(DocDate, 'yyyy-MM-dd') as DocDate,
        DocNo
      FROM DATASIGMA.dbo.ItemPricePack
      WHERE MONTH(DocDate) = MONTH(GETDATE()) 
        AND YEAR(DocDate) = YEAR(GETDATE())
      ORDER BY RIGHT(DocNo, 4) DESC
    `;

    const dataCheck = await db.queryDB('Sigma', checkInsert, {});
    let arrRecord = dataCheck.recordset[0];

    // 3. Create new doc if needed
    if (!arrRecord || arrRecord.DocDate !== dateToday) {
      const insertDocNO = `
        INSERT INTO DATASIGMA.dbo.ItemPricePack (DocNo, QNo, DocDate, EmpCode, MonthCal, GrItem)
        VALUES (
          (SELECT CONCAT('PAC', '-', RIGHT(FORMAT(GETDATE(), 'yyyy') + 543, 2),
            FORMAT(GETDATE(), 'MM'),
            (SELECT FORMAT(
              COALESCE((
                SELECT MAX(CAST(RIGHT(DocNo, 4) AS INT))
                FROM DATASIGMA.dbo.ItemPricePack
                WHERE MONTH(DocDate) = MONTH(GETDATE())
                  AND YEAR(DocDate) = YEAR(GETDATE())
              ), 0) + 1, '0000')
            )
          )),
          (SELECT COALESCE((
            SELECT MAX(CAST(RIGHT(DocNo, 4) AS INT))
            FROM DATASIGMA.dbo.ItemPricePack
            WHERE MONTH(DocDate) = MONTH(GETDATE())
              AND YEAR(DocDate) = YEAR(GETDATE())
          ), 0) + 1),
          GETDATE(),
          'ADMIN',
          MONTH(GETDATE()),
          @TypeMain
        )
      `;

      await db.queryDB('Sigma', insertDocNO, { TypeMain: DepartCode });

      // Re-fetch doc number
      const dataCheck2 = await db.queryDB('Sigma', checkInsert, {});
      arrRecord = dataCheck2.recordset[0];
    }

    // 4. Insert into ItemPricePackSub
    const insertSub = `
      INSERT INTO DATASIGMA.dbo.ItemPricePackSub (
        DocNo, IDNO, ItemCode, Code, NameFG, NameFGS, Package, 
        DepartCode, GrItem, Pricepack, DatePricePack, Name
      )
      VALUES (
        @docNo,
        (SELECT COALESCE(
          CAST((SELECT TOP 1 IDNo 
                FROM DATASIGMA.dbo.ItemPricePackSub 
                WHERE DocNo = @docNo 
                ORDER BY IDNo DESC) + 1 AS VARCHAR),
          '1'
        )),
        @ItemCode,
        @code,
        @NameFG,
        @NameFGS,
        CONCAT(@Rpack, @PackR, 'X', @RpackSale),
        @DepartCode,
        @DepartCode,
        @values,
        GETDATE(),
        @itemName
      )
    `;

    await db.queryDB('Sigma', insertSub, {
      docNo: arrRecord.DocNo,
      ItemCode: ItemCode,
      code: code,
      NameFG: NameFG,
      NameFGS: NameFGS,
      Rpack: Rpack,
      PackR: PackR,
      RpackSale: RpackSale,
      DepartCode: DepartCode,
      values: value,
      itemName: itemName
    });

    // 5. Get department data
    const sqlRes = `SELECT * FROM DATASIGMA.dbo.Depart WHERE Name = @DepartName`;
    const departData = await db.queryDB('Sigma', sqlRes, { DepartName: DepartName });

    console.log('✅ Price list updated successfully');

    // Clear cache
    await cache.del('prices:*');

    res.json({ 
      result: { success: true },
      departData: { recordset: departData.recordset }
    });

  } catch (error) {
    console.error('❌ Error updating price list:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;