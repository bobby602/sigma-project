// server/api/routes/login.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../config/database');
const { verifyToken } = require('../middleware/globalAuth');
require('dotenv').config();

/* ------------------------ Helper: สร้าง Access/Refresh ------------------------ */
const generateTokens = (user) => {
  const payload = {
    id: user.Login,
    name: user.Name,
    role: user.StAdmin,
    saleCode: user.saleCode || user.SaleCode,
  };

  const accessToken = jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_PRIVATE_KEY,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '1h',
      algorithm: 'HS256',
    }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_PRIVATE_KEY,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '5h',
      algorithm: 'HS256',
    }
  );

  return { accessToken, refreshToken };
};

/* ------------------------ Login rate limiter (เข้ม) ------------------------ */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

/* ------------------------ POST /api/auth/login ------------------------ */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log(`🔐 Login attempt for user: ${username}`);

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    const userQuery = `
      SELECT 
        Login,
        Name,
        StAdmin,
        Password,
        SaleCode
      FROM DATASIGMA.dbo.Users WITH (NOLOCK)
      WHERE Login = @username
    `;

    const userResult = await db.query(userQuery, { username });

    if (!userResult.recordset || userResult.recordset.length === 0) {
      console.log(`❌ User not found: ${username}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const user = userResult.recordset[0];

    // ตรวจสอบ password
    let isValidPassword = false;

    if (user.Password && typeof user.Password === 'string' && user.Password.startsWith('$2')) {
      // bcrypt
      try {
        isValidPassword = await bcrypt.compare(password, user.Password);
      } catch (e) {
        console.error('bcrypt.compare error:', e);
        isValidPassword = false;
      }
    } else if (process.env.ALLOW_PLAINTEXT_LOGIN === 'true') {
      // plaintext (ใช้เฉพาะ dev/migration)
      isValidPassword = (password === user.Password);

      // อัปเกรดเป็น bcrypt ถ้าต้องการ (ระวัง column length)
      if (isValidPassword && process.env.UPGRADE_TO_BCRYPT === 'true') {
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          if (hashedPassword.length <= 15) {
            await db.query(
              'UPDATE DATASIGMA.dbo.Users SET Password = @password WHERE Login = @username',
              { password: hashedPassword, username }
            );
            console.log(`✅ Password upgraded to bcrypt for user: ${username}`);
          } else {
            console.warn('⚠️ Skip bcrypt upgrade: column length (15) is too short for bcrypt hash.');
          }
        } catch (updateError) {
          console.error('Error updating password (upgrade to bcrypt):', updateError);
        }
      }
    }

    if (!isValidPassword) {
      console.log(`❌ Invalid password for user: ${username}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // บันทึก refresh token (optional)
    try {
      const expireEpoch = Math.floor(Date.now() / 1000) + 5 * 60 * 60; // +5 ชั่วโมง
      const tokenInsert = `
        INSERT INTO DATASIGMA.dbo.[Token] (token_id, [user_id], [token], [expire_date])
        VALUES (CONVERT(varchar(255), NEWID()), @userId, @token, @expireDate)
      `;
      await db.query(tokenInsert, {
        userId: String(user.Login).slice(0, 15), // nvarchar(15)
        token: refreshToken,                      // varchar(255)
        expireDate: expireEpoch,                  // numeric(30)
      });
      console.log(`✅ Token saved for user: ${username}`);
    } catch (tokenError) {
      console.error('Token insert error:', tokenError);
      console.log('⚠️ Continuing without saving token to database');
    }

    // ดึงข้อมูล sale เพิ่มเติมถ้ามี
    let saleInfo = null;
    if (user.SaleCode) {
      try {
        const saleQuery = `
          SELECT TOP 1
            Code,
            Name
          FROM DATASIGMA.dbo.Sale WITH (NOLOCK)
          WHERE Code = @saleCode
        `;
        const saleResult = await db.query(saleQuery, { saleCode: user.SaleCode });
        if (saleResult.recordset && saleResult.recordset.length > 0) {
          saleInfo = saleResult.recordset[0];
        }
      } catch (saleError) {
        console.error('Could not fetch sale info:', saleError);
      }
    }

    console.log(`✅ Login successful for user: ${username}`);

    return res.json({
      success: true,
      user: {
        Login: user.Login,
        Name: user.Name,
        StAdmin: user.StAdmin,
        SaleCode: user.SaleCode,
        ...(saleInfo && { saleInfo }),
      },
      accessToken,
      refreshToken,
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

/* ------------------------ POST /api/auth/refresh ------------------------ */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_PRIVATE_KEY);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    const query = `
      SELECT 
        Login,
        Name,
        StAdmin,
        SaleCode
      FROM DATASIGMA.dbo.Users WITH (NOLOCK)
      WHERE Login = @username
    `;
    const result = await db.query(query, { username: decoded.id });

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
    }

    const user = result.recordset[0];
    const tokens = generateTokens(user);

    return res.json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    console.error('❌ Refresh token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/* ------------------------ POST /api/auth/logout ------------------------ */
router.post('/logout', async (req, res) => {
  try {
    const raw = req.headers.authorization || '';
    const token = raw.replace(/^Bearer\s+/i, '').replace(/^"|"$/g, '').trim();

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_PRIVATE_KEY);
        try {
          await db.query(
            'DELETE FROM DATASIGMA.dbo.[Token] WHERE [user_id] = @userId',
            { userId: decoded.id }
          );
        } catch (deleteError) {
          console.log('Could not delete token from database:', deleteError.message);
        }
      } catch (error) {
        console.log('Token verification failed during logout:', error.message);
      }
    }

    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/* ------------------------ GET /api/auth/me ------------------------ */
router.get('/me', verifyToken, (req, res) => {
  console.log('🔍 /me endpoint called by:', req.user?.name);
  return res.json({
    success: true,
    user: req.user,
    message: 'Token valid',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
