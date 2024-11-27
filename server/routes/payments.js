// server/routes/payments.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../database/sqlite');

// Add loan details
router.post('/loan', authenticateToken, async (req, res) => {
    try {
        const { 
            loanAmount, 
            tenureMonths, 
            interestRate, 
            emiAmount, 
            startDate, 
            endDate 
        } = req.body;

        const carId = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM cars WHERE user_id = ?', [req.user.userId], (err, row) => {
                if (err) reject(err);
                resolve(row?.id);
            });
        });

        if (!carId) {
            return res.status(404).json({ message: 'Car not found' });
        }

        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO loan_details 
                    (car_id, loan_amount, tenure_months, interest_rate, emi_amount, start_date, end_date)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [carId, loanAmount, tenureMonths, interestRate, emiAmount, startDate, endDate],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        res.status(201).json({ message: 'Loan details added successfully' });
    } catch (error) {
        console.error('Loan details creation error:', error);
        res.status(500).json({ message: 'Server error adding loan details' });
    }
});

// Get loan details
router.get('/loan', authenticateToken, async (req, res) => {
    try {
        const loanDetails = await new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM loan_details 
                 WHERE car_id = (SELECT id FROM cars WHERE user_id = ?)`,
                [req.user.userId],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        if (!loanDetails) {
            return res.status(404).json({ message: 'Loan details not found' });
        }

        res.json(loanDetails);
    } catch (error) {
        console.error('Loan details fetch error:', error);
        res.status(500).json({ message: 'Server error fetching loan details' });
    }
});

// Add EMI payment record
router.post('/emi-payment', authenticateToken, async (req, res) => {
    try {
        const { amount, paymentDate, paymentMethod } = req.body;

        const loanId = await new Promise((resolve, reject) => {
            db.get(
                `SELECT loan_details.id FROM loan_details 
                 JOIN cars ON loan_details.car_id = cars.id 
                 WHERE cars.user_id = ?`,
                [req.user.userId],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row?.id);
                }
            );
        });

        if (!loanId) {
            return res.status(404).json({ message: 'Loan details not found' });
        }

        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO emi_payments 
                    (loan_id, amount, payment_date, payment_method)
                 VALUES (?, ?, ?, ?)`,
                [loanId, amount, paymentDate, paymentMethod],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        res.status(201).json({ message: 'EMI payment recorded successfully' });
    } catch (error) {
        console.error('EMI payment record error:', error);
        res.status(500).json({ message: 'Server error recording EMI payment' });
    }
});

// Get EMI payment history
router.get('/emi-history', authenticateToken, async (req, res) => {
    try {
        const emiHistory = await new Promise((resolve, reject) => {
            db.all(
                `SELECT ep.* FROM emi_payments ep
                 JOIN loan_details ld ON ep.loan_id = ld.id
                 JOIN cars ON ld.car_id = cars.id
                 WHERE cars.user_id = ?
                 ORDER BY ep.payment_date DESC`,
                [req.user.userId],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });

        res.json(emiHistory);
    } catch (error) {
        console.error('EMI history fetch error:', error);
        res.status(500).json({ message: 'Server error fetching EMI history' });
    }
});

// Update loan details
router.put('/loan', authenticateToken, async (req, res) => {
    try {
        const { 
            loanAmount, 
            tenureMonths, 
            interestRate, 
            emiAmount, 
            startDate, 
            endDate 
        } = req.body;

        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE loan_details 
                 SET loan_amount = ?,
                     tenure_months = ?,
                     interest_rate = ?,
                     emi_amount = ?,
                     start_date = ?,
                     end_date = ?
                 WHERE car_id = (SELECT id FROM cars WHERE user_id = ?)`,
                [loanAmount, tenureMonths, interestRate, emiAmount, startDate, endDate, req.user.userId],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        res.json({ message: 'Loan details updated successfully' });
    } catch (error) {
        console.error('Loan details update error:', error);
        res.status(500).json({ message: 'Server error updating loan details' });
    }
});

module.exports = router;