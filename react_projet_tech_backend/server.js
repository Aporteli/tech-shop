import { GoogleGenAI } from '@google/genai';
import './config/firebaseAdmin.js';

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import mysql from 'mysql2/promise';
import 'dotenv/config';
import categoryRouter from './routes/categories.js';
import authRouter from './register.js';
import signIn from './signIn.js';
import googleAuth from './routes/googleAuth.js';
import emailVarification from './email-verification/emailVerification.js';
import compareAPI from './compare/compare.js';
import productsRouter from './routes/products.js';
import userSync from './user/sync.js';
import cartEdit from './cartTableEdit/cart.js';
import wishlist from './wishlistTableEdit/wishlist.js';
import db from './config/db.js';
import { buildSearchConditions } from './utils/searchQuery.js';
import { appendAttributeFilters } from './utils/productFilters.js';
import { applyUnsplashImages } from './utils/applyProductImages.js';
import { getCached, setCached, cacheKey } from './utils/imageCache.js';
import { extractUnsplashPhotoId } from './utils/unsplashUrl.js';
import { cachedPhotoPath, DEFAULT_PHOTO_ID, ensureCachedPhoto, FALLBACK_SVG } from './utils/imageStore.js';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const app = express();

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());

app.get('/uploads/unsplash/:file', (req, res, next) => {
  try {
    const photoId =
      extractUnsplashPhotoId(req.params.file) || req.params.file.replace(/\.[^.]+$/, '');
    const existing = cachedPhotoPath(photoId);
    if (!existing) {
      ensureCachedPhoto(photoId).catch(() => {});
    }
    const filePath = existing || cachedPhotoPath(DEFAULT_PHOTO_ID) || FALLBACK_SVG;
    res.setHeader('Cache-Control', existing ? 'public, max-age=604800, immutable' : 'public, max-age=60');
    return res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
});

app.use(
  '/uploads',
  express.static('images', {
    maxAge: '7d',
    etag: true,
    lastModified: true
  })
);

// 2. პროდუქტების წამოღება პირდაპირი SQL მოთხოვნით
app.get('/api/products', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const cachedKey = cacheKey(['api-products-v8', lang]);
    const cached = getCached(cachedKey);
    if (cached) {
      return res.json(cached);
    }

    const [products] = await db.query(`
      SELECT p.*, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `);
    const payload = applyUnsplashImages(products, 'thumb');
    setCached(cachedKey, payload, 120);
    res.json(payload);
  } catch (error) {
    console.error('შეცდომა პროდუქტების წამოღებისას:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products/filter', async (req, res) => {
  console.log('👉 მოთხოვნა შემოვიდა ბექენდში! Body:', req.body);
  try {
    const { category, filters, lang = 'en' } = req.body;

    // 1. საბაზო Query კატეგორიისა და აქტიური პროდუქტებისთვის
    let sql = `
      SELECT p.*, c.slug AS category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE c.slug = ? AND p.is_active = 1
    `;
    const queryParams = [category];

    if (filters && Object.keys(filters).length > 0) {
      sql = appendAttributeFilters(sql, queryParams, filters, lang);
    }

    // შედეგის სორტირება თარიღით (ახლები თავში)
    sql += ` ORDER BY p.created_at DESC;`;

    // 3. ბაზაში მოთხოვნის გაშვება
    const [products] = await db.query(sql, queryParams);

    // გაფილტრული პროდუქტების დაბრუნება ფრონტზე
    res.json(applyUnsplashImages(products, 'thumb'));
  } catch (error) {
    console.error('შეცდომა პროდუქტების ფილტრაციისას:', error);
    res.status(500).json({ error: 'სერვერის შეცდომა' });
  }
});

// AI ტექსტიდან SQL-ის გენერაციის ენდპოინტი
app.post('/api/ai-query', async (req, res) => {
  console.log('👉 AI მოთხოვნა შემოსულია! კითხვა:', req.body.userQuestion);
  try {
    const { userQuestion } = req.body;

    if (!userQuestion) {
      return res.status(400).json({ error: 'კითხვა არ არის მითითებული' });
    }

    // ვუწერთ ინსტრუქციას და ვაწვდით ბაზის სქემას
    const prompt = `
      შენ ხარ პროფესიონალი SQL ექსპერტი. მე მაქვს MySQL ბაზა შემდეგი ზუსტი სქემით:
      - categories (id, name, slug)
      - products (id, category_id, name, price, discount_price, is_active, created_at)
      - product_attribute_values (id, product_id, attribute_id)
      - attribute_translations (id, attribute_id, name, locale)
      - product_attribute_values_translations (id, product_attribute_value_id, value, lang)

      მომხმარებლის კითხვის საფუძველზე დაწერე მხოლოდ და მხოლოდ გამართული SQL მოთხოვნა MySQL-ისთვის.
      არ დაწერო არანაირი ახსნა-განმარტება ან ტექსტი. დააბრუნე მხოლოდ სუფთა SQL კოდი, რომელიც იწყება SELECT-ით.
      
      კითხვა: "${userQuestion}"
    `;

    // ვუგზავნით მოთხოვნას Gemini-ს (გამოვიყენოთ gemini-2.5-flash მოდელი)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    let sqlQuery = response.text.trim();

    // ვწმენდთ კოდს Markdown სიმბოლოებისგან (თუ AI-მ ```sql ... ``` ფორმატით დააბრუნა)
    sqlQuery = sqlQuery
      .replace(/```sql/g, '')
      .replace(/```/g, '')
      .trim();

    console.log('🤖 Gemini-ს გენერირებული SQL:', sqlQuery);

    // უსაფრთხოების შემოწმება: მხოლოდ SELECT მოთხოვნების გაშვება შეიძლება!
    if (!sqlQuery.toLowerCase().startsWith('select')) {
      return res.status(400).json({ error: 'AI-მ სცადა არაუსაფრთხო მოთხოვნის შესრულება.' });
    }

    // ვუშვებთ გენერირებულ SQL-ს ჩვენს MySQL ბაზაში
    const [rows] = await db.query(sqlQuery);

    // ვუბრუნებთ შედეგს ფრონტენდს
    res.json({
      sql: sqlQuery,
      result: rows
    });
  } catch (error) {
    console.error('AI Query Error:', error);
    res.status(500).json({ error: 'სერვერის შეცდომა AI-ს დამუშავებისას' });
  }
});

// 4. პროდუქტების ძებნის ენდპოინტი
app.get('/api/search', async (req, res) => {
  try {
    const { q, lang = 'en', category, limit = '50' } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({ products: [], categories: [] });
    }

    const search = buildSearchConditions(q);
    if (!search) {
      return res.json({ products: [], categories: [] });
    }

    const { whereConditions, wordParams, primaryPattern } = search;
    const categoryCondition = category ? 'AND c.slug = ?' : '';
    const categoryParams = category ? [category] : [];
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 500);

    const productsQuery = `
      SELECT DISTINCT
        p.id, p.name, p.slug, p.price, p.discount_price, p.image, p.is_active,
        c.slug AS category_slug,
        p.category_id,
        ct.title AS category_name,
        b.name AS brand_name,
        CASE
          WHEN p.name LIKE ? THEN 0
          WHEN b.name LIKE ? THEN 1
          WHEN p.short_description LIKE ? THEN 2
          ELSE 3
        END AS relevance
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.lang = ?
      WHERE p.is_active = 1 AND (${whereConditions}) ${categoryCondition}
      ORDER BY relevance ASC, p.name ASC
      LIMIT ${parsedLimit}
    `;

    const categoriesQuery = `
      SELECT
        c.id, c.slug, ct.title AS name,
        COUNT(DISTINCT p.id) AS count
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.lang = ?
      WHERE p.is_active = 1 AND (${whereConditions})
      GROUP BY c.id, c.slug, ct.title
      ORDER BY count DESC
    `;

    const productParams = [primaryPattern, primaryPattern, primaryPattern, lang, ...wordParams, ...categoryParams];
    const categoryQueryParams = [lang, ...wordParams];

    const [[products], [categories]] = await Promise.all([
      db.query(productsQuery, productParams),
      db.query(categoriesQuery, categoryQueryParams)
    ]);

    res.json({
      products: applyUnsplashImages(products, 'thumb'),
      categories
    });
  } catch (error) {
    console.error('შეცდომა ძებნისას:', error);
    res.status(500).json({ error: error.message });
  }
});
app.use('/api/categories', categoryRouter);
app.use('/api/register', authRouter);
app.use('/api/signIn', signIn);
app.use('/api/auth', googleAuth);
app.use('/api/verification', emailVarification);
app.use('/api/compare', compareAPI);
app.use('/api/products', productsRouter);
app.use('/api/user', userSync);
app.use('/api/cart', cartEdit);
app.use('/api/wishlist', wishlist);

const PORT = 5001;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
