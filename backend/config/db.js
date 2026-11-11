const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Logical Area: Ensure environment variables are loaded from root or backend/.env
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../.env') });

let mongodInstance = null;

/**
 * Connect to MongoDB Database
 * - Test environment uses an isolated in-memory MongoDB runner to protect data
 * - Development and production connect to the MongoDB URI configured in .env
 */
const connectDB = async () => {
  // Logical Area: Test isolation (in-memory Mongo server)
  if (process.env.NODE_ENV === 'test') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create();
    const conn = await mongoose.connect(mongodInstance.getUri('local'));
    console.log('[Database] Connected to isolated test database');
    return conn;
  }

  const uri = process.env.MONGO_URI;

  // Logical Area: Connect to live MongoDB instance (e.g., MongoDB Atlas)
  if (uri) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });

      console.log(`[Database] Connected successfully: ${conn.connection.name}`);
      return conn;
    } catch (err) {
      console.error('[Database] MongoDB connection failed:', err.message);
      throw err;
    }
  }

  // Logical Area: Validate presence of database connection string
  throw new Error(
    'MONGO_URI is missing. Please configure your MongoDB connection in .env'
  );
};

/**
 * Disconnect from MongoDB Database and stop any test servers
 */
const disconnectDB = async () => {
  // Logical Area: Close active Mongoose database connection
  await mongoose.disconnect();

  // Logical Area: Stop in-memory test instance if running
  if (mongodInstance) {
    await mongodInstance.stop();
    mongodInstance = null;
  }
};

module.exports = { connectDB, disconnectDB };
