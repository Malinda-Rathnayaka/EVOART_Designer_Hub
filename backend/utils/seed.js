const path = require('path');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');

// Logical Area 1: Load .env from the backend directory (works whether run from root or backend/)
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Seed only maintains the Administrator login credentials in MongoDB.
 * Designer accounts and projects are created exclusively through the Admin Dashboard.
 * Admin email and password are sourced entirely from .env — no hardcoded values.
 */
const seedData = async (autoDisconnect = true) => {
  try {
    const mongoose = require('mongoose');

    // Logical Area 2: Verify and establish MongoDB database connection
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    // Logical Area 3: Read Admin credentials from .env — abort if missing
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error(
        'ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before running seed.'
      );
    }

    console.log('[Seed] Maintaining Admin login credentials in database...');

    // Logical Area 4: Search for existing Admin account in MongoDB 'users' collection
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      // Logical Area 5: Create new Admin record (password hashed by User pre-save hook)
      admin = await User.create({
        name: 'Platform Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        bio: 'Platform Head Administrator managing enterprise design projects and designer accounts.',
      });
      console.log(`[Seed] Admin account created in database: ${adminEmail}`);
    } else {
      // Logical Area 6: Sync Admin password and role from .env into database
      admin.password = adminPassword;
      admin.role = 'admin';
      await admin.save();
      console.log(`[Seed] Admin credentials synced from .env to database: ${adminEmail}`);
    }

    // Logical Area 7: Output confirmation (password masked for security)
    console.log('---------------------------------------------------------');
    console.log('✅ DATABASE SEED COMPLETE: ONLY ADMIN MAINTAINED');
    console.log(`   Admin Email:    ${adminEmail}`);
    console.log(`   Admin Password: ${'*'.repeat(adminPassword.length)}`);
    console.log('   All Designer accounts are created by Admin via Dashboard.');
    console.log('---------------------------------------------------------');

    // Logical Area 8: Cleanly close connection when run standalone
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

// Logical Area 9: CLI execution trigger — run directly with: node utils/seed.js
if (require.main === module) {
  seedData();
}

module.exports = seedData;
