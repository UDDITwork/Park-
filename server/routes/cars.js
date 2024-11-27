 // server/routes/cars.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../database/sqlite');

// Get car details
router.get('/details', authenticateToken, async (req, res) => {
    try {
        const carDetails = await new Promise((resolve, reject) => {
            db.get(
                `SELECT cars.*, 
                        service_records.service_date as last_service_date,
                        loan_details.* 
                 FROM cars 
                 LEFT JOIN service_records ON cars.id = service_records.car_id
                 LEFT JOIN loan_details ON cars.id = loan_details.car_id
                 WHERE cars.user_id = ?
                 ORDER BY service_records.service_date DESC`,
                [req.user.userId],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        if (!carDetails) {
            return res.status(404).json({ message: 'Car details not found' });
        }

        res.json(carDetails);
    } catch (error) {
        console.error('Car details fetch error:', error);
        res.status(500).json({ message: 'Server error fetching car details' });
    }
});

// Update car details
router.put('/update', authenticateToken, async (req, res) => {
    try {
        const { mileage, lastServiceDate, nextServiceDue, engineOil, tyreCondition } = req.body;

        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE cars SET 
                    mileage = ?,
                    last_service_date = ?,
                    next_service_due = ?,
                    engine_oil = ?,
                    tyre_condition = ?
                 WHERE user_id = ?`,
                [mileage, lastServiceDate, nextServiceDue, engineOil, tyreCondition, req.user.userId],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        res.json({ message: 'Car details updated successfully' });
    } catch (error) {
        console.error('Car details update error:', error);
        res.status(500).json({ message: 'Server error updating car details' });
    }
});

// Add service record
router.post('/service', authenticateToken, async (req, res) => {
    try {
        const { serviceType, serviceDate, odometerReading, nextDueDate } = req.body;

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
                `INSERT INTO service_records 
                    (car_id, service_type, service_date, odometer_reading, next_due_date)
                 VALUES (?, ?, ?, ?, ?)`,
                [carId, serviceType, serviceDate, odometerReading, nextDueDate],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        res.status(201).json({ message: 'Service record added successfully' });
    } catch (error) {
        console.error('Service record creation error:', error);
        res.status(500).json({ message: 'Server error adding service record' });
    }
});

// Get service history
router.get('/service-history', authenticateToken, async (req, res) => {
    try {
        const serviceHistory = await new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM service_records 
                 WHERE car_id = (SELECT id FROM cars WHERE user_id = ?)
                 ORDER BY service_date DESC`,
                [req.user.userId],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });

        res.json(serviceHistory);
    } catch (error) {
        console.error('Service history fetch error:', error);
        res.status(500).json({ message: 'Server error fetching service history' });
    }
});

// Update document details
router.put('/documents', authenticateToken, async (req, res) => {
    try {
        const { rcExpiry, pucExpiry, insuranceExpiry } = req.body;

        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE cars SET 
                    rc_expiry = ?,
                    puc_expiry = ?,
                    insurance_expiry = ?
                 WHERE user_id = ?`,
                [rcExpiry, pucExpiry, insuranceExpiry, req.user.userId],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        res.json({ message: 'Document details updated successfully' });
    } catch (error) {
        console.error('Document update error:', error);
        res.status(500).json({ message: 'Server error updating documents' });
    }
});

module.exports = router;
