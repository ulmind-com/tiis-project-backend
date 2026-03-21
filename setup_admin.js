const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const setupAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    let admin = await User.findOne({ email: 'admin@tiis.co.in' });
    
    if (admin) {
      console.log('Admin user found. Updating password to abc123');
      admin.password = 'abc123';
      await admin.save();
      console.log('Admin password updated successfully!');
    } else {
      console.log('Admin user not found. Creating one...');
      admin = new User({
        name: 'Admin User',
        email: 'admin@tiis.co.in',
        password: 'abc123',
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created successfully with password abc123!');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

setupAdmin();
