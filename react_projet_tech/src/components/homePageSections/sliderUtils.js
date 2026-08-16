import { getProductImageSrc } from '../../utils/imageUrl';

export function normalizeSliderItem(item, index = 0) {
  const hasApiShape =
    item && item.id != null && item.price != null && typeof item.name === 'string';

  if (hasApiShape) {
    const price = Number(item.price) || 0;
    const discountPrice = Number(item.discount_price ?? item.discountPrice) || 0;
    const hasDiscount = discountPrice > 0 && discountPrice < price;
    const current = hasDiscount ? discountPrice : price;

    const product = {
      ...item,
      id: item.id,
      name: item.name,
      price,
      discount_price: hasDiscount ? discountPrice : null,
      discountPrice: hasDiscount ? discountPrice : null,
      image: item.image,
      category_id: item.category_id
    };

    return {
      product,
      id: product.id,
      name: product.name,
      alt: item.alt || product.name,
      url: getProductImageSrc(product, 'thumb'),
      route: `/product/${product.id}`,
      displayPrice: `${current} ₾`,
      displayOldPrice: hasDiscount ? `${price} ₾` : null,
      discount: hasDiscount ? Math.round((1 - current / price) * 100) : null,
      category_id: product.category_id
    };
  }

  const parsedPrice = Number(String(item.price || '').replace(/[^\d.]/g, '')) || 0;
  const parsedOld = Number(String(item.oldPrice || '').replace(/[^\d.]/g, '')) || 0;
  const id = item.id ?? `slider-${index}-${item.name || item.alt || 'item'}`;

  const product = {
    id,
    name: item.name || item.alt,
    price: parsedOld || parsedPrice,
    discount_price: parsedOld ? parsedPrice : null,
    discountPrice: parsedOld ? parsedPrice : null,
    image: item.image || item.url,
    category_id: item.category_id || 'home-slider',
    url: item.url
  };

  return {
    product,
    id,
    name: product.name,
    alt: item.alt || product.name,
    url: item.url,
    route: item.route && item.route !== '#' ? item.route : `/product/${id}`,
    displayPrice: item.price,
    displayOldPrice: item.oldPrice || null,
    discount: item.discount || null,
    category_id: product.category_id
  };
}
