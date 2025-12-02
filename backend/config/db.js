const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if already connected (important for serverless)
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return mongoose.connection;
    }

    // If connecting, wait for it
    if (mongoose.connection.readyState === 2) {
      console.log('MongoDB connection in progress, waiting...');
      await new Promise((resolve) => {
        mongoose.connection.once('connected', resolve);
      });
      return mongoose.connection;
    }

    // Optimized settings for serverless (Vercel)
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 1, // Reduced for serverless
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, skip trying IPv6
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Don't exit in serverless environment, just log the error
    throw error;
  }
};

module.exports = connectDB;
