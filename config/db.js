const mongoose = require('mongoose');

const connectDB = async () => {
  const MAX_RETRIES = 5;
  const RETRY_DELAY_MS = 3000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,  // 10s to pick a server
        socketTimeoutMS: 45000,           // 45s socket idle timeout
        connectTimeoutMS: 10000,          // 10s to establish connection
        maxPoolSize: 10,                  // maintain up to 10 socket connections
        retryWrites: true,
        w: 'majority',
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return; // success — exit
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`);
      if (attempt < MAX_RETRIES) {
        console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise(res => setTimeout(res, RETRY_DELAY_MS));
      } else {
        console.error('🚫 All MongoDB connection attempts failed. Server continues without DB.');
      }
    }
  }
};

// Auto-reconnect on disconnection
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
  setTimeout(connectDB, 5000);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
});

module.exports = connectDB;
