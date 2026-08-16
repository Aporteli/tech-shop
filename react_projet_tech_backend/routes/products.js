import express from 'express';
import {
  getProductById,
  getProductByStorage,
  getSimilarProducts,
  getProductsByBrand
} from '../products/productService.js';
import db from '../config/db.js';
import { buildSearchConditions } from '../utils/searchQuery.js';
import { appendAttributeFilters } from '../utils/productFilters.js';
import { applyUnsplashImages } from '../utils/applyProductImages.js';

const router = express.Router();

// Get products by brand (must come before /:id to avoid conflict)
router.get('/brand/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { lang = 'en', page = 1, limit = 12 } = req.query;

    if (!slug) {
      return res.status(400).json({ error: 'Brand slug is required' });
    }

    const result = await getProductsByBrand(slug, lang, parseInt(page), parseInt(limit));

    if (!result) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.json(applyUnsplashImages(result, 'thumb'));
  } catch (error) {
    console.error('Error fetching products by brand:', error);
    res.status(500).json({ error: 'Server error fetching products by brand' });
  }
});

// Get single product by ID with all attributes
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { lang = 'en' } = req.query;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await getProductById(parseInt(id), lang);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(applyUnsplashImages(product, 'hero'));
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Server error fetching product' });
  }
});

// Get branches where a product is available
router.get('/:id/branches', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const [branches] = await db.query(
      `SELECT 
        b.id,
        b.name,
        b.address,
        pb.quantity
      FROM branches b
      INNER JOIN product_branches pb ON b.id = pb.branch_id
      WHERE pb.product_id = ? AND b.is_active = 1
      ORDER BY b.name`,
      [parseInt(id)]
    );

    res.json(branches);
  } catch (error) {
    console.error('Error fetching product branches:', error);
    res.status(500).json({ error: 'Server error fetching branches' });
  }
});

// Get product by storage variant
router.get('/:id/storage/:storage', async (req, res) => {
  try {
    const { id, storage } = req.params;
    const { lang = 'en' } = req.query;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    if (!storage) {
      return res.status(400).json({ error: 'Storage parameter is required' });
    }

    const product = await getProductByStorage(parseInt(id), storage, lang);

    if (!product) {
      return res.status(404).json({ error: 'Product variant not found' });
    }

    res.json(applyUnsplashImages(product, 'hero'));
  } catch (error) {
    console.error('Error fetching product by storage:', error);
    res.status(500).json({ error: 'Server error fetching product variant' });
  }
});

// Get similar products
router.get('/:id/similar', async (req, res) => {
  try {
    const { id } = req.params;
    const { lang = 'en', limit = 10 } = req.query;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const similarProducts = await getSimilarProducts(parseInt(id), lang, parseInt(limit));

    res.json(applyUnsplashImages(similarProducts, 'thumb'));
  } catch (error) {
    console.error('Error fetching similar products:', error);
    res.status(500).json({ error: 'Server error fetching similar products' });
  }
});

router.post('/filter-multi-category', async (req, res) => {
  console.log('👉 Multi-category filter request! Body:', req.body);
  try {
    const { categories, filters, lang = 'en', q } = req.body;

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ error: 'Categories array is required' });
    }

    const search = q ? buildSearchConditions(q) : null;
    const searchCondition = search ? `AND (${search.whereConditions})` : '';
    const searchParams = search ? search.wordParams : [];

    const categoryPlaceholders = categories.map(() => '?').join(',');
    let sql = `
      SELECT p.*, c.slug AS category_slug, ct.title AS category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.lang = ?
      WHERE c.slug IN (${categoryPlaceholders}) AND p.is_active = 1 ${searchCondition}
    `;
    const queryParams = [lang, ...categories, ...searchParams];

    sql = appendAttributeFilters(sql, queryParams, filters, lang);

    // Sort by date (newest first)
    sql += ` ORDER BY p.created_at DESC;`;

    // 3. Execute query
    const [products] = await db.query(sql, queryParams);

    console.log(`Found ${products.length} products matching filters`);
    res.json(applyUnsplashImages(products, 'thumb'));
  } catch (error) {
    console.error('Error filtering products by attributes across categories:', error);
    res.status(500).json({ error: 'Server error filtering products' });
  }
});

export default router;
