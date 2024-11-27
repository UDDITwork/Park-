 // server/database/sqlite.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(
  path.resolve(__dirname, 'car_service.db'),
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error('Error opening database:', err);
    } else {
      console.log('Connected to SQLite database');
      initializeTables();
    }
  }
);

function initializeTables() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Cars table
    db.run(`
      CREATE TABLE IF NOT EXISTS cars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        model TEXT NOT NULL,
        registration_no TEXT UNIQUE NOT NULL,
        license_no TEXT,
        aadhar_no TEXT,
        pan_no TEXT,
        rc_expiry DATE,
        puc_expiry DATE,
        insurance_expiry DATE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Loan details table
    db.run(`
      CREATE TABLE IF NOT EXISTS loan_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        car_id INTEGER,
        loan_amount DECIMAL(10,2),
        tenure_months INTEGER,
        interest_rate DECIMAL(5,2),
        emi_amount DECIMAL(10,2),
        start_date DATE,
        end_date DATE,
        FOREIGN KEY (car_id) REFERENCES cars(id)
      )
    `);

    // Service records table
    db.run(`
      CREATE TABLE IF NOT EXISTS service_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        car_id INTEGER,
        service_type TEXT,
        service_date DATE,
        odometer_reading INTEGER,
        next_due_date DATE,
        FOREIGN KEY (car_id) REFERENCES cars(id)
      )
    `);
  });
}

module.exports = db;
