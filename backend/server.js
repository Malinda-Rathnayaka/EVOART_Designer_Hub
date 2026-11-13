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

// Logical Area 6: Database initialization and server bootstrap
const startServer = async () => {
  try {
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
