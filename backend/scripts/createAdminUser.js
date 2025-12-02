/**
 * Script to create an initial admin user in the database
 * Usage: node scripts/createAdminUser.js <username> <password>
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// User Schema (simplified version)
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function createAdminUser(username, password) {
  try {
    // Connect to database
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log(`User '${username}' already exists`);
      process.exit(1);
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    console.log('Creating admin user...');
    const adminUser = new User({
      username,
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log(`Admin user '${username}' created successfully!`);
    console.log('You can now log in with these credentials.');

  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log('Usage: node scripts/createAdminUser.js <username> <password>');
  console.log('Example: node scripts/createAdminUser.js admin MySecurePassword123!');
  process.exit(1);
}

const [username, password] = args;

// Validate inputs
if (username.length < 3) {
  console.error('Username must be at least 3 characters long');
  process.exit(1);
}

if (password.length < 8) {
  console.error('Password must be at least 8 characters long');
  process.exit(1);
}

// Run the script
createAdminUser(username, password);
