import db from '../config/db.js';

export async function getProductById(productId, lang = 'en') {
  try {
    // 1. Get product basic info with category
    const [products] = await db.query(
      `SELECT 
        p.*,
        c.slug as category_slug,
        c.id as category_id,
        ct.title as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.lang = ?
      WHERE p.id = ? AND p.is_active = 1`,
      [lang, productId]
    );

    if (products.length === 0) {
      return null;
    }

    const product = products[0];

    // ------------------- 🟢 მეხსიერების ზომების (Storages) წამოღება -------------------
    // დასახელებიდან ამოვიღებთ მოდელის ძირითად ფუძეს (Base Name)
    const baseName = product.name
      .replace(/\s+\d+GB\/\d+(GB|TB).*/i, '') // ამოჭრის მაგ: "12GB/256GB 5G Black"
      .replace(/\s+\d+(GB|TB).*/i, '') // ამოჭრის მაგ: "256GB..."
      .trim();

    // SQL ეძებს დახრილი ხაზის შემდეგ არსებულ მეხსიერებას (მაგ: /256GB ან /1TB), რომ RAM იგნორირებული იყოს
    const [storageRows] = await db.query(
      `SELECT DISTINCT REGEXP_SUBSTR(name, '/[0-9]+(GB|TB)') AS storage
       FROM products
       WHERE brand_id = ? 
         AND name LIKE ?
         AND is_active = 1`,
      [product.brand_id, `${baseName}%`]
    );

    // სლეშს (/) ჩამოვაჭრით, რომ დარჩეს სუფთა ["256GB", "512GB", "1TB"]
    const availableStorages = storageRows
      .map(row => (row.storage ? row.storage.replace('/', '') : null))
      .filter(Boolean);
    // ---------------------------------------------------------------------------------

    // 2. Get all attribute groups for this category
    const [attributeGroups] = await db.query(
      `SELECT 
        ag.id,
        ag.position,
        agt.name as group_name
      FROM attribute_groups ag
      LEFT JOIN attribute_group_translations agt ON ag.id = agt.attribute_group_id AND agt.locale = ?
      WHERE ag.id IN (
        SELECT DISTINCT attribute_group_id 
        FROM attributes 
        WHERE id IN (
          SELECT DISTINCT attribute_id 
          FROM product_attribute_values 
          WHERE product_id = ?
        )
      )
      ORDER BY ag.position`,
      [lang, productId]
    );

    // 3. Get all attributes with their values for this product
    const [attributes] = await db.query(
      `SELECT 
        a.id as attribute_id,
        a.attribute_group_id,
        at.name as attribute_name,
        pav.id as product_attribute_value_id,
        pavt.value as attribute_value
      FROM product_attribute_values pav
      JOIN attributes a ON pav.attribute_id = a.id
      JOIN attribute_translations at ON a.id = at.attribute_id AND at.locale = ?
      LEFT JOIN product_attribute_values_translations pavt ON pav.id = pavt.product_attribute_value_id AND pavt.lang = ?
      WHERE pav.product_id = ?
      ORDER BY a.attribute_group_id, a.id`,
      [lang, lang, productId]
    );

    // 4. Group attributes by attribute groups
    const attributeGroupsMap = {};
    attributeGroups.forEach(group => {
      attributeGroupsMap[group.id] = {
        id: group.id,
        name: group.group_name,
        position: group.position,
        attributes: []
      };
    });

    attributes.forEach(attr => {
      const groupId = attr.attribute_group_id;
      if (attributeGroupsMap[groupId]) {
        attributeGroupsMap[groupId].attributes.push({
          id: attr.attribute_id,
          name: attr.attribute_name,
          value: attr.attribute_value
        });
      } else {
        // Handle attributes without a group
        if (!attributeGroupsMap['ungrouped']) {
          attributeGroupsMap['ungrouped'] = {
            id: null,
            name: 'Other',
            position: 988,
            attributes: []
          };
        }
        attributeGroupsMap['ungrouped'].attributes.push({
          id: attr.attribute_id,
          name: attr.attribute_name,
          value: attr.attribute_value
        });
      }
    });

    // Convert to array and sort by position
    const groupedAttributes = Object.values(attributeGroupsMap)
      .filter(group => group.attributes.length > 0)
      .sort((a, b) => a.position - b.position);

    // 5. Return full product response (available_storages ჩაემატება მხოლოდ მაშინ, თუ 1-ზე მეტი ვარიანტია)
    return {
      ...product,
      ...(availableStorages.length > 1 && { available_storages: availableStorages }),
      attributeGroups: groupedAttributes
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

export async function getProductsByBrand(brandSlug, lang = 'en', page = 1, limit = 12) {
  try {
    // Get brand by slug
    const [brands] = await db.query(`SELECT id, name, slug FROM brands WHERE slug = ?`, [
      brandSlug
    ]);

    if (brands.length === 0) {
      return null;
    }

    const brand = brands[0];

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get total count of products for this brand
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM products WHERE brand_id = ? AND is_active = 1`,
      [brand.id]
    );

    const total = countResult[0].total;

    // Get products for this brand with pagination
    const [products] = await db.query(
      `SELECT 
        p.id,
        p.name,
        p.slug,
        p.price,
        p.discount_price,
        p.image,
        c.slug as category_slug,
        ct.title as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.lang = ?
      WHERE p.brand_id = ? AND p.is_active = 1
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?`,
      [lang, brand.id, limit, offset]
    );

    return {
      brand,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching products by brand:', error);
    throw error;
  }
}

export async function getSimilarProducts(productId, lang = 'en', limit = 10) {
  try {
    // Get the current product's category and brand
    const [currentProducts] = await db.query(
      `SELECT category_id, brand_id FROM products WHERE id = ? AND is_active = 1`,
      [productId]
    );

    if (currentProducts.length === 0) {
      return [];
    }

    const currentProduct = currentProducts[0];

    // Get similar products (same category, same brand, excluding current product)
    const [similarProducts] = await db.query(
      `SELECT 
        p.id,
        p.name,
        p.price,
        p.discount_price,
        p.image,
        p.slug,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? 
        AND p.brand_id = ? 
        AND p.id != ? 
        AND p.is_active = 1
      ORDER BY p.created_at DESC
      LIMIT ?`,
      [currentProduct.category_id, currentProduct.brand_id, productId, limit]
    );

    return similarProducts;
  } catch (error) {
    console.error('Error fetching similar products:', error);
    throw error;
  }
}

export async function getProductByStorage(baseProductId, storage, lang = 'en') {
  try {
    // 1. Get the base product to extract base name and brand
    const [baseProducts] = await db.query(
      `SELECT p.*, c.slug as category_slug, c.id as category_id, ct.title as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.lang = ?
       WHERE p.id = ? AND p.is_active = 1`,
      [lang, baseProductId]
    );

    if (baseProducts.length === 0) {
      return null;
    }

    const baseProduct = baseProducts[0];

    // 2. Extract base name (remove storage info)
    const baseName = baseProduct.name
      .replace(/\s+\d+GB\/\d+(GB|TB).*/i, '')
      .replace(/\s+\d+(GB|TB).*/i, '')
      .trim();

    // 3. Find product with matching storage
    const storagePattern = `/${storage}`;
    const [variantProducts] = await db.query(
      `SELECT p.*, c.slug as category_slug, c.id as category_id, ct.title as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.lang = ?
       WHERE p.brand_id = ? 
         AND p.name LIKE ?
         AND p.name LIKE ?
         AND p.is_active = 1`,
      [lang, baseProduct.brand_id, `${baseName}%`, `%${storagePattern}%`]
    );

    if (variantProducts.length === 0) {
      return null;
    }

    const variantProduct = variantProducts[0];

    // 4. Get available storages for the variant
    const [storageRows] = await db.query(
      `SELECT DISTINCT REGEXP_SUBSTR(name, '/[0-9]+(GB|TB)') AS storage
       FROM products
       WHERE brand_id = ? 
         AND name LIKE ?
         AND is_active = 1`,
      [variantProduct.brand_id, `${baseName}%`]
    );

    const availableStorages = storageRows
      .map(row => (row.storage ? row.storage.replace('/', '') : null))
      .filter(Boolean);

    // 5. Get attribute groups
    const [attributeGroups] = await db.query(
      `SELECT 
        ag.id,
        ag.position,
        agt.name as group_name
      FROM attribute_groups ag
      LEFT JOIN attribute_group_translations agt ON ag.id = agt.attribute_group_id AND agt.locale = ?
      WHERE ag.id IN (
        SELECT DISTINCT attribute_group_id 
        FROM attributes 
        WHERE id IN (
          SELECT DISTINCT attribute_id 
          FROM product_attribute_values 
          WHERE product_id = ?
        )
      )
      ORDER BY ag.position`,
      [lang, variantProduct.id]
    );

    // 6. Get attributes with values
    const [attributes] = await db.query(
      `SELECT 
        a.id as attribute_id,
        a.attribute_group_id,
        at.name as attribute_name,
        pav.id as product_attribute_value_id,
        pavt.value as attribute_value
      FROM product_attribute_values pav
      JOIN attributes a ON pav.attribute_id = a.id
      JOIN attribute_translations at ON a.id = at.attribute_id AND at.locale = ?
      LEFT JOIN product_attribute_values_translations pavt ON pav.id = pavt.product_attribute_value_id AND pavt.lang = ?
      WHERE pav.product_id = ?
      ORDER BY a.attribute_group_id, a.id`,
      [lang, lang, variantProduct.id]
    );

    // 7. Group attributes
    const attributeGroupsMap = {};
    attributeGroups.forEach(group => {
      attributeGroupsMap[group.id] = {
        id: group.id,
        name: group.group_name,
        position: group.position,
        attributes: []
      };
    });

    attributes.forEach(attr => {
      const groupId = attr.attribute_group_id;
      if (attributeGroupsMap[groupId]) {
        attributeGroupsMap[groupId].attributes.push({
          id: attr.attribute_id,
          name: attr.attribute_name,
          value: attr.attribute_value
        });
      } else {
        if (!attributeGroupsMap['ungrouped']) {
          attributeGroupsMap['ungrouped'] = {
            id: null,
            name: 'Other',
            position: 988,
            attributes: []
          };
        }
        attributeGroupsMap['ungrouped'].attributes.push({
          id: attr.attribute_id,
          name: attr.attribute_name,
          value: attr.attribute_value
        });
      }
    });

    const groupedAttributes = Object.values(attributeGroupsMap)
      .filter(group => group.attributes.length > 0)
      .sort((a, b) => a.position - b.position);

    return {
      ...variantProduct,
      ...(availableStorages.length > 1 && { available_storages: availableStorages }),
      attributeGroups: groupedAttributes
    };
  } catch (error) {
    console.error('Error fetching product by storage:', error);
    throw error;
  }
}
