// config/cache.js - Memory cache only (ไม่ต้องติดตั้ง Redis)
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
    console.log('📦 Using in-memory cache (Redis not required)');
  }

  async get(key) {
    const item = this.cache.get(key);
    if (item && item.expiry > Date.now()) {
      return item.value;
    }
    // ลบ cache ที่หมดอายุ
    this.cache.delete(key);
    return null;
  }

  async set(key, value, ttl = 300) {
    // Clear timer เก่าถ้ามี
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set value พร้อม expiry time
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttl * 1000)
    });

    // ตั้ง timer เพื่อลบ cache อัตโนมัติ
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, ttl * 1000);

    this.timers.set(key, timer);

    // จำกัดขนาด cache ไม่ให้ใหญ่เกินไป
    if (this.cache.size > 1000) {
      // ลบ cache เก่าที่สุด 100 รายการ
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].expiry - b[1].expiry);
      
      for (let i = 0; i < Math.min(100, entries.length); i++) {
        const [oldKey] = entries[i];
        this.cache.delete(oldKey);
        if (this.timers.has(oldKey)) {
          clearTimeout(this.timers.get(oldKey));
          this.timers.delete(oldKey);
        }
      }
    }

    return true;
  }

  async del(pattern) {
    // ลบ cache ที่ match กับ pattern (รองรับ wildcard *)
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let deletedCount = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        if (this.timers.has(key)) {
          clearTimeout(this.timers.get(key));
          this.timers.delete(key);
        }
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  async flush() {
    // ลบ cache ทั้งหมด
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.cache.clear();
    return true;
  }

  getStats() {
    return {
      type: 'memory',
      size: this.cache.size,
      maxSize: 1000
    };
  }

  // Middleware สำหรับ Express (optional)
  middleware(ttl = 300) {
    return async (req, res, next) => {
      // Cache เฉพาะ GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const key = `route:${req.originalUrl}`;
      const cached = await this.get(key);

      if (cached) {
        console.log(`✅ Cache hit: ${key}`);
        return res.json(cached);
      }

      // Store original json method
      const originalJson = res.json;
      
      // Override json method เพื่อ cache response
      res.json = function(data) {
        // Cache response data
        cacheInstance.set(key, data, ttl).catch(console.error);
        
        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    };
  }
}

// สร้าง singleton instance
const cacheInstance = new MemoryCache();

module.exports = cacheInstance;