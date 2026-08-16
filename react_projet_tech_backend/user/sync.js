import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// POST /api/user/sync
router.post('/sync', async (req, res) => {
  const { userId, cart = [], wishlist = [], compare = [] } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId აუცილებელია' });
  }

  try {
    // 1. 🛒 კალათის სინქრონიზაცია (Cart)
    for (const item of cart) {
      const productId = item.id || item.product_id;
      const quantity = item.quantity || 1;

      // ვამოწმებთ, ეს პროდუქტი უკვე უდევს თუ არა ავტორიზებულ იუზერს ბაზაში
      const [existingCartItem] = await db.query(
        `SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?`,
        [userId, productId]
      );

      if (existingCartItem.length > 0) {
        // თუ უდევს, LocalStorage-ის რაოდენობას ვუმატებთ ბაზაში არსებულ რაოდენობას
        await db.query(`UPDATE cart_items SET quantity = quantity + ? WHERE id = ?`, [
          quantity,
          existingCartItem[0].id
        ]);
      } else {
        // თუ არ უდევს, ვამატებთ ახალ ჩანაწერს
        await db.query(`INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)`, [
          userId,
          productId,
          quantity
        ]);
      }
    }

    // 2. ❤️ სურვილების სიის სინქრონიზაცია (Wishlist)
    for (const item of wishlist) {
      const productId = item.id || item.product_id;

      const [existingWishlistItem] = await db.query(`SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?`, [
        userId,
        productId
      ]);

      // ვამატებთ მხოლოდ იმ შემთხვევაში, თუ ბაზაში ჯერ არ არის[cite: 1]
      if (existingWishlistItem.length === 0) {
        await db.query(`INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)`, [userId, productId]);
      }
    }

    // 3. ⚖️ შედარების სიის სინქრონიზაცია (Compare)
    if (compare.length > 0) {
      const compareValues = compare.map(item => [userId, item.id || item.product_id]);

      // რადგან user_compares-ს აქვს unique_user_product ინდექსი,
      // INSERT IGNORE თავად აარიდებს თავს დუბლიკატებს
      await db.query(`INSERT IGNORE INTO user_compares (user_id, product_id) VALUES ?`, [compareValues]);
    }

    // 4. 🔄 ბაზიდან განახლებული და გაერთიანებული მონაცემების უკან დაბრუნება
    const [updatedCart] = await db.query(
      `SELECT c.quantity, p.* 
       FROM cart_items c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = ?`,
      [userId]
    );

    const [updatedWishlist] = await db.query(
      `SELECT p.* 
       FROM wishlists w 
       JOIN products p ON w.product_id = p.id 
       WHERE w.user_id = ?`,
      [userId]
    );

    const [updatedCompare] = await db.query(
      `SELECT p.* 
       FROM user_compares uc 
       JOIN products p ON uc.product_id = p.id 
       WHERE uc.user_id = ?`,
      [userId]
    );

    // ვაბრუნებთ ობიექტს ისე, როგორც ფრონტენდზე გიწერია data.updatedData.cart ...[cite: 3]
    res.json({
      message: 'სინქრონიზაცია წარმატებით დასრულდა',
      updatedData: {
        cart: updatedCart,
        wishlist: updatedWishlist,
        compare: updatedCompare
      }
    });
  } catch (error) {
    console.error('Sync Error:', error);
    res.status(500).json({ error: 'სინქრონიზაციის შეცდომა' });
  }
});

export default router;
