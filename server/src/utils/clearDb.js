const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');
const Phase = require('../models/Phase');
const Task = require('../models/Task');

dotenv.config();

const clearDatabase = async () => {
  try {
    await connectDB();
    console.log('🔄 Connected to database. Clearing all data...');

    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Phase.deleteMany({}),
      Task.deleteMany({}),
    ]);

    console.log('✅ Successfully cleared all data (Users, Projects, Phases, Tasks) from database.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error while clearing database:', error);
    process.exit(1);
  }
};

clearDatabase();
