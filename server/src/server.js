const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const User = require('./models/User');
const seedData = require('./utils/seed');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/phases', require('./routes/phaseRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Health Check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    app: 'DevTrack – Project Progress Tracker API',
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('DevTrack Backend API is active');
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if user count is 0
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database is empty. Automatically initializing demo seed data...');
      await seedData();
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 DevTrack API Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });

    return server;
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
