import express from 'express';
import db from '../config/db.js';

const router = express.Router();

router.post('/toggle', async (req, res) => {
  const { userId, productId } = req.body;
  try {
    const [exists] = await db.query(`SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?`, [
      userId,
      productId
    ]);

    if (exists.length > 0) {
      await db.query(`DELETE FROM wishlists WHERE user_id = ? AND product_id = ?`, [userId, productId]);
      res.json({ message: 'წაიშალა Wishlist-იდან', action: 'removed' });
    } else {
      await db.query(`INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)`, [userId, productId]);
      res.json({ message: 'დაემატა Wishlist-ში', action: 'added' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
