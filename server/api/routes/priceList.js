// server/api/routes/priceList.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const cache = require('../config/cache');
const verifyToken = require('../middleware/auth');

// Get price list with pagination and caching
router.get('/list', verifyToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      departCode = '',
      sortBy = 'departCode',
      sortOrder = 'ASC' 
    } = req.query;

    const offset = (page - 1) * limit;

    // Check cache first
    const cacheKey = `prices:${page}:${limit}:${search}:${departCode}:${sortBy}:${sortOrder}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    // Build WHERE clause
    let whereConditions = ['1=1'];
    const queryParams = {
      offset: parseInt(offset),
      limit: parseInt(limit)
    };

    if (search) {
      whereConditions.push(`(a.ItemCode LIKE @search OR a.name LIKE @search)`);
      queryParams.search = `%${search}%`;
    }

    if (departCode) {
      whereConditions.push(`a.DepartCode = @departCode`);
      queryParams.departCode = departCode;
    }

    // Optimized query with CTEs
    const query = `
      WITH StockSummary AS (
        SELECT 
          itemcode,
          name,
          pack,
          SUM(BAL) as BAL,
          MAX(Note) as Note
        FROM DATASIGMA.dbo.rptstock2 WITH (NOLOCK)
        GROUP BY itemcode, name, pack
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
          SUM(QTY) as TotalQTY
        FROM DATASIGMA.dbo.ReserveProduct WITH (NOLOCK)
        GROUP BY itemCode
      ),
      FilteredData AS (
        SELECT 
          a.*,
          ISNULL(b.BAL, 0) as BAL,
          b.Note,
          ISNULL(c.QTY, 0) as ReserveQTYbyCust,
          ISNULL(d.TotalQTY, 0) as ReserveQTY,
          ROW_NUMBER() OVER (ORDER BY ${sortBy} ${sortOrder}) as RowNum,
          COUNT(*) OVER() as TotalCount
        FROM DATASIGMA.dbo.itemF a WITH (NOLOCK)
        LEFT JOIN StockSummary b ON b.itemcode = a.ItemCode
        LEFT JOIN ReserveByCust c ON c.itemCode = a.ItemCode 
          AND c.code = a.code 
          AND c.NameFGS = a.NameFGS
        LEFT JOIN ReserveTotal d ON d.itemCode = a.ItemCode
        WHERE ${whereConditions.join(' AND ')}
      )
      SELECT * FROM FilteredData
      WHERE RowNum > @offset AND RowNum <= (@offset + @limit)
      ORDER BY RowNum
    `;

    const result = await db.query(query, queryParams);

    const response = {
      data: result.recordset,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.recordset[0]?.TotalCount || 0,
        totalPages: Math.ceil((result.recordset[0]?.TotalCount || 0) / limit)
      }
    };

    // Cache for 1 minute
    await cache.set(cacheKey, response, 60);

    res.json(response);

  } catch (error) {
    console.error('Error fetching price list:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update price with transaction
router.put('/update', verifyToken, async (req, res) => {
  try {
    const { itemCode, nameFGS, code, updates } = req.body;

    if (!itemCode || !updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    await db.transaction(async (transaction) => {
      const request = transaction.request();
      
      // Build dynamic UPDATE statement
      const updateFields = [];
      const params = {
        ItemCode: itemCode,
        NameFGS: nameFGS,
        Code: code
      };

      // Map field names to SQL columns
      const fieldMap = {
        price10: 'Price10',
        price25: 'Price25',
        price50: 'Price50',
        price100: 'Price100',
        amtF10: 'AmtF10',
        amtF25: 'AmtF25',
        amtF50: 'AmtF50',
        amtF100: 'AmtF100',
        note: 'NoteF'
      };

      for (const [field, value] of Object.entries(updates)) {
        if (fieldMap[field]) {
          const column = fieldMap[field];
          if (field.startsWith('price')) {
            updateFields.push(`${column} = ROUND(@${column}, 0)`);
          } else {
            updateFields.push(`${column} = @${column}`);
          }
          params[column] = value;
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      // Update query
      const updateQuery = `
        UPDATE DATASIGMA.dbo.itemF 
        SET ${updateFields.join(', ')}
        WHERE ItemCode = @ItemCode 
        AND NameFGS = @NameFGS 
        AND Code = @Code
      `;

      // Add parameters
      Object.entries(params).forEach(([key, value]) => {
        request.input(key, value);
      });

      const result = await request.query(updateQuery);

      if (result.rowsAffected[0] === 0) {
        throw new Error('No records updated');
      }

      // Clear cache
      await cache.del('prices:*');

      return result;
    });

    res.json({ success: true, message: 'Price updated successfully' });

  } catch (error) {
    console.error('Error updating price:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Bulk update prices
router.put('/bulk-update', verifyToken, async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'Invalid updates array' });
    }

    let updatedCount = 0;

    await db.transaction(async (transaction) => {
      for (const update of updates) {
        const { itemCode, nameFGS, code, changes } = update;
        
        const request = transaction.request();
        const updateFields = [];
        
        // Build update fields
        for (const [field, value] of Object.entries(changes)) {
          switch (field) {
            case 'price10':
              updateFields.push('Price10 = ROUND(@Price10, 0)');
              request.input('Price10', value);
              break;
            case 'price25':
              updateFields.push('Price25 = ROUND(@Price25, 0)');
              request.input('Price25', value);
              break;
            case 'price50':
              updateFields.push('Price50 = ROUND(@Price50, 0)');
              request.input('Price50', value);
              break;
            case 'price100':
              updateFields.push('Price100 = ROUND(@Price100, 0)');
              request.input('Price100', value);
              break;
            case 'amtF10':
              updateFields.push('AmtF10 = @AmtF10');
              request.input('AmtF10', value);
              break;
            case 'amtF25':
              updateFields.push('AmtF25 = @AmtF25');
              request.input('AmtF25', value);
              break;
            case 'amtF50':
              updateFields.push('AmtF50 = @AmtF50');
              request.input('AmtF50', value);
              break;
            case 'amtF100':
              updateFields.push('AmtF100 = @AmtF100');
              request.input('AmtF100', value);
              break;
            case 'note':
              updateFields.push('NoteF = @NoteF');
              request.input('NoteF', value);
              break;
          }
        }

        if (updateFields.length > 0) {
          const query = `
            UPDATE DATASIGMA.dbo.itemF 
            SET ${updateFields.join(', ')}
            WHERE ItemCode = @ItemCode 
            AND NameFGS = @NameFGS 
            AND Code = @Code
          `;

          request.input('ItemCode', itemCode);
          request.input('NameFGS', nameFGS);
          request.input('Code', code);

          const result = await request.query(query);
          updatedCount += result.rowsAffected[0];
        }
      }
    });

    // Clear cache
    await cache.del('prices:*');

    res.json({ 
      success: true, 
      message: `Updated ${updatedCount} records successfully` 
    });

  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

module.exports = router;