const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Local signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email address' });
    }

    // Create a new user
    const user = await User.create({ email, password });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'An error occurred while registering the user' });
  }
});

// Local login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'An error occurred during login' });
    }
    if (!user) {
      // Handle invalid credentials (e.g., password mismatch or non-existent user)
      return res.status(401).json({ error: info.message || 'Invalid email or password' });
    }

    // If authentication is successful, generate the token
    try {
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true });
      res.json({ message: 'Login successful', token });
    } catch (err) {
      res.status(500).json({ error: 'An error occurred while generating the token' });
    }
  })(req, res, next);
});

module.exports = router;
