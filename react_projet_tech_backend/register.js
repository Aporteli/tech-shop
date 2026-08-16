import express from 'express';
import bcrypt from 'bcrypt';
import db from './config/db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// ✉️ EMAIL REGISTRATION
router.post('/email', async (req, res) => {
  console.log('📥 Backend Received Data:', req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  try {
    // 1. mysql2/promise-დან სწორი დესტრუქტურიზაცია [rows]
    const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);

    // rows არის მასივი!
    if (rows.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. INSERT-ის სწორი დესტრუქტურიზაცია
    const [result] = await db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

    const userId = result.insertId;

    const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        email
      }
    });
  } catch (error) {
    console.error('Register Email Error:', error);
    return res.status(500).json({ message: 'Server error, please try again later' });
  }
});

// 📱 PHONE REGISTRATION
router.post('/phone', async (req, res) => {
  const { phoneNumber, agreeTerms, agreeMarketing } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  if (!agreeTerms) {
    return res.status(400).json({ message: 'Please agree to the terms and conditions' });
  }

  try {
    const [rows] = await db.query('SELECT id FROM users WHERE phone_number = ?', [phoneNumber]);

    if (rows.length > 0) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    const [result] = await db.query('INSERT INTO users (phone_number, agree_marketing) VALUES (?, ?)', [
      phoneNumber,
      agreeMarketing ? 1 : 0
    ]);

    return res.status(201).json({
      message: 'Registration successful',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Register Phone Error:', error);
    return res.status(500).json({ message: 'Server error, please try again later' });
  }
});

export default router;
