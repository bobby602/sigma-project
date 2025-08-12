// server/api/routes/productList.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const cache = require('../config/cache');
const verifyToken = require('../middleware/auth');

// Get products with filters and pagination
router.get('/list', verifyToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50,
      departCode = '',
      search = '',
      sortBy = 'ItemCode',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;

    // Check cache
    const cacheKey = `products:${page}:${limit}:${departCode}:${search}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    // Build WHERE conditions
    const whereConditions = ['1=1'];
    const queryParams = {
      offset: parseInt(offset),
      limit: parseInt(limit)
    };

    if (departCode) {
      whereConditions.push('DepartCode = @departCode');
      queryParams.departCode = departCode;
    }

    if (search) {
      whereConditions.push('(ItemCode LIKE @search OR Name LIKE @search)');
      queryParams.search = `%${search}%`;
    }

    const query = `
      WITH ProductData AS (
        SELECT 
          ItemCode,
          Name,
          Pack,
          DepartCode,
          DepartName,
          GrItem,
          Cost,
          CostN,
          Price,
          ROW_NUMBER() OVER (ORDER BY ${sortBy} ${sortOrder}) as RowNum,
          COUNT(*) OVER() as TotalCount
        FROM DATASIGMA.dbo.ItemDm WITH (NOLOCK)
        WHERE ${whereConditions.join(' AND ')}
      )
      SELECT * FROM ProductData
      WHERE RowNum > @offset AND RowNum <= (@offset + @limit)
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

    // Cache for 2 minutes
    await cache.set(cacheKey, response, 120);

    res.json(response);

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update product cost
router.put('/update-cost', verifyToken, async (req, res) => {
  try {
    const { itemCode, value, type } = req.body;

    if (!itemCode || value === undefined || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let updateQuery;
    const queryParams = {
      value: parseFloat(value),
      item: itemCode
    };

    if (type === 'cost') {
      updateQuery = `
        UPDATE DATASIGMA.dbo.ItemDm 
        SET Cost = @value, DateCost = GETDATE() 
        WHERE ItemCode = @item;
        
        UPDATE DATASIGMA.dbo.Bom 
        SET AmtCost = @value + AmtEXP 
        WHERE Code IN (
          SELECT Code FROM DATASIGMA.dbo.BomSub WHERE ItemCode = @item
        );
      `;
    } else if (type === 'price') {
      updateQuery = `
        UPDATE DATASIGMA.dbo.ItemDm 
        SET Price = @value, DatePrice = GETDATE() 
        WHERE ItemCode = @item;
      `;
    } else {
      return res.status(400).json({ message: 'Invalid update type' });
    }

    await db.query(updateQuery, queryParams);

    // Clear cache
    await cache.del('products:*');

    res.json({ success: true, message: 'Product updated successfully' });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;