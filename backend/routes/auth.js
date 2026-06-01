import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';
import { validateSignup } from '../utils/validators.js';

const router = express.Router();

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const errors = validateSignup({ name, email, password });
    if (errors.length > 0) {
      return res.status(422).json({ errors });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(422).json({ errors: [{ field: 'email', message: 'Email already in use' }] });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), passwordHash });

    const token = generateToken(user._id);

    res.status(201).json({
      data: { token, user: { id: user._id, name: user.name, email: user.email } },
      message: 'Account created successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to create account' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({ errors: [{ field: 'email', message: 'Email and password are required' }] });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      data: { token, user: { id: user._id, name: user.name, email: user.email } },
      message: 'Login successful',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to login' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      data: { user: { id: req.user._id, name: req.user.name, email: req.user.email } },
      message: 'User retrieved successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to get user' });
  }
});

export default router;
