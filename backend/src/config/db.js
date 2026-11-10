const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS servers to resolve MongoDB Atlas SRV records
// when local router / ISP DNS refuses or times out on SRV queries
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (dnsErr) {
  // Fall back to system DNS if setting custom servers fails
}

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/codesense_ai';

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      dbName: 'codesense_ai',
    });

    isConnected = true;
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`[Database] Notice: Could not connect to MongoDB at ${uri}.`);
    console.warn(`[Database] Error: ${error.message}`);
    console.warn(`[Database] CodeSense AI is running in Fallback Storage Mode.`);
    console.warn(`[Database] To use persistent MongoDB: set MONGODB_URI in backend/.env with your MongoDB Atlas or local connection string.`);
    return false;
  }
};

const isMongoConnected = () => isConnected;

module.exports = {
  connectDB,
  isMongoConnected,
};
