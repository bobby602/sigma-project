#!/usr/bin/env node
'use strict';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const sql = require('mssql');
const bcrypt = require('bcrypt');

// ---- FAIL-FAST: แสดง ENV สำคัญ (ชั่วคราวเพื่อดีบั๊ก) ----
['DB_SIGMA_SERVER','DB_SIGMA_DATABASE','DB_SIGMA_USER','DB_SIGMA_PASSWORD','DB_SIGMA_INSTANCE','DB_SIGMA_PORT']
  .forEach(k => console.log(k, '=', process.env[k]));

// helper
function req(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required ENV: ${name}`);
  return v;
}

// สร้าง config สำหรับ mssql จาก DB_SIGMA_* เท่านั้น
const INSTANCE = process.env.DB_SIGMA_INSTANCE;
const PORT = process.env.DB_SIGMA_PORT ? parseInt(process.env.DB_SIGMA_PORT, 10) : 1433;

const cfg = {
  server: req('DB_SIGMA_SERVER'),                                    // e.g. 1.0.169.153 หรือ ZIGMA-SRV
  user: req('DB_SIGMA_USER'),
  password: req('DB_SIGMA_PASSWORD'),
  database: process.env.DB_SIGMA_DATABASE || 'DATASIGMA',            // คุณตอนนี้ตั้งเป็น dataSIGMA
  options: {
    encrypt: String(process.env.DB_SIGMA_ENCRYPT || 'false') === 'true',
    trustServerCertificate: String(process.env.DB_SIGMA_TRUST_CERT || 'true') === 'true',
    ...(INSTANCE ? { instanceName: INSTANCE } : {}),
    enableArithAbort: true,
  },
  ...(INSTANCE ? {} : { port: PORT }),
  pool: { max: 5, min: 0, idleTimeoutMillis: 30000 },
};

// log config (ปิด password)
console.log('CFG =', JSON.stringify({ ...cfg, password: '***' }, null, 2));

const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
const APPLY = process.argv.includes('--apply');
const DRY = !APPLY;

function isBcrypt(val) { return typeof val === 'string' && (val.startsWith('$2a$') || val.startsWith('$2b$')); }

(async () => {
  let pool;
  try {
    pool = await sql.connect(cfg);
    console.log(`✅ Connected ${cfg.server}/${cfg.database}${INSTANCE ? '\\' + INSTANCE : ''}`);

    // นับแถวที่ยังไม่เป็น bcrypt
    const countRes = await pool.request().query(`
      SELECT COUNT(*) AS cnt
      FROM [${cfg.database}].[dbo].[Users]
      WHERE [Password] IS NOT NULL
        AND LEFT([Password], 3) NOT IN ('$2a', '$2b')
    `);
    const total = countRes.recordset[0].cnt;
    console.log(`พบผู้ใช้ที่ต้อง migrate: ${total}`);
    if (total === 0) return process.exit(0);

    if (DRY) {
      console.log('โหมด DRY-RUN: ยังไม่เขียนข้อมูล ใช้ --apply เพื่อเริ่มจริง');
      return;
    }

    // ดึงทีละก้อน (500)
    const BATCH = 500;
    let migrated = 0;
    for (let offset = 0; offset < total; offset += BATCH) {
      const res = await pool.request().query(`
        WITH cte AS (
          SELECT [Login], [Password]
          FROM [${cfg.database}].[dbo].[Users]
          WHERE [Password] IS NOT NULL
            AND LEFT([Password], 3) NOT IN ('$2a', '$2b')
          ORDER BY [Login]
          OFFSET ${offset} ROWS FETCH NEXT ${BATCH} ROWS ONLY
        )
        SELECT * FROM cte;
      `);

      for (const row of res.recordset) {
        const login = row.Login;
        const plain = row.Password;
        if (!plain || isBcrypt(plain)) continue;

        const hash = await bcrypt.hash(String(plain), ROUNDS);

        const tx = new sql.Transaction(pool);
        await tx.begin();
        try {
          await new sql.Request(tx)
            .input('login', sql.VarChar(100), login)
            .input('hash', sql.VarChar(200), hash)
            .query(`
              UPDATE [${cfg.database}].[dbo].[Users]
              SET [Password] = @hash
              WHERE [Login] = @login
            `);
          await tx.commit();
          migrated++;
          if (migrated % 50 === 0) console.log(`... migrated ${migrated}/${total}`);
        } catch (e) {
          await tx.rollback();
          console.error(`❌ Failed for Login=${login}:`, e.message);
        }
      }
    }

    console.log(`✅ เสร็จสิ้น: migrate แล้ว ${migrated}/${total} แถว`);
  } catch (e) {
    console.error('⚠️ Migration error:', e);
    process.exit(1);
  } finally {
    pool && pool.close();
  }
})();
