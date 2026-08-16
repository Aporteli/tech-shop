import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { getAuth } from 'firebase-admin/auth';
const router = express.Router();

// 🟢 GOOGLE AUTH ROUTE
router.post('/google', async (req, res) => {
  const { googleToken } = req.body;

  try {
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${googleToken}`
      }
    });

    if (!googleRes.ok) {
      return res.status(400).json({ message: 'Invalid Google Token' });
    }

    const googleData = await googleRes.json();
    const { email, name, picture, sub } = googleData;

    const queryResult = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    const users = Array.isArray(queryResult[0]) ? queryResult[0] : queryResult;
    let user;

    if (users.length === 0) {
      const insertResult = await db.query(
        'INSERT INTO users (first_name, email, profile_image, google_id) VALUES (?, ?, ?, ?)',
        [name, email, picture, sub]
      );

      const result = Array.isArray(insertResult[0]) ? insertResult[0] : insertResult;
      user = { id: result.insertId, name, email, picture };
    } else {
      user = users[0];
    }

    if (!process.env.JWT_SECRET) {
      console.error('🔥 Error: JWT_SECRET is not defined in .env file!');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.status(200).json({ token, user });
  } catch (error) {
    console.error('🔥 Google Auth Backend Error:', error);
    return res.status(500).json({ message: 'Google Auth Failed', error: error.message });
  }
});

// 📱 PHONE AUTH ROUTE (ახალი)
router.post('/phone', async (req, res) => {
  const { firebaseToken } = req.body;

  if (!firebaseToken) {
    return res.status(400).json({ message: 'Firebase token is required' });
  }

  try {
    // 1. Firebase Admin SDK-ით ტოკენის გადამოწმება (firebaseToken ცვლადით)
    const decodedToken = await getAuth().verifyIdToken(firebaseToken); 
    const phoneNumber = decodedToken.phone_number; 
    const firebaseUid = decodedToken.uid;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'Invalid phone authentication' });
    }

    // 2. MySQL ბაზაში მომხმარებლის მოძებნა ტელეფონის ნომრით
    const queryResult = await db.query('SELECT * FROM users WHERE phone_number = ?', [phoneNumber]);

    const users = Array.isArray(queryResult[0]) ? queryResult[0] : queryResult;
    let user;

    if (users.length === 0) {
      // 3. თუ არ არსებობს -> ახალი იუზერის ჩაწერა ბაზაში
      const insertResult = await db.query('INSERT INTO users (phone_number, firebase_uid) VALUES (?, ?)', [
        phoneNumber,
        firebaseUid
      ]);

      const result = Array.isArray(insertResult[0]) ? insertResult[0] : insertResult;

      user = {
        id: result.insertId,
        phone_number: phoneNumber,
        firebase_uid: firebaseUid
      };
    } else {
      // თუ უკვე არსებობს
      user = users[0];

      // თუ ბაზაში არსებულ იუზერს firebase_uid არ აქვს, დავუწეროთ
      if (!user.firebase_uid) {
        await db.query('UPDATE users SET firebase_uid = ? WHERE id = ?', [firebaseUid, user.id]);
        user.firebase_uid = firebaseUid;
      }
    }

    if (!process.env.JWT_SECRET) {
      console.error('🔥 Error: JWT_SECRET is not defined in .env file!');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // 4. შენი აპლიკაციის JWT ტოკენის გენერაცია
    const token = jwt.sign({ id: user.id, phone_number: user.phone_number }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    return res.status(200).json({ token, user });
  } catch (error) {
    console.error('🔥 Phone Auth Backend Error:', error);
    return res.status(401).json({ message: 'Phone Auth Failed', error: error.message });
  }
});
export default router;
