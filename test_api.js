const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('./backend/models/User');
const Team = require('./backend/models/Team');
require('dotenv').config({ path: './backend/.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) throw new Error("No admin found");

    const token = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    const newMember = new Team({ name: 'Test Deleter', role: 'Tester' });
    await newMember.save();

    console.log("Created member:", newMember._id);

    const res = await axios.delete(`http://localhost:5000/api/team/${newMember._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Delete response:", res.status, res.data);

  } catch (err) {
    if (err.response) {
      console.error("API Error:", err.response.status, err.response.data);
    } else {
      console.error("Error:", err);
    }
  } finally {
    mongoose.disconnect();
  }
}
run();
