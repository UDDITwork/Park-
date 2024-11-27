 // server/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/sqlite');
const { authenticateToken } = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, carModel, licenseNo, aadharNo, panNo, carRegNo } = req.body;

        // Check if user already exists
        const userExists = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const result = await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (email, password) VALUES (?, ?)',
                [email, hashedPassword],
                function(err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });

        // Insert car details
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO cars (user_id, model, registration_no, license_no, aadhar_no, pan_no) VALUES (?, ?, ?, ?, ?, ?)',
                [result, carModel, carRegNo, licenseNo, aadharNo, panNo],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        const token = jwt.sign({ userId: result }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Get user
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await new Promise((resolve, reject) => {
            db.get(
                'SELECT users.*, cars.* FROM users LEFT JOIN cars ON users.id = cars.user_id WHERE users.id = ?',
                [req.user.userId],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        delete user.password;
        res.json(user);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
});

// Update password
router.put('/password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [req.user.userId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, req.user.userId],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ message: 'Server error updating password' });
    }
});

module.exports = router;
