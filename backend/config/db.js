const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if already connected (important for serverless)
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Don't exit in serverless environment, just log the error
    // The error will be handled by the request handler
    throw error;
  }
};

module.exports = connectDB;
