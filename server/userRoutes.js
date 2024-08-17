import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const users = [];

// Middleware to parse JSON requests
router.use(express.json());

// Register route
router.post('/register', async (req, res) => {
  console.log("Register request body:", req.body);

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, password: hashedPassword };
    users.push(newUser);
    console.log("New user registered:", newUser);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: 'Error registering user', error });
  }
});

// Login route
router.post('/login', async (req, res) => {
  console.log("Login request body:", req.body);

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  console.log("Stored hashed password:", user.password);
  console.log("Submitted password:", password);

  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  console.log("Generated JWT token:", token);
  res.status(200).json({ message: 'Login successful', token });
});

// Add a GET route to retrieve all users
router.get('/', (req, res) => {
  console.log("Retrieving all users:", users);
  res.json(users);
});

export default router;
