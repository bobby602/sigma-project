// server/api/middleware/globalAuth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

/** ตัด Bearer/ช่องว่าง/เครื่องหมาย " ที่ครอบ token ออกให้หมด */
function extractToken(authHeader = '') {
  return String(authHeader)
    .replace(/^\s*Bearer\s+/i, '') // ตัด "Bearer "
    .replace(/^"+|"+$/g, '')       // ตัดเครื่องหมาย quote รอบ ๆ
    .trim();
}

const verifyToken = (req, res, next) => {
  // อนุญาต preflight
  if (req.method === 'OPTIONS') return next();

  const raw = req.headers.authorization || '';
  const token = extractToken(raw);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
      timestamp: new Date().toISOString(),
    });
  }

  const secret = process.env.ACCESS_TOKEN_PRIVATE_KEY;
  if (!secret) {
    console.error('❌ Missing ACCESS_TOKEN_PRIVATE_KEY in env');
    return res.status(500).json({
      success: false,
      message: 'Server misconfiguration',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    // บังคับ HS256 ให้ตรงกับตอน sign
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    req.user = decoded;   // { id, name, role, saleCode, iat, exp }
    req.token = token;    // เก็บ token เผื่อ route อยากใช้ต่อ
    return next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.name, error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        timestamp: new Date().toISOString(),
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid token',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/** มี token ก็ตรวจให้ ถ้าไม่มีให้ผ่าน (สำหรับ endpoint ที่ optional) */
const optionalAuth = (req, res, next) => {
  const raw = req.headers.authorization || '';
  const token = extractToken(raw);
  if (!token) return next();
  return verifyToken(req, res, next);
};

module.exports = {
  verifyToken,
  optionalAuth,
  default: verifyToken,
};
