// This script should be run ONCE on Railway after deployment
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const setupAdmin = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.error('MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Delete any existing admin
    const result = await mongoose.connection.collection('admins').deleteMany({ username: 'admin' });
    console.log(`✅ Deleted ${result.deletedCount} existing admin user(s)`);

    // Insert new admin
    await mongoose.connection.collection('admins').insertOne({
      username: 'admin',
      email: 'admin@eathub.com',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Admin user created successfully!');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('\n🎉 Setup complete! You can now login.');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

setupAdmin();
