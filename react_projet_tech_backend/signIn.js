import express from 'express';
import bcrypt from 'bcrypt';
import db from './config/db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post('/email', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Please fill in all required fields'
    });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.status(200).json({
      message: 'Sign in successful',
      token: token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Sign In Email Error:', error);
    return res.status(500).json({
      message: 'Server error, please try again later'
    });
  }
});

router.post('/phone', async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({
      message: 'Please fill in all required fields'
    });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE phone_number = ?', [phoneNumber]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    const user = users[0];

    return res.status(200).json({
      message: 'Sign in successful',
      user: { id: user.id, phone_number: user.phone_number }
    });
  } catch (error) {
    console.error('Sign In Phone Error:', error);
    return res.status(500).json({
      message: 'Server error, please try again later'
    });
  }
});

export default router;
