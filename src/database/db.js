 // src/database/db.js
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carservice';

// Vehicle Schema
const VehicleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  registrationNumber: { type: String, required: true, unique: true },
  model: String,
  launchDate: Date,
  totalKmTravelled: Number
});

// CarWash Schema
const CarWashSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  washDate: { type: Date, required: true },
  nextDueDate: { type: Date, required: true },
  notificationSent: { type: Boolean, default: false }
});

// FasTag Schema
const FastTagSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  balance: { type: Number, required: true },
  transactions: [{
    tollName: String,
    amount: Number,
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]
    },
    timestamp: { type: Date, default: Date.now }
  }]
});

// Maintenance Schema
const MaintenanceSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  serviceDate: Date,
  repairDate: Date,
  performanceMetrics: {
    engineHealth: Number,
    brakeCondition: Number,
    suspensionStatus: Number,
    batteryHealth: Number,
    overallScore: Number
  }
});

// Create models
const Vehicle = mongoose.model('Vehicle', VehicleSchema);
const CarWash = mongoose.model('CarWash', CarWashSchema);
const FasTag = mongoose.model('FasTag', FastTagSchema);
const Maintenance = mongoose.model('Maintenance', MaintenanceSchema);

// Database connection
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export { connectDB, Vehicle, CarWash, FasTag, Maintenance };
