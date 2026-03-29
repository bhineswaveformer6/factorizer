import crypto from "crypto";

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export function hashInput(input: string | Buffer): string {
  return crypto.createHash('md5').update(input).digest('hex');
}

export function getCache(hash: string): any | null {
  const entry = cache.get(hash);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(hash);
    return null;
  }
  return entry.data;
}

export function setCache(hash: string, data: any, ttl: number = SEVEN_DAYS): void {
  cache.set(hash, { data, timestamp: Date.now(), ttl });
}

export function getCacheStats(): { entries: number; oldestMs: number } {
  let oldest = Date.now();
  cache.forEach(v => { if (v.timestamp < oldest) oldest = v.timestamp; });
  return { entries: cache.size, oldestMs: oldest };
}
