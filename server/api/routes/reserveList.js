// server/api/routes/reserveList.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const cache = require('../config/cache');
const verifyToken = require('../middleware/auth');

// Get reservations
router.get('/list', verifyToken, async (req, res) => {
  try {
    const { itemCode, saleName, nameFGS, code } = req.query;

    if (!itemCode || !saleName) {
      return res.status(400).json({ message: 'ItemCode and SaleName required' });
    }

    const queryParams = {
      itemCode,
      saleName
    };

    let whereConditions = [
      'itemCode = @itemCode',
      'SaleName = @saleName'
    ];

    if (nameFGS) {
      whereConditions.push('NameFGS = @NameFGS');
      queryParams.NameFGS = nameFGS;
    }

    if (code) {
      whereConditions.push('code = @code');
      queryParams.code = code;
    }

    const query = `
      SELECT 
        *,
        FORMAT(docdate, 'dd/MM/yyyy') as docdateT
      FROM DATASIGMA.dbo.ReserveProduct
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY docdate DESC
    `;

    const result = await db.query(query, queryParams);

    res.json(result.recordset);

  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create bulk reservations
router.post('/bulk-create', verifyToken, async (req, res) => {
  try {
    const { reservations } = req.body;

    if (!Array.isArray(reservations) || reservations.length === 0) {
      return res.status(400).json({ message: 'Invalid reservations data' });
    }

    let insertedCount = 0;

    await db.transaction(async (transaction) => {
      for (const reservation of reservations) {
        const { itemCode, saleName, nameFGS, code, qty, note } = reservation;

        const request = transaction.request();
        request.input('itemCode', itemCode);
        request.input('saleName', saleName);
        request.input('nameFGS', nameFGS);
        request.input('code', code);
        request.input('qty', parseInt(qty));
        request.input('note', note || '');
        request.input('docDate', new Date());

        const insertQuery = `
          INSERT INTO DATASIGMA.dbo.ReserveProduct 
          (itemCode, SaleName, NameFGS, code, QTY, Note, docdate)
          VALUES 
          (@itemCode, @saleName, @nameFGS, @code, @qty, @note, @docDate)
        `;

        await request.query(insertQuery);
        insertedCount++;
      }
    });

    // Clear cache
    await cache.del('prices:*');

    res.json({ 
      success: true, 
      message: `Created ${insertedCount} reservations successfully` 
    });

  } catch (error) {
    console.error('Error creating reservations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete reservation
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      DELETE FROM DATASIGMA.dbo.ReserveProduct 
      WHERE ID = @id
    `;

    const result = await db.query(query, { id: parseInt(id) });

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Clear cache
    await cache.del('prices:*');

    res.json({ success: true, message: 'Reservation deleted successfully' });

  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;