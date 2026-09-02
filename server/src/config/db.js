const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/devtrack';
    
    // First attempt to connect to standard MONGODB_URI
    try {
      const conn = await mongoose.connect(connStr, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`✅ MongoDB Connected to database: ${conn.connection.host}`);
      return conn;
    } catch (localErr) {
      console.log(`⚠️ Could not connect to primary MongoDB URI (${localErr.message}). Initializing fallback...`);
      
      // Fallback to MongoMemoryServer for instant zero-config experience
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create({
        instance: {
          dbName: 'devtrack'
        }
      });
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ MongoDB Connected to In-Memory Instance: ${uri}`);
      return conn;
    }
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (error) {
    console.error('Error disconnecting database:', error);
  }
};

module.exports = { connectDB, disconnectDB };
