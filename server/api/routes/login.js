// server/api/routes/login.js - อัปเดตให้ใช้กับ database manager ใหม่
const express = require('express');
const router = express.Router();
const db = require('../config/database'); // ใช้ database manager ใหม่
const { jwtGenerate, jwtRefreshTokenGenerate } = require('./generateTokens');
const checkAuthMiddleware = require('../util/auth');
const jwt = require('jsonwebtoken');
const { verify } = require('jsonwebtoken');
require('dotenv').config();

const env = process.env;
const KEYRefresh = env.REFRESH_TOKEN_PRIVATE_KEY;

router.use(express.urlencoded({extended: true}));
router.use(express.json());

// ===== LOGIN ROUTE =====
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        result: "Username and password are required."
      });
    }

    // ตรวจสอบข้อมูลผู้ใช้
    const userQuery = `
      SELECT Login, Name, StAdmin, SaleCode, Password
      FROM DATASIGMA.dbo.[Users] 
      WHERE Login = @username AND Password = @password
    `;
    
    const userResult = await db.query(userQuery, { 
      username, 
      password 
    });

    if (!userResult.recordset || userResult.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        result: "Invalid credentials"
      });
    }

    const user = userResult.recordset[0];
    
    // สร้าง tokens
    const access_token = jwtGenerate(user);
    const refresh_token = jwtRefreshTokenGenerate(user);
    
    // บันทึก refresh token (วิธีที่ปลอดภัย)
    const expireDate = Math.floor(Date.now() / 1000) + (5 * 60 * 60); // 5 hours
    
    try {
      // ลองอัปเดตก่อน
      const updateResult = await db.query(`
        UPDATE DATASIGMA.dbo.[Token] 
        SET [token] = @token, [expire_date] = @expire_date
        WHERE [user_id] = @user_id
      `, {
        user_id: user.Login,
        token: refresh_token,
        expire_date: expireDate
      });

      // ถ้าไม่มี record ให้ INSERT ใหม่
      if (updateResult.rowsAffected[0] === 0) {
        await db.query(`
          INSERT INTO DATASIGMA.dbo.[Token] ([user_id], [token], [expire_date])
          VALUES (@user_id, @token, @expire_date)
        `, {
          user_id: user.Login,
          token: refresh_token,
          expire_date: expireDate
        });
      }
    } catch (insertError) {
      console.error('Token insert/update error:', insertError);
      // ถ้า INSERT ไม่ได้ แสดงว่ามี record อยู่แล้ว ลอง UPDATE อีกครั้ง
      await db.query(`
        UPDATE DATASIGMA.dbo.[Token] 
        SET [token] = @token, [expire_date] = @expire_date
        WHERE [user_id] = @user_id
      `, {
        user_id: user.Login,
        token: refresh_token,
        expire_date: expireDate
      });
    }

    // ตรวจสอบข้อมูล Sale ถ้ามี SaleCode
    let saleInfo = null;
    if (user.SaleCode) {
      try {
        const saleQuery = `
          SELECT Name, SurName 
          FROM [SIGMA-OFFICE].dbo.sale 
          WHERE Code = @saleCode
        `;
        
        const saleResult = await db.queryDB('SigmaOffice', saleQuery, { 
          saleCode: user.SaleCode 
        });
        
        if (saleResult.recordset && saleResult.recordset.length > 0) {
          saleInfo = saleResult.recordset[0];
        }
      } catch (saleError) {
        console.warn('Could not fetch sale info:', saleError.message);
      }
    }

    // ส่งผลลัพธ์
    const response = {
      access_token,
      refresh_token,
      result: [userResult.recordset]
    };

    if (saleInfo) {
      response.resultInfo = [saleInfo];
    }

    res.json(response);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      result: "Login failed: " + error.message
    });
  }
});

// ===== REFRESH TOKEN ROUTE =====
router.post('/refresh', async (req, res) => {
  try {
    const { token: refreshToken, username } = req.body;
    
    if (!refreshToken || !username) {
      return res.status(401).json("Refresh token and username are required!");
    }

    // ตรวจสอบ token ในฐานข้อมูล
    const tokenQuery = `
      SELECT * FROM DATASIGMA.dbo.[Token] 
      WHERE user_id = @username
    `;
    
    const tokenResult = await db.query(tokenQuery, { username });
    
    if (!tokenResult.recordset || tokenResult.recordset.length === 0) {
      return res.status(403).json("No token found for user!");
    }

    const storedToken = tokenResult.recordset[0];
    
    if (refreshToken !== storedToken.token) {
      return res.status(403).json("Refresh token is not valid!");
    }

    // ตรวจสอบ JWT
    try {
      verify(refreshToken, KEYRefresh);
    } catch (err) {
      return res.status(403).json("Invalid refresh token");
    }

    // ดึงข้อมูลผู้ใช้
    const userQuery = `
      SELECT Login, Name, StAdmin, SaleCode 
      FROM DATASIGMA.dbo.[Users] 
      WHERE Login = @username
    `;
    
    const userResult = await db.query(userQuery, { username });
    
    if (!userResult.recordset || userResult.recordset.length === 0) {
      return res.status(404).json("User not found!");
    }

    const user = userResult.recordset[0];

    // สร้าง tokens ใหม่
    const new_access_token = jwtGenerate(user);
    const new_refresh_token = jwtRefreshTokenGenerate(user);
    
    // อัปเดต refresh token
    const expireDate = Math.floor(Date.now() / 1000) + (5 * 60 * 60); // 5 hours
    
    try {
      // ลองอัปเดตก่อน
      const updateResult = await db.query(`
        UPDATE DATASIGMA.dbo.[Token] 
        SET [token] = @token, [expire_date] = @expire_date
        WHERE [user_id] = @username
      `, {
        username,
        token: new_refresh_token,
        expire_date: expireDate
      });

      // ถ้าไม่มี record ให้ INSERT ใหม่
      if (updateResult.rowsAffected[0] === 0) {
        await db.query(`
          INSERT INTO DATASIGMA.dbo.[Token] ([user_id], [token], [expire_date])
          VALUES (@username, @token, @expire_date)
        `, {
          username,
          token: new_refresh_token,
          expire_date: expireDate
        });
      }
    } catch (insertError) {
      console.error('Token insert/update error:', insertError);
      // ถ้า INSERT ไม่ได้ ลอง UPDATE อีกครั้ง
      await db.query(`
        UPDATE DATASIGMA.dbo.[Token] 
        SET [token] = @token, [expire_date] = @expire_date
        WHERE [user_id] = @username
      `, {
        username,
        token: new_refresh_token,
        expire_date: expireDate
      });
    }

    res.json({
      accessToken: new_access_token,
      refreshToken: new_refresh_token
    });

  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({
      result: "Token refresh failed: " + error.message
    });
  }
});

// ===== LOGOUT ROUTE =====
router.post("/logout", async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json("Username is required");
    }
    
    // ลบ refresh token
    const deleteQuery = `
      DELETE FROM DATASIGMA.dbo.[Token] 
      WHERE user_id = @username
    `;
    
    await db.query(deleteQuery, { username });
    
    res.json("You logged out successfully.");
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json("Logout failed");
  }
});

// ===== GET USERS (ต้องการ authentication) =====
router.get('/', checkAuthMiddleware, async (req, res) => {
  try {
    const query = `SELECT * FROM DATASIGMA.dbo.[Users]`;
    const result = await db.query(query);
    
    res.json({ result: result.recordset });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: "Failed to get users: " + error.message 
    });
  }
});

module.exports = router;