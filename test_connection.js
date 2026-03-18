/**
 * Quick MongoDB connection test — run this in backend folder
 * to check if Atlas is reachable.
 * 
 * Run: node test_connection.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

console.log('\n🔍 Testing MongoDB connection...\n');
console.log('URI:', process.env.MONGO_URI?.replace(/:([^@]+)@/, ':****@'));

const start = Date.now();

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
})
.then(() => {
  const ms = Date.now() - start;
  console.log(`\n✅ SUCCESS! Connected in ${ms}ms`);
  console.log('Host:', mongoose.connection.host);
  console.log('\n👉 Your IP IS whitelisted. Restart backend with: npm run dev\n');
  process.exit(0);
})
.catch((err) => {
  const ms = Date.now() - start;
  console.log(`\n❌ FAILED after ${ms}ms`);
  console.log('Error:', err.message);
  
  if (err.message.includes('ETIMEDOUT') || err.message.includes('timed out')) {
    console.log('\n🚫 CAUSE: Your IP is NOT whitelisted in MongoDB Atlas.');
    console.log('\n📋 FIX — Do this right now:');
    console.log('   1. Go to https://cloud.mongodb.com');
    console.log('   2. Select your project → Security → Network Access');
    console.log('   3. Click "+ ADD IP ADDRESS"');
    console.log('   4. Click "ALLOW ACCESS FROM ANYWHERE" → Confirm');
    console.log('   5. Wait 1 minute, then run this script again\n');
  } else if (err.message.includes('Authentication')) {
    console.log('\n🚫 CAUSE: Wrong username or password in MONGO_URI (.env file)');
  } else {
    console.log('\n🚫 Unknown error. Check your .env MONGO_URI value.');
  }
  process.exit(1);
});
