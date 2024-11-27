 // server/models/User.js
const bcrypt = require('bcryptjs');
const db = require('../database/sqlite');
const Car = require('./Car');

class User {
    constructor({
        id,
        email,
        password,
        created_at,
        last_login,
        subscription_status,
        subscription_end_date
    }) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.createdAt = created_at;
        this.lastLogin = last_login;
        this.subscriptionStatus = subscription_status;
        this.subscriptionEndDate = subscription_end_date;
    }

    // Create new user
    static async create(userData) {
        return new Promise(async (resolve, reject) => {
            try {
                const hashedPassword = await bcrypt.hash(userData.password, 10);

                const sql = `
                    INSERT INTO users (
                        email, password, subscription_status, 
                        subscription_end_date, created_at
                    ) VALUES (?, ?, ?, ?, datetime('now'))
                `;

                db.run(sql, [
                    userData.email,
                    hashedPassword,
                    userData.subscriptionStatus || 'free',
                    userData.subscriptionEndDate || null
                ], function(err) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    // Find user by ID
    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if (err) return reject(err);
                if (!row) return resolve(null);
                resolve(new User(row));
            });
        });
    }

    // Find user by email
    static async findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) return reject(err);
                if (!row) return resolve(null);
                resolve(new User(row));
            });
        });
    }

    // Verify password
    async verifyPassword(password) {
        return bcrypt.compare(password, this.password);
    }

    // Update user details
    async update(updates) {
        return new Promise(async (resolve, reject) => {
            try {
                const validUpdates = {};
                const allowedUpdates = [
                    'email',
                    'subscription_status',
                    'subscription_end_date',
                    'last_login'
                ];

                // Filter valid updates
                Object.keys(updates).forEach(key => {
                    if (allowedUpdates.includes(key)) {
                        validUpdates[key] = updates[key];
                    }
                });

                if (updates.password) {
                    validUpdates.password = await bcrypt.hash(updates.password, 10);
                }

                const keys = Object.keys(validUpdates);
                const values = Object.values(validUpdates);

                if (keys.length === 0) return resolve(this);

                const sql = `
                    UPDATE users 
                    SET ${keys.map(key => `${key} = ?`).join(', ')}
                    WHERE id = ?
                `;

                db.run(sql, [...values, this.id], (err) => {
                    if (err) return reject(err);
                    resolve(this);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    // Get user's car
    async getCar() {
        return Car.findByUserId(this.id);
    }

    // Update last login
    async updateLastLogin() {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET last_login = datetime("now") WHERE id = ?',
                [this.id],
                (err) => {
                    if (err) return reject(err);
                    resolve();
                }
            );
        });
    }

    // Check subscription status
    isSubscriptionActive() {
        if (this.subscriptionStatus === 'free') return true;
        if (!this.subscriptionEndDate) return false;
        
        const endDate = new Date(this.subscriptionEndDate);
        return endDate > new Date();
    }

    // Delete user account
    async delete() {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM users WHERE id = ?', [this.id], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    // Get user profile (without sensitive data)
    toJSON() {
        const user = { ...this };
        delete user.password;
        return user;
    }
}

module.exports = User;
