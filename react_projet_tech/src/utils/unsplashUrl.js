export const IMAGE_VARIANTS = {
  thumb: { auto: 'format', fit: 'crop', w: '600', q: '80' },
  hero: { auto: 'format', fit: 'crop', w: '1200', q: '85' },
  blur: { auto: 'format', fit: 'crop', w: '24', q: '10' }
};

const UNSPLASH_HOSTS = ['images.unsplash.com', 'plus.unsplash.com', 'source.unsplash.com'];

export function isRemoteUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url);
}

export function isUnsplashUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (!/^https?:\/\//i.test(url) && !url.includes('unsplash.com')) return false;
  try {
    const host = new URL(url).hostname;
    return UNSPLASH_HOSTS.some(item => host.includes(item));
  } catch {
    return url.includes('unsplash.com');
  }
}

export function getUnsplashBaseUrl(url) {
  if (!url || typeof url !== 'string') return url;
  return url.split('?')[0];
}

export function photoIdToUrl(photoId) {
  return `https://images.unsplash.com/photo-${photoId}`;
}

export function extractUnsplashPhotoId(url) {
  if (!url || typeof url !== 'string') return null;

  const photoMatch = url.match(/photo-(\d{10,}-[a-zA-Z0-9]+)/i);
  if (photoMatch) return photoMatch[1];

  const localMatch = url.match(/unsplash\/(\d{10,}-[a-zA-Z0-9]+)\.(?:jpg|jpeg|png|webp|svg)/i);
  return localMatch ? localMatch[1] : null;
}

export function optimizeUnsplashUrl(url, variant = 'thumb') {
  if (!url || typeof url !== 'string' || !isUnsplashUrl(url)) return url;

  const params = IMAGE_VARIANTS[variant] || IMAGE_VARIANTS.thumb;
  const search = new URLSearchParams(params);
  return `${getUnsplashBaseUrl(url)}?${search.toString()}`;
}

export function buildUnsplashSrcSet(url, widths = [400, 600, 800, 1200]) {
  if (!isUnsplashUrl(url)) return undefined;

  const base = getUnsplashBaseUrl(url);
  return widths
    .map(width => {
      const search = new URLSearchParams({
        auto: 'format',
        fit: 'crop',
        w: String(width),
        q: width >= 1000 ? '85' : '80'
      });
      return `${base}?${search.toString()} ${width}w`;
    })
    .join(', ');
}

export function getDefaultSizes(variant = 'thumb') {
  if (variant === 'hero') {
    return '(max-width: 768px) 100vw, 1200px';
  }
  return '(max-width: 480px) 50vw, (max-width: 900px) 33vw, 300px';
}
