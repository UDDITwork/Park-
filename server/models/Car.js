 // server/models/Car.js
const db = require('../database/sqlite');

class Car {
    constructor({
        id,
        user_id,
        model,
        registration_no,
        license_no,
        aadhar_no,
        pan_no,
        mileage,
        rc_expiry,
        puc_expiry,
        insurance_expiry,
        last_service_date,
        next_service_due,
        engine_oil,
        tyre_condition
    }) {
        this.id = id;
        this.userId = user_id;
        this.model = model;
        this.registrationNo = registration_no;
        this.licenseNo = license_no;
        this.aadharNo = aadhar_no;
        this.panNo = pan_no;
        this.mileage = mileage;
        this.rcExpiry = rc_expiry;
        this.pucExpiry = puc_expiry;
        this.insuranceExpiry = insurance_expiry;
        this.lastServiceDate = last_service_date;
        this.nextServiceDue = next_service_due;
        this.engineOil = engine_oil;
        this.tyreCondition = tyre_condition;
    }

    // Create new car
    static async create(carData) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO cars (
                    user_id, model, registration_no, license_no, 
                    aadhar_no, pan_no, mileage, rc_expiry,
                    puc_expiry, insurance_expiry, last_service_date,
                    next_service_due, engine_oil, tyre_condition
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.run(sql, [
                carData.userId,
                carData.model,
                carData.registrationNo,
                carData.licenseNo,
                carData.aadharNo,
                carData.panNo,
                carData.mileage || 0,
                carData.rcExpiry,
                carData.pucExpiry,
                carData.insuranceExpiry,
                carData.lastServiceDate,
                carData.nextServiceDue,
                carData.engineOil || 'good',
                carData.tyreCondition || 'good'
            ], function(err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });
    }

    // Find car by ID
    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM cars WHERE id = ?', [id], (err, row) => {
                if (err) return reject(err);
                if (!row) return resolve(null);
                resolve(new Car(row));
            });
        });
    }

    // Find car by user ID
    static async findByUserId(userId) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM cars WHERE user_id = ?', [userId], (err, row) => {
                if (err) return reject(err);
                if (!row) return resolve(null);
                resolve(new Car(row));
            });
        });
    }

    // Update car details
    async update(updates) {
        return new Promise((resolve, reject) => {
            const validUpdates = {};
            const allowedUpdates = [
                'model', 'mileage', 'rc_expiry', 'puc_expiry',
                'insurance_expiry', 'last_service_date', 'next_service_due',
                'engine_oil', 'tyre_condition'
            ];

            // Filter valid updates
            Object.keys(updates).forEach(key => {
                if (allowedUpdates.includes(key)) {
                    validUpdates[key] = updates[key];
                }
            });

            const keys = Object.keys(validUpdates);
            const values = Object.values(validUpdates);

            if (keys.length === 0) return resolve(this);

            const sql = `
                UPDATE cars 
                SET ${keys.map(key => `${key} = ?`).join(', ')}
                WHERE id = ?
            `;

            db.run(sql, [...values, this.id], (err) => {
                if (err) return reject(err);
                resolve(this);
            });
        });
    }

    // Get service history
    async getServiceHistory() {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM service_records WHERE car_id = ? ORDER BY service_date DESC',
                [this.id],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows);
                }
            );
        });
    }

    // Add service record
    async addServiceRecord(serviceData) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO service_records (
                    car_id, service_type, service_date, 
                    odometer_reading, next_due_date, notes
                ) VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.run(sql, [
                this.id,
                serviceData.serviceType,
                serviceData.serviceDate,
                serviceData.odometerReading,
                serviceData.nextDueDate,
                serviceData.notes || null
            ], function(err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });
    }

    // Check document expiry status
    async checkDocumentStatus() {
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.setDate(now.getDate() + 30));

        return {
            rc: {
                expired: new Date(this.rcExpiry) < now,
                expiringCoon: new Date(this.rcExpiry) < thirtyDaysFromNow
            },
            puc: {
                expired: new Date(this.pucExpiry) < now,
                expiringCoon: new Date(this.pucExpiry) < thirtyDaysFromNow
            },
            insurance: {
                expired: new Date(this.insuranceExpiry) < now,
                expiringCoon: new Date(this.insuranceExpiry) < thirtyDaysFromNow
            }
        };
    }

    // Delete car
    async delete() {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM cars WHERE id = ?', [this.id], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
}

module.exports = Car;
