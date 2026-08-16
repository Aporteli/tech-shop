import db from '../config/db.js';

const TARGET = 2000;

try {
  const [[before]] = await db.query(`
    SELECT COUNT(*) AS total,
           SUM(is_active = 1) AS active,
           SUM(is_active = 0) AS inactive
    FROM products
  `);
  console.log('Before', before);

  const [categories] = await db.query(`
    SELECT category_id, COUNT(*) AS total
    FROM products
    GROUP BY category_id
    ORDER BY total DESC, category_id ASC
  `);

  const grandTotal = categories.reduce((sum, row) => sum + Number(row.total), 0);
  const quotas = categories.map(row => ({
    categoryId: row.category_id,
    total: Number(row.total),
    keep: Math.max(1, Math.round((TARGET * Number(row.total)) / grandTotal))
  }));

  let keepSum = quotas.reduce((sum, row) => sum + row.keep, 0);
  while (keepSum > TARGET) {
    const candidate = quotas.find(row => row.keep > 1 && row.keep <= row.total);
    if (!candidate) break;
    candidate.keep -= 1;
    keepSum -= 1;
  }
  while (keepSum < TARGET) {
    const candidate = quotas.find(row => row.keep < row.total);
    if (!candidate) break;
    candidate.keep += 1;
    keepSum += 1;
  }

  const keepIds = [];
  for (const quota of quotas) {
    const [rows] = await db.query(
      `
        SELECT id
        FROM products
        WHERE category_id = ?
        ORDER BY is_active DESC, id ASC
        LIMIT ?
      `,
      [quota.categoryId, quota.keep]
    );
    keepIds.push(...rows.map(row => row.id));
  }

  const keepSet = new Set(keepIds);
  const [allProducts] = await db.query('SELECT id FROM products');
  const deleteIds = allProducts.map(row => row.id).filter(id => !keepSet.has(id));

  console.log(`Keeping ${keepIds.length} products, deleting ${deleteIds.length}`);

  if (!deleteIds.length) {
    console.log('Nothing to delete');
    process.exit(0);
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const chunkSize = 500;
    for (let i = 0; i < deleteIds.length; i += chunkSize) {
      const chunk = deleteIds.slice(i, i + chunkSize);
      const placeholders = chunk.map(() => '?').join(',');

      const [valueRows] = await conn.query(
        `SELECT id FROM product_attribute_values WHERE product_id IN (${placeholders})`,
        chunk
      );
      const valueIds = valueRows.map(row => row.id);
      if (valueIds.length) {
        const valuePlaceholders = valueIds.map(() => '?').join(',');
        await conn.query(
          `DELETE FROM product_attribute_values_translations WHERE product_attribute_value_id IN (${valuePlaceholders})`,
          valueIds
        );
      }

      await conn.query(`DELETE FROM product_attribute_values WHERE product_id IN (${placeholders})`, chunk);
      await conn.query(`DELETE FROM product_images WHERE product_id IN (${placeholders})`, chunk);
      await conn.query(`DELETE FROM product_translations WHERE product_id IN (${placeholders})`, chunk);
      await conn.query(`DELETE FROM product_branches WHERE product_id IN (${placeholders})`, chunk);
      await conn.query(`DELETE FROM product_categories WHERE product_id IN (${placeholders})`, chunk);
      await conn.query(`DELETE FROM cart_items WHERE product_id IN (${placeholders})`, chunk);
      await conn.query(`DELETE FROM wishlists WHERE product_id IN (${placeholders})`, chunk);
      await conn.query(`DELETE FROM user_compares WHERE product_id IN (${placeholders})`, chunk);
      await conn.query(`DELETE FROM reviews WHERE product_id IN (${placeholders})`, chunk);
      await conn.query(`DELETE FROM order_items WHERE product_id IN (${placeholders})`, chunk);
      await conn.query(`DELETE FROM products WHERE id IN (${placeholders})`, chunk);
      process.stdout.write(`deleted ${Math.min(i + chunkSize, deleteIds.length)}/${deleteIds.length}\n`);
    }

    await conn.query('UPDATE products SET is_active = 1');
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  const [[after]] = await db.query(`
    SELECT COUNT(*) AS total,
           SUM(is_active = 1) AS active,
           SUM(is_active = 0) AS inactive
    FROM products
  `);
  const [sample] = await db.query(`
    SELECT c.slug, COUNT(*) AS total
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    GROUP BY p.category_id, c.slug
    ORDER BY total DESC
    LIMIT 10
  `);

  console.log('After', after);
  console.table(sample);
} catch (error) {
  console.error('Failed to trim products:', error);
  process.exit(1);
} finally {
  process.exit(0);
}
