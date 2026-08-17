import i18n from '../i18n';
import { API_URL } from './apiBase';

const BASE_URL = `${API_URL}/api`;

function humanizeSlug(slug) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatCategoryName(name, slug) {
  if (!name || name === 'Translation missing') {
    return humanizeSlug(slug);
  }
  return name;
}

async function fetchSingleCategory(slug, lang) {
  const response = await fetch(`${BASE_URL}/categories/single/${slug}?lang=${lang}`);
  if (!response.ok) return null;
  return response.json();
}

async function buildCategoryTree(parentSlug, lang) {
  const root = await fetchSingleCategory(parentSlug, lang);
  if (!root?.subcategories?.length) return [];

  const groups = await Promise.all(
    root.subcategories.map(async sub => {
      const nested = await fetchSingleCategory(sub.slug, lang);
      return {
        id: sub.id,
        slug: sub.slug,
        name: formatCategoryName(sub.name, sub.slug),
        children: (nested?.subcategories || []).map(child => ({
          id: child.id,
          slug: child.slug,
          name: formatCategoryName(child.name, child.slug)
        }))
      };
    })
  );

  return groups;
}

// Used in subCategories.jsx

export async function fetchMainCategorySlugs() {
  try {
    const response = await fetch(`${BASE_URL}/categories/main-categories-slugs`);
    if (!response.ok) throw new Error('მთავარი კატეგორიების სლაგები ვერ მოიძებნა');
    return await response.json();
  } catch (error) {
    console.error('fetchMainCategorySlugs error:', error);
    throw error;
  }
}

export async function fetchMegaMenuSubcategories(parentSlug, lang = 'en') {
  if (!parentSlug) return [];
  const cleanLang = lang.split('-')[0];

  try {
    const response = await fetch(
      `${BASE_URL}/categories/mega-menu/${parentSlug}?lang=${cleanLang}`
    );
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (error) {
    console.error('fetchMegaMenuSubcategories error:', error);
  }

  try {
    return await buildCategoryTree(parentSlug, cleanLang);
  } catch (error) {
    console.error('fetchMegaMenuSubcategories fallback error:', error);
    return [];
  }
}

export async function fetchsubCategorySlugs(slug) {
  try {
    if (!slug) return [];
    const response = await fetch(`${BASE_URL}/categories/sub_categories_slug/${slug}`);
    if (!response.ok) throw new Error('Cannot find sub category slug');
    return await response.json();
  } catch (error) {
    console.error('fetchsubCategorySlugs error:', error);
    throw error;
  }
}

export async function fetchSubCategories(slug, lang) {
  try {
    if (!slug) return [];
    const cleanLang = lang ? lang.split('-')[0] : 'en';
    const response = await fetch(`${BASE_URL}/categories/s/${slug}?lang=${cleanLang}`);
    if (!response.ok) throw new Error('Cannot find sub category slug');
    return await response.json();
  } catch (error) {
    console.error('fetchsubCategorySlugs error:', error);
    throw error;
  }
}

export async function fetchCategoryBreadcrumb(slug, lang) {
  if (!slug) return null;
  const cleanLang = lang ? lang.split('-')[0] : 'en';

  try {
    const [subsRes, mainsRes] = await Promise.all([
      fetch(`${BASE_URL}/categories/all-subcategories?lang=${cleanLang}`),
      fetch(`${BASE_URL}/categories/main-categories-slugs`)
    ]);

    if (!subsRes.ok) return null;

    const subs = await subsRes.json();
    const mains = mainsRes.ok ? await mainsRes.json() : [];
    const row = Array.isArray(subs) ? subs.find(item => item.sub_slug === slug) : null;

    if (!row?.parent_slug) return null;

    const parentIsMain = Array.isArray(mains) && mains.includes(row.parent_slug);

    return {
      parentCategor: row.parent_name || null,
      parentSlug: row.parent_slug,
      parentParentId: parentIsMain ? null : 1,
      subCategory: row.sub_name || null
    };
  } catch (error) {
    console.error('fetchCategoryBreadcrumb error:', error);
    return null;
  }
}

export async function fetchSubCateogryScreenAttributes(slug, lang) {
  try {
    if (!slug) return [];
    const cleanLang = lang ? lang.split('-')[0] : 'en';
    const response = await fetch(`${BASE_URL}/categories/screen_attribute/${slug}?lang=${cleanLang}`);
    if (!response.ok) throw new Error('Cannot find sub category slug');
    return await response.json();
  } catch (error) {
    console.error('fetchSubCateogryScreenAttributes error:', error);
    throw error;
  }
}

export async function fetchSubCateogryCompareScreenAttributes(category, lang) {
  try {
    if (!category) return [];
    const cleanLang = lang ? lang.split('-')[0] : 'ka';
    const response = await fetch(
      `${BASE_URL}/compare/screen_attribute?category=${encodeURIComponent(category)}&lang=${cleanLang}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch screen attributes');
    }
    return await response.json();
  } catch (error) {
    console.error('fetchSubCateogryCompareScreenAttributes error:', error);
    throw error;
  }
}

export async function fetchAllCategoryAttributes(slug, lang) {
  try {
    if (!slug) return [];
    const cleanLang = lang ? lang.split('-')[0] : 'en';
    const response = await fetch(`${BASE_URL}/categories/all_attributes/${slug}?lang=${cleanLang}`);
    if (!response.ok) throw new Error('Cannot find all category attributes');
    return await response.json();
  } catch (error) {
    console.error('fetchAllCategoryAttributes error:', error);
    throw error;
  }
}
