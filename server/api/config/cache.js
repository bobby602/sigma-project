class CacheService {
  constructor() {
    this.cache = new Map();
  }

  async get(key) {
    return this.cache.get(key) || null;
  }

  async set(key, value, ttl = 300) {
    this.cache.set(key, value);
    setTimeout(() => this.cache.delete(key), ttl * 1000);
    return true;
  }

  async del(pattern) {
    if (pattern.includes('*')) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern.replace('*', ''))) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.delete(pattern);
    }
  }
}

module.exports = new CacheService();