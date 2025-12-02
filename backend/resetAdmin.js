const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const resetAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing admin
    await Admin.deleteOne({ username: 'admin' });
    console.log('✅ Deleted old admin user');

    // Create new admin with correct password hash
    const admin = new Admin({
      username: 'admin',
      email: 'admin@eathub.com',
      password: 'admin123'
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\n⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin:', error);
    process.exit(1);
  }
};

resetAdmin();
