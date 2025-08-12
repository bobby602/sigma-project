const sql = require('mssql');
require('dotenv').config();

// Database configurations using environment variables
const dbConfigs = {
  Sigma: {
    name: "Sigma",
    config: {
      server: process.env.DB_SIGMA_SERVER || '1.0.169.153',
      database: process.env.DB_SIGMA_DATABASE || 'dataSIGMA',
      user: process.env.DB_SIGMA_USER || 'sa',
      port: parseInt(process.env.DB_SIGMA_PORT) || 1433,
      password: process.env.DB_SIGMA_PASSWORD || 'GoodMan@Pm.Com',
      pool: {
        max: 20,
        min: 5,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
      },
      connectionTimeout: 30000,
      requestTimeout: 30000,
      trustServerCertificate: true,
      options: {
        trustedConnection: false,
        enableArithAbort: true,
        encrypt: false,
        instanceName: undefined
      }
    }
  },
  Unogroup: {
    name: 'Unogroup',
    config: {
      server: process.env.DB_UNO_SERVER || '25.32.222.7',
      database: process.env.DB_UNO_DATABASE || 'UNOGROUP',
      user: process.env.DB_UNO_USER || 'sa',
      port: parseInt(process.env.DB_UNO_PORT) || 1433,
      password: process.env.DB_UNO_PASSWORD || 'GoodMan@Pm.Com',
      pool: {
        max: 10,
        min: 2,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 30000,
      },
      connectionTimeout: 30000,
      requestTimeout: 30000,
      trustServerCertificate: true,
      options: {
        trustedConnection: false,
        enableArithAbort: true,
        encrypt: false
      }
    }
  },
  SigmaOffice: {
    name: "DAT-OFFICE",
    config: {
      server: process.env.DB_OFFICE_SERVER || '49.0.87.90',
      database: process.env.DB_OFFICE_DATABASE || 'SIGMA-OFFICE',
      user: process.env.DB_OFFICE_USER || 'sa',
      port: parseInt(process.env.DB_OFFICE_PORT) || 1433,
      password: process.env.DB_OFFICE_PASSWORD || 'GoodMan@Pm.Com',
      pool: {
        max: 20,
        min: 5,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 30000,
      },
      connectionTimeout: 30000,
      requestTimeout: 30000,
      trustServerCertificate: true,
      options: {
        trustedConnection: false,
        enableArithAbort: true,
        encrypt: false
      }
    }
  }
};

class DatabaseManager {
  constructor() {
    this.pools = new Map();
    this.configs = dbConfigs;
  }

  // Main query method ที่ login.js ใช้
  async query(queryString, params = {}) {
    // Default ใช้ Sigma database
    return this.queryDB('Sigma', queryString, params);
  }

  async queryDB(dbName, queryString, params = {}) {
    try {
      const pool = await this.getPool(dbName);
      const request = pool.request();

      // Add parameters
      Object.entries(params).forEach(([key, value]) => {
        request.input(key, value);
      });

      return await request.query(queryString);
    } catch (error) {
      console.error(`Query error:`, error);
      throw error;
    }
  }

  async getPool(dbName) {
    if (this.pools.has(dbName)) {
      const pool = this.pools.get(dbName);
      if (pool.connected) return pool;
    }

    const config = this.configs[dbName];
    const pool = new sql.ConnectionPool(config.config);
    await pool.connect();
    this.pools.set(dbName, pool);
    console.log(`✅ Connected to ${dbName}`);
    return pool;
  }
}

module.exports = new DatabaseManager();