import { resolveUnsplashImage } from './unsplashService.js';
import { rewriteToLocalImage } from './localImageUrl.js';

function parseMaybeJson(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function resolveEntityImage(entity, variant) {
  const raw = entity.image;
  const parsed = parseMaybeJson(raw);

  if (Array.isArray(parsed) || Array.isArray(raw)) {
    const items = Array.isArray(parsed) ? parsed : raw;
    const subs = entity.subcategories || [];
    const mapped = items.map((path, index) =>
      resolveUnsplashImage(
        {
          name: subs[index]?.name || entity.name,
          slug: subs[index]?.slug || entity.slug,
          category_slug: entity.slug || entity.category_slug,
          image: typeof path === 'string' ? path : path?.image,
          id: subs[index]?.id || `${entity.id || 0}-${index}`
        },
        variant
      )
    );
    const localized = mapped.map(rewriteToLocalImage);
    return typeof raw === 'string' ? JSON.stringify(localized) : localized;
  }

  return rewriteToLocalImage(resolveUnsplashImage(entity, variant));
}

function resolveGallery(entity, variant) {
  const parsed = parseMaybeJson(entity.images_gallery);
  const items = Array.isArray(parsed)
    ? parsed
    : Array.isArray(entity.images_gallery)
      ? entity.images_gallery
      : null;

  if (!items) return entity.images_gallery;

  const mapped = items.map((path, index) =>
    resolveUnsplashImage(
      {
        ...entity,
        image: typeof path === 'string' ? path : path?.image_url || path?.url,
        id: `${entity.id || 0}-g${index}`
      },
      variant
    )
  );

  const localized = mapped.map(rewriteToLocalImage);
  return typeof entity.images_gallery === 'string' ? JSON.stringify(localized) : localized;
}

export function applyUnsplashImages(data, variant = 'thumb') {
  if (Array.isArray(data)) {
    return data.map(item => applyUnsplashImages(item, variant));
  }

  if (!data || typeof data !== 'object') return data;

  const next = { ...data };

  if (Array.isArray(next.products)) {
    next.products = next.products.map(product => applyUnsplashImages(product, variant));
  }
  if (Array.isArray(next.categories)) {
    next.categories = next.categories.map(category => applyUnsplashImages(category, 'thumb'));
  }
  if (Array.isArray(next.subcategories)) {
    next.subcategories = next.subcategories.map(sub => applyUnsplashImages(sub, 'thumb'));
  }

  if ('image' in next) {
    next.image = resolveEntityImage(next, variant);
  }
  if (next.images_gallery) {
    next.images_gallery = resolveGallery(next, variant);
  }

  return next;
}
