
const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    // Get MongoDB Atlas URI from Render Environment Variables
    const uri = process.env.MONGODB_URI;

    // Check whether MongoDB URI exists
    if (!uri) {
      throw new Error('MONGODB_URI is missing in environment variables');
    }

    // Mongoose configuration
    mongoose.set('strictQuery', false);

    // Connect to MongoDB Atlas
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      dbName: 'codesense_ai',
    });

    isConnected = true;

    console.log('======================================');
    console.log('MongoDB Connected Successfully!');
    console.log(`Database Host: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    console.log('======================================');

    return true;

  } catch (error) {
    isConnected = false;

    console.error('======================================');
    console.error('MongoDB Connection Failed!');
    console.error('Error:', error.message);
    console.error('Please check your MongoDB Atlas URI.');
    console.error('======================================');

    return false;
  }
};

// Check MongoDB connection status
const isMongoConnected = () => {
  return isConnected && mongoose.connection.readyState === 1;
};

// Export functions
module.exports = {
  connectDB,
  isMongoConnected,
};
