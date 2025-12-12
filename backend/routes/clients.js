import express from 'express';
import pool from '../config/database.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// GET /api/clients
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clients');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/clients
router.post('/', authenticateToken, async (req, res) => {
  const { name, address, phone, email, pincode, gstin, arn } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO clients (name, address, phone, email, pincode, gstin, arn) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, address, phone, email, pincode, gstin, arn || null]
    );
    const [rows] = await pool.query('SELECT * FROM clients WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/clients/:id
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, address, phone, email, pincode, gstin, arn } = req.body;
  try {
    await pool.query(
      'UPDATE clients SET name = ?, address = ?, phone = ?, email = ?, pincode = ?, gstin = ?, arn = ? WHERE id = ?',
      [name, address, phone, email, pincode, gstin, arn || null, id]
    );
    const [rows] = await pool.query('SELECT * FROM clients WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/clients/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM clients WHERE id = ?', [id]);
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 