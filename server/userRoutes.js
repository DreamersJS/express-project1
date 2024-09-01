import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './db.js'; // Import the connection pool
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Middleware to parse JSON requests
router.use(express.json());

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
    const [result] = await db.query('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', [username, email, hashedPassword]);

    // Retrieve the id of the newly created user
    const userId = result.insertId;

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ 
      message: 'User registered successfully', 
      token,
      id: userId,    // Include the user ID in the response
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

  console.log('Login request received with:', { email, password });
  
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

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      token,
      id: user.id,  // Include the user ID in the response
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

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ valid: false });
    }
    res.json({ valid: true });
  });
});

// GET /api/users/me - Fetch user details based on token
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Assuming Bearer token

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }
  
      // Token is valid; proceed with fetching user details
      const email = decoded.email;
      db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err });
        }
        if (results.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.json(results[0]); // Return the user object, which includes the id, username, and email
      });
    }); 
  } catch (error) {
    console.error('Error validating token:', error);
    res.status(401).json({ message: 'Invalid token' });
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
