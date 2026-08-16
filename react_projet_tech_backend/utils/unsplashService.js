import { buildSearchQuery, pickPhotoId, resolvePhotoGroup } from './unsplashCatalog.js';
import { isUnsplashUrl, optimizeUnsplashUrl, photoIdToUrl } from './unsplashUrl.js';
import { cacheKey, getCached, setCached } from './imageCache.js';

const UNSPLASH_SEARCH_URL = 'https://api.unsplash.com/search/photos';

function cacheId(entity = {}) {
  return entity.id ?? entity.slug ?? entity.name ?? 'item';
}

export function resolveUnsplashImage(entity = {}, variant = 'thumb') {
  const key = cacheKey(['img-v5', cacheId(entity), entity.image, entity.category_slug, variant]);
  const cached = getCached(key);
  if (cached) return cached;

  if (typeof entity.image === 'string' && entity.image.includes('/uploads/unsplash/') && /unsplash\/\d{10,}-/.test(entity.image)) {
    return setCached(key, entity.image);
  }

  if (isUnsplashUrl(entity.image)) {
    return setCached(key, optimizeUnsplashUrl(entity.image, variant));
  }

  const group = resolvePhotoGroup(entity);
  const photoId = pickPhotoId(entity, group);
  const url = optimizeUnsplashUrl(photoIdToUrl(photoId), variant);
  return setCached(key, url);
}

export async function fetchUnsplashPhotos(query, { perPage = 5 } = {}) {
  const normalized = String(query || '')
    .trim()
    .toLowerCase();
  if (!normalized) return [];

  const key = cacheKey(['unsplash-api', normalized, perPage]);
  const cached = getCached(key);
  if (cached) return cached;

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return [];

  const url = `${UNSPLASH_SEARCH_URL}?query=${encodeURIComponent(normalized)}&per_page=${perPage}&orientation=squarish`;
  const response = await fetch(url, {
    headers: { Authorization: `Client-ID ${accessKey}` }
  });

  if (!response.ok) {
    throw new Error(`Unsplash search failed with status ${response.status}`);
  }

  const payload = await response.json();
  const photos = (payload.results || []).map(photo => ({
    id: photo.id,
    url: photo.urls?.raw || photo.urls?.regular,
    alt: photo.alt_description || query
  }));

  return setCached(key, photos, 60 * 60);
}

export async function resolveUnsplashImageAsync(entity = {}, variant = 'thumb') {
  const mapped = resolveUnsplashImage(entity, variant);
  if (!process.env.UNSPLASH_ACCESS_KEY) return mapped;

  try {
    const photos = await fetchUnsplashPhotos(buildSearchQuery(entity));
    if (!photos.length) return mapped;
    const index = Math.abs(Number(entity.id) || 0) % photos.length;
    return optimizeUnsplashUrl(photos[index].url, variant);
  } catch (error) {
    console.error('Unsplash live lookup failed, using catalog image:', error.message);
    return mapped;
  }
}
