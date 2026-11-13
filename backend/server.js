const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Logical Area 1: Load environment variables (supports root and backend directory execution)
dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// Logical Area 2: Configure global middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logical Area 3: Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const collections = mongoose.connection.db
      ? await mongoose.connection.db.listCollections().toArray()
      : [];
    res.json({
      status: 'online',
      timestamp: new Date(),
      service: 'EVO ART Designer Platform API',
      database: mongoose.connection.name,
      collections: collections.map((c) => c.name),
    });
  } catch (err) {
    res.json({ status: 'online', error: err.message });
  }
});

// Logical Area 4: Mount application API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/bids', require('./routes/bidRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));

// Logical Area 5: Custom error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Logical Area 5b: Validate essential environment configuration (Zero hardcoding)
const validateEnvironment = () => {
  const missing = [];

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
    missing.push({
      key: 'JWT_SECRET',
      description: 'Cryptographic secret key for signing and verifying JWT tokens',
    });
  }

  if (process.env.NODE_ENV !== 'test' && (!process.env.MONGO_URI || process.env.MONGO_URI.trim() === '')) {
    missing.push({
      key: 'MONGO_URI',
      description: 'MongoDB Atlas connection string',
    });
  }

  if (missing.length > 0) {
    console.error('\n' + '='.repeat(70));
    console.error(' [CRITICAL ERROR] Missing Required .env Configuration');
    console.error('='.repeat(70));
    console.error(' The server cannot start because required .env variables are missing:\n');
    missing.forEach(({ key, description }) => {
      console.error(`   ✗ ${key}: ${description}`);
    });
    console.error('\n Please configure your .env file with these variables and restart.');
    console.error('='.repeat(70) + '\n');
    throw new Error(
      `Missing required .env variables: ${missing.map((m) => m.key).join(', ')}`
    );
  }
};

// Logical Area 6: Database initialization and server bootstrap
const startServer = async () => {
  try {
    // Validate required .env variables — fail fast if missing
    validateEnvironment();

    // Connect to MongoDB
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`[Server] EVO ART Designer Platform running on port ${PORT}`);
    });
    return server;
  } catch (error) {
    console.error(`[Server Error] Failed to start server:`, error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
