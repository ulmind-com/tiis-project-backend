const mongoose = require('mongoose');
const Enquiry = require('./models/Enquiry');
const Application = require('./models/Application');
require('dotenv').config();

const testDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const enqCount = await Enquiry.countDocuments();
    console.log(`Enquiries Count: ${enqCount}`);
    
    const appCount = await Application.countDocuments();
    console.log(`Applications Count: ${appCount}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

testDB();
