import path from 'path';
import { extractUnsplashPhotoId, isUnsplashUrl } from './unsplashUrl.js';
import { cachedPhotoPath, DEFAULT_PHOTO_ID, FALLBACK_SVG } from './imageStore.js';

function publicPathFor(photoId) {
  const filePath = cachedPhotoPath(photoId) || FALLBACK_SVG;
  const fileName = path.basename(filePath);
  return `/uploads/unsplash/${fileName}`;
}

export function toPublicImageUrl(pathname) {
  if (!pathname) return publicPathFor(DEFAULT_PHOTO_ID);
  if (/^https?:\/\//i.test(pathname) && pathname.includes('/uploads/')) {
    try {
      return new URL(pathname).pathname;
    } catch {
      return pathname;
    }
  }
  if (/^https?:\/\//i.test(pathname) && !isUnsplashUrl(pathname)) return pathname;
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

export function rewriteToLocalImage(image, fallbackPhotoId = DEFAULT_PHOTO_ID) {
  if (typeof image !== 'string' || !image.trim()) {
    return toPublicImageUrl(publicPathFor(fallbackPhotoId));
  }

  if (image.startsWith('/uploads/')) {
    return toPublicImageUrl(image);
  }

  if (/^https?:\/\//i.test(image) && image.includes('/uploads/')) {
    return toPublicImageUrl(image);
  }

  const photoId = extractUnsplashPhotoId(image) || (isUnsplashUrl(image) ? fallbackPhotoId : null);
  if (photoId) {
    return toPublicImageUrl(publicPathFor(photoId));
  }

  return image;
}
