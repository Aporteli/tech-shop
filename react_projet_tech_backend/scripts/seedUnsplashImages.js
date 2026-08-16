import 'dotenv/config';
import db from '../config/db.js';
import { applyUnsplashImages } from '../utils/applyProductImages.js';
import { resolveUnsplashImageAsync } from '../utils/unsplashService.js';

async function seedProducts() {
  const [products] = await db.query(
    `SELECT p.id, p.name, p.slug, p.image, p.images_gallery, c.slug AS category_slug
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id`
  );

  for (const product of products) {
    const image = process.env.UNSPLASH_ACCESS_KEY
      ? await resolveUnsplashImageAsync(product, 'hero')
      : applyUnsplashImages(product, 'hero').image;

    await db.query('UPDATE products SET image = ? WHERE id = ?', [image, product.id]);
  }

  return products.length;
}

async function seedCategories() {
  const [categories] = await db.query(
    `SELECT c.id, c.slug, c.image, ct.title AS name
     FROM categories c
     LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.lang = 'en'`
  );

  for (const category of categories) {
    const [subcategories] = await db.query(
      `SELECT c.id, c.slug, ct.title AS name
       FROM categories c
       LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.lang = 'en'
       WHERE c.parent_id = ?`,
      [category.id]
    );

    const mapped = applyUnsplashImages({ ...category, subcategories }, 'thumb');
    await db.query('UPDATE categories SET image = ? WHERE id = ?', [mapped.image, category.id]);
  }

  return categories.length;
}

async function run() {
  try {
    const productCount = await seedProducts();
    const categoryCount = await seedCategories();
    console.log(`Seeded Unsplash images for ${productCount} products and ${categoryCount} categories.`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed Unsplash images:', error);
    process.exit(1);
  }
}

run();
