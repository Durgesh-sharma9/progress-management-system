const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB } = require('../config/db');
const Attendance = require('../models/Attendance');

dotenv.config();

const clearAttendanceRecords = async () => {
  try {
    await connectDB();
    console.log('🔄 Connected to MongoDB. Clearing all attendance records...');

    const result = await Attendance.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} attendance records from database.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error while clearing attendance records:', error);
    process.exit(1);
  }
};

clearAttendanceRecords();
