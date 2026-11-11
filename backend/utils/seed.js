const path = require('path');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');

// Logical Area 1: Load environment configuration from current dir or backend/.env
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Seed only maintains the Administrator login credentials in MongoDB.
 * Designer accounts and projects are created exclusively through the Admin Dashboard and stored in the database.
 */
const seedData = async (autoDisconnect = true) => {
  try {
    const mongoose = require('mongoose');

    // Logical Area 2: Verify and establish MongoDB database connection

    // Logical Area 1: Verify and establish MongoDB database connection
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    // Logical Area 3: Define Admin credentials from environment variables or defaults
    // Logical Area 2: Define Admin credentials from environment variables or defaults
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@platform.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    console.log('[Seed] Maintaining Admin login credentials in database...');

    // Logical Area 4: Search for existing Admin account in MongoDB 'users' collection
    // Logical Area 3: Search for existing Admin account in MongoDB 'users' collection
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      // Logical Area 5: Create new Admin record (password hashed automatically by User pre-save hook)
      // Logical Area 4: Create new Admin record (password hashed automatically by User pre-save hook)
      admin = await User.create({
        name: 'Platform Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        bio: 'Platform Head Administrator managing enterprise design projects and designer accounts.',
      });
      console.log(`[Seed] Initial Admin login created in database: ${adminEmail}`);
    } else {
      // Logical Area 6: Maintain Admin password and role directly in database
      // Logical Area 5: Maintain Admin password and role directly in database
      admin.password = adminPassword;
      admin.role = 'admin';
      await admin.save();
      console.log(`[Seed] Admin login password updated in database: ${adminEmail}`);
    }

    // Logical Area 7: Output clear confirmation of database status
    console.log('---------------------------------------------------------');
    console.log('✅ DATABASE SEED COMPLETE: ONLY ADMIN MAINTAINED');
    console.log(`   Admin Email:    ${adminEmail}`);
    console.log(`   Admin Password: ${adminPassword}`);
    console.log('   All Designer accounts are created by Admin and stored');
    console.log('   directly in MongoDB (no local file dependencies).');
    console.log('---------------------------------------------------------');

    // Logical Area 8: Cleanly close connection when run standalone
    // Logical Area 7: Cleanly close connection when run standalone
    if (autoDisconnect) {
      await disconnectDB();
    }
    return admin;
  } catch (error) {
    console.error('[Seed Error]: Failed to maintain admin in database:', error.message);
    if (autoDisconnect) {
      process.exit(1);
    }
    throw error;
  }
};

// Logical Area 9: CLI execution trigger
// Logical Area 8: CLI execution trigger
if (require.main === module) {
  seedData();
}

module.exports = seedData;
