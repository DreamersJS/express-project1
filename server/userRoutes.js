import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './db.js'; 
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid'; 

dotenv.config();

const router = express.Router();

// Middleware to parse JSON requests
router.use(express.json());

// Helper function to get the appropriate secret key based on `kid`
const getSecretKey = (kid) => {
  switch (kid) {
    case 'key1':
      return process.env.JWT_SECRET_KEY_1;
    case 'key2':
      return process.env.JWT_SECRET_KEY_2;
    default:
      throw new Error('Invalid key identifier');
  }
};

// Register route
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Username, password, and email are required' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = uuidv4();  // Generate a new UUID
    await db.query('INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)', [userId, username, email, hashedPassword]);

    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET_KEY_1, // Use the current key for signing
      { expiresIn: '1h', header: { kid: 'key1' } } // Include `kid` in the header
    );

    res.status(201).json({ 
      message: 'User registered successfully', 
      token,
      id: userId,
      username,
      email
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET_KEY_1, // Use the current key for signing
      { expiresIn: '1h', header: { kid: 'key1' } } // Include `kid` in the header
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      id: user.id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in', error });
  }
});

// GET all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT username, email FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ message: 'Error retrieving users', error });
  }
});

// Verify token route
router.post('/verify-token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ valid: false });
  }

  try {
    const decodedHeader = jwt.decode(token, { complete: true });
    const secretKey = getSecretKey(decodedHeader.header.kid);

    jwt.verify(token, secretKey, (err) => {
      if (err) {
        return res.status(401).json({ valid: false });
      }
      res.json({ valid: true });
    });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

// GET /api/users/me - Fetch user details based on token
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decodedHeader = jwt.decode(token, { complete: true });
    const secretKey = getSecretKey(decodedHeader.header.kid);
    
    const decoded = jwt.verify(token, secretKey);
    const email = decoded.email;

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Error processing /me route:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
});

// Update user details
router.put('/update/:id', async (req, res) => {
  const userId = req.params.id;
  const { username, email } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE users SET username = ?, email = ? WHERE id = ?',
      [username, email, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error });
  }
});

// Delete a user
router.delete('/delete/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

export default router;
