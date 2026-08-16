import NodeCache from 'node-cache';

export const imageCache = new NodeCache({
  stdTTL: 60 * 30,
  checkperiod: 120,
  useClones: false
});

export function getCached(key) {
  return imageCache.get(key);
}

export function setCached(key, value, ttl) {
  if (ttl) {
    imageCache.set(key, value, ttl);
    return value;
  }
  imageCache.set(key, value);
  return value;
}

export function cacheKey(parts) {
  return parts.filter(part => part !== undefined && part !== null && part !== '').join(':');
}
