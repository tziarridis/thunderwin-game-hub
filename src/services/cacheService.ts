
interface CacheItem<T> {
  data: T;
  expiry: number;
  hits: number;
  lastAccessed: number;
}

interface CacheStats {
  size: number;
  keys: string[];
  hits: number;
  misses: number;
  hitRate: number;
}

class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private stats = {
    hits: 0,
    misses: 0
  };
  private maxSize = 1000; // Maximum number of cache entries
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupInterval();
  }

  set<T>(key: string, data: T, ttl?: number): boolean {
    try {
      // Check if we need to evict items due to size limit
      if (this.cache.size >= this.maxSize) {
        this.evictLeastRecentlyUsed();
      }

      const expiry = Date.now() + (ttl || this.defaultTTL);
      this.cache.set(key, { 
        data, 
        expiry, 
        hits: 0, 
        lastAccessed: Date.now() 
      });
      
      console.log(`Cache set: ${key} (TTL: ${ttl || this.defaultTTL}ms)`);
      return true;
    } catch (error) {
      console.error('Error setting cache item:', error);
      return false;
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = this.cache.get(key);
      
      if (!item) {
        this.stats.misses++;
        console.log(`Cache miss: ${key}`);
        return null;
      }

      if (Date.now() > item.expiry) {
        this.cache.delete(key);
        this.stats.misses++;
        console.log(`Cache expired: ${key}`);
        return null;
      }

      // Update access statistics
      item.hits++;
      item.lastAccessed = Date.now();
      this.stats.hits++;
      
      console.log(`Cache hit: ${key} (hits: ${item.hits})`);
      return item.data as T;
    } catch (error) {
      console.error('Error getting cache item:', error);
      this.stats.misses++;
      return null;
    }
  }

  delete(key: string): boolean {
    try {
      const deleted = this.cache.delete(key);
      if (deleted) {
        console.log(`Cache deleted: ${key}`);
      }
      return deleted;
    } catch (error) {
      console.error('Error deleting cache item:', error);
      return false;
    }
  }

  clear(): void {
    try {
      const size = this.cache.size;
      this.cache.clear();
      this.stats.hits = 0;
      this.stats.misses = 0;
      console.log(`Cache cleared: ${size} items removed`);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async getOrFetch<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    try {
      const cached = this.get<T>(key);
      
      if (cached !== null) {
        return cached;
      }

      console.log(`Cache miss, fetching: ${key}`);
      const data = await fetchFn();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      console.error('Error in getOrFetch:', error);
      throw error;
    }
  }

  // Cleanup expired items
  cleanup(): number {
    try {
      const now = Date.now();
      let cleaned = 0;
      
      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiry) {
          this.cache.delete(key);
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        console.log(`Cache cleanup: ${cleaned} expired items removed`);
      }
      
      return cleaned;
    } catch (error) {
      console.error('Error during cache cleanup:', error);
      return 0;
    }
  }

  // Evict least recently used items when cache is full
  private evictLeastRecentlyUsed(): void {
    try {
      let oldestKey = '';
      let oldestTime = Date.now();
      
      for (const [key, item] of this.cache.entries()) {
        if (item.lastAccessed < oldestTime) {
          oldestTime = item.lastAccessed;
          oldestKey = key;
        }
      }
      
      if (oldestKey) {
        this.cache.delete(oldestKey);
        console.log(`Cache LRU eviction: ${oldestKey}`);
      }
    } catch (error) {
      console.error('Error during LRU eviction:', error);
    }
  }

  // Get cache statistics
  getStats(): CacheStats {
    try {
      const totalRequests = this.stats.hits + this.stats.misses;
      const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
      
      return {
        size: this.cache.size,
        keys: Array.from(this.cache.keys()),
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: Number(hitRate.toFixed(2))
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        size: 0,
        keys: [],
        hits: 0,
        misses: 0,
        hitRate: 0
      };
    }
  }

  // Get cache health information
  getHealth(): { healthy: boolean; details: any } {
    try {
      const stats = this.getStats();
      const memoryUsage = this.cache.size;
      const healthy = memoryUsage < this.maxSize * 0.9 && stats.hitRate > 10;
      
      return {
        healthy,
        details: {
          ...stats,
          memoryUsage,
          maxSize: this.maxSize,
          utilizationPercent: Number(((memoryUsage / this.maxSize) * 100).toFixed(2))
        }
      };
    } catch (error) {
      console.error('Error getting cache health:', error);
      return {
        healthy: false,
        details: { error: error.message }
      };
    }
  }

  private startCleanupInterval(): void {
    // Cleanup expired items every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  // Clean shutdown
  destroy(): void {
    try {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }
      this.clear();
      console.log('Cache service destroyed');
    } catch (error) {
      console.error('Error destroying cache service:', error);
    }
  }
}

export const cacheService = new CacheService();

export default cacheService;
