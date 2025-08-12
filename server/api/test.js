const db = require('./config/database');

async function test() {
  try {
    // Test query method ที่ login.js ใช้
    const result = await db.query('SELECT 1 as test');
    console.log('✅ Database connected:', result.recordset);
    
    // Test Login table
    const users = await db.query('SELECT TOP 1 * FROM Users');
    console.log('✅ Found user:', users.recordset[0]);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();