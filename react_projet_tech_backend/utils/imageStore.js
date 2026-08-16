import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { photoIdToUrl } from './unsplashUrl.js';

export const LOCAL_IMAGE_DIR = path.resolve('images', 'unsplash');
export const FALLBACK_SVG = path.join(LOCAL_IMAGE_DIR, 'fallback.svg');
export const DEFAULT_PHOTO_ID = '1518770660439-4636190af475';

const inflight = new Map();

function jpgPath(photoId) {
  return path.join(LOCAL_IMAGE_DIR, `${photoId}.jpg`);
}

function svgPath(photoId) {
  return path.join(LOCAL_IMAGE_DIR, `${photoId}.svg`);
}

export function cachedPhotoPath(photoId) {
  if (!photoId) return FALLBACK_SVG;
  if (fs.existsSync(jpgPath(photoId))) return jpgPath(photoId);
  if (fs.existsSync(svgPath(photoId))) return svgPath(photoId);
  return null;
}

export async function ensureCachedPhoto(photoId) {
  const id = photoId || DEFAULT_PHOTO_ID;
  const existing = cachedPhotoPath(id);
  if (existing) return existing;

  if (inflight.has(id)) return inflight.get(id);

  const job = downloadPhoto(id).finally(() => inflight.delete(id));
  inflight.set(id, job);
  return job;
}

async function downloadPhoto(id) {
  await fsp.mkdir(LOCAL_IMAGE_DIR, { recursive: true });

  const url = `${photoIdToUrl(id)}?w=800&h=800&fit=crop&fm=jpg&q=70`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        Accept: 'image/jpeg,image/webp,image/*,*/*',
        'User-Agent': 'Mozilla/5.0 TechShopImageCache'
      }
    });
    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`status ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      throw new Error(`unexpected type ${contentType}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 1500) {
      throw new Error('file too small');
    }

    await fsp.writeFile(jpgPath(id), buffer);
    return jpgPath(id);
  } catch (error) {
    console.warn(`Could not cache Unsplash photo ${id}: ${error.message}`);
    return fs.existsSync(FALLBACK_SVG) ? FALLBACK_SVG : jpgPath(DEFAULT_PHOTO_ID);
  }
}
