import express from 'express';
import pool from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, isRoot: user.isRoot },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Register
router.post('/register', async (req, res) => {
  console.log('REGISTER BODY:', req.body);
  const { username, email, password, role, isRoot } = req.body;
  try {
    // Only one root user allowed
    if (isRoot) {
      const [roots] = await pool.query('SELECT * FROM users WHERE isRoot = ?', [1]);
      if (roots.length > 0) return res.status(400).json({ message: 'Root user already exists' });
    }
    // Username must be unique
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length > 0) return res.status(400).json({ message: 'Username already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, role, isRoot) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashed, role || 'add-only', !!isRoot]
    );
    const user = { id: result.insertId, username, email, role: role || 'add-only', isRoot: !!isRoot };
    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if root user exists
router.get('/check-root', async (req, res) => {
  try {
    const [roots] = await pool.query('SELECT * FROM users WHERE isRoot = ?', [1]);
    res.json({ rootExists: roots.length > 0 });
  } catch (err) {
    console.error('CHECK ROOT ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  console.log('LOGIN BODY:', req.body);
  const { username, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) return res.status(400).json({ message: 'Invalid username or password' });
    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid username or password' });
    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 