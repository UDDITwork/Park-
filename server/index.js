// server/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Import routes
const authRoutes = require('./routes/auth');
const carRoutes = require('./routes/cars');
const paymentRoutes = require('./routes/payments');

// Import database
const db = require('./database/sqlite');

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Request logging
app.use(limiter); // Apply rate limiting

// Static files
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../build')));
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
            status: err.status || 500
        }
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({
        error: {
            message: 'Not Found',
            status: 404
        }
    });
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../build/index.html'));
    });
}

// Initialize database
db.serialize(() => {
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
    
    // Create tables if they don't exist
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            subscription_status TEXT DEFAULT 'free',
            subscription_end_date DATETIME
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS cars (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            model TEXT NOT NULL,
            registration_no TEXT UNIQUE NOT NULL,
            license_no TEXT,
            aadhar_no TEXT,
            pan_no TEXT,
            mileage INTEGER DEFAULT 0,
            rc_expiry DATE,
            puc_expiry DATE,
            insurance_expiry DATE,
            last_service_date DATE,
            next_service_due DATE,
            engine_oil TEXT DEFAULT 'good',
            tyre_condition TEXT DEFAULT 'good',
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS service_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            car_id INTEGER,
            service_type TEXT NOT NULL,
            service_date DATE NOT NULL,
            odometer_reading INTEGER,
            next_due_date DATE,
            notes TEXT,
            FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS loan_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            car_id INTEGER,
            loan_amount DECIMAL(10,2) NOT NULL,
            tenure_months INTEGER NOT NULL,
            interest_rate DECIMAL(5,2) NOT NULL,
            emi_amount DECIMAL(10,2) NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS emi_payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            loan_id INTEGER,
            amount DECIMAL(10,2) NOT NULL,
            payment_date DATE NOT NULL,
            payment_method TEXT NOT NULL,
            FOREIGN KEY (loan_id) REFERENCES loan_details(id) ON DELETE CASCADE
        )
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.info('SIGTERM signal received');
    httpServer.close(() => {
        console.log('Server closed');
        db.close(() => {
            console.log('Database connection closed');
            process.exit(0);
        });
    });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
