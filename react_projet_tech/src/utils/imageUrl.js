import { pickPhotoId, resolvePhotoGroup } from './unsplashCatalog';
import {
  extractUnsplashPhotoId,
  isRemoteUrl,
  isUnsplashUrl,
  photoIdToUrl
} from './unsplashUrl';

export const FALLBACK_IMAGE = '/product-fallback.svg';
const DEFAULT_LOCAL_IMAGE = '/uploads/unsplash/1518770660439-4636190af475.jpg';

export function toLocalImageSrc(url) {
  if (!url || typeof url !== 'string') return FALLBACK_IMAGE;

  if (url.startsWith('/uploads/')) return url;
  if (url.startsWith('/product-fallback') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith('/uploads/')) return parsed.pathname;
  } catch {
    // keep going
  }

  const photoId = extractUnsplashPhotoId(url);
  if (photoId) return `/uploads/unsplash/${photoId}.jpg`;
  if (isUnsplashUrl(url)) return DEFAULT_LOCAL_IMAGE;

  if (url.startsWith('/') || url.startsWith('.') || url.includes('/assets/')) return url;
  if (isRemoteUrl(url)) return url;

  return FALLBACK_IMAGE;
}

function isUsableSrc(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('/uploads/') || url.startsWith('/product-fallback')) return true;
  if (url.startsWith('blob:') || url.startsWith('data:')) return true;
  if (isRemoteUrl(url)) return true;
  if (url.startsWith('/') || url.startsWith('.') || url.includes('/assets/')) return true;
  return false;
}

export function getProductImageCandidates(product = {}, variant = 'thumb') {
  const image = product.image || product.url || product.src;

  if (isUsableSrc(image)) {
    return [toLocalImageSrc(image), FALLBACK_IMAGE];
  }

  const group = resolvePhotoGroup(product);
  const photoId = pickPhotoId(product, group);
  return [toLocalImageSrc(photoIdToUrl(photoId)), FALLBACK_IMAGE];
}

export function getProductImageSrc(product = {}, variant = 'thumb') {
  return getProductImageCandidates(product, variant)[0] || FALLBACK_IMAGE;
}

export function getCategoryImageSrc(image, meta = {}, variant = 'thumb') {
  return getProductImageSrc({ ...meta, image }, variant);
}

export function parseCategoryImages(imageField) {
  if (Array.isArray(imageField)) return imageField;
  if (typeof imageField !== 'string') return [];

  const trimmed = imageField.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return trimmed ? [trimmed] : [];
}
