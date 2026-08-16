import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// ა) კალათის წამოღება
router.get('/:userId', async (req, res) => {
  try {
    const [cart] = await db.query(
      `SELECT c.id as cart_item_id, c.quantity, p.* 
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [req.params.userId]
    );
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ბ) კალათაში დამატება / რაოდენობის გაზრდა
router.post('/add', async (req, res) => {
  const { userId, productId, quantity = 1 } = req.body;
  try {
    // თუ უკვე იდო კალათაში, რაოდენობა მოვუმატოთ (ON DUPLICATE KEY UPDATE)
    await db.query(
      `INSERT INTO cart_items (user_id, product_id, quantity) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [userId, productId, quantity]
    );
    res.json({ message: 'პროდუქტი დაემატა კალათაში' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// გ) რაოდენობის განახლება (+1 / -1)
router.put('/update', async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    if (quantity <= 0) {
      await db.query(`DELETE FROM cart_items WHERE user_id = ? AND product_id = ?`, [userId, productId]);
    } else {
      await db.query(`UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?`, [
        quantity,
        userId,
        productId
      ]);
    }
    res.json({ message: 'კალათა განახლდა' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// დ) კალათიდან წაშლა
router.delete('/remove', async (req, res) => {
  const { userId, productId } = req.body;
  try {
    await db.query(`DELETE FROM cart_items WHERE user_id = ? AND product_id = ?`, [userId, productId]);
    res.json({ message: 'პროდუქტი წაიშალა კალათიდან' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
