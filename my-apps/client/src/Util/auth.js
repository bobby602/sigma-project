// src/utils/authToken.js
import { jwtDecode } from 'jwt-decode';
import { redirect } from 'react-router-dom';

/** ตัดเครื่องหมาย " รอบ token และคำว่า Bearer (ถ้าเผลอเก็บมาพร้อมกัน) */
export const sanitizeToken = (t) =>
  (t ?? '')
    .toString()
    .replace(/^"+|"+$/g, '')     // ตัด "..." ออก
    .replace(/^Bearer\s+/i, '')  // กันพลาดถ้าเคยเก็บด้วยคำว่า Bearer
    .trim();

/** อ่าน token จาก sessionStorage ก่อน แล้วค่อย fallback ไป localStorage */
const readToken = (key = 'accessToken') => {
  const raw = sessionStorage.getItem(key) ?? localStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'string' ? sanitizeToken(parsed) : sanitizeToken(raw);
  } catch {
    return sanitizeToken(raw);
  }
};

/** คืนระยะเวลาที่เหลือก่อนหมดอายุ (ms) */
export function getTokenDuration() {
  const token = readToken('accessToken');
  if (!token) return -Infinity;
  try {
    const { exp } = jwtDecode(token); // exp = epoch seconds
    const nowSec = Math.floor(Date.now() / 1000);
    return (exp - nowSec) * 1000;
  } catch {
    return -Infinity;
  }
}

/** คืน access token ถ้ายังไม่หมดอายุ, ถ้าหมดคืน 'EXPIRED', ถ้าไม่มีคืน null */
export function getAuthToken() {
  const token = readToken('accessToken');
  if (!token) return null;
  return getTokenDuration() <= 0 ? 'EXPIRED' : token;
}

/** สำหรับ react-router loader ที่ต้องการ token ดิบ */
export function tokenLoader() {
  return getAuthToken();
}

/** สำหรับ protect route: ถ้าไม่มี/หมดอายุ → ล้างแล้ว redirect ไป /login */
export function checkAuthLoader() {
  const token = getAuthToken();
  if (!token || token === 'EXPIRED') {
    ['accessToken','refreshToken','token','token2','user'].forEach(k => {
      sessionStorage.removeItem(k);
      localStorage.removeItem(k);
    });
    return redirect('/login');
  }
  return null;
}
