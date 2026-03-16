const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Serve uploaded files statically (CVs, images, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/content', require('./routes/content'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/enquiries', require('./routes/enquiries'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/news', require('./routes/news'));
app.use('/api/team', require('./routes/team'));

app.get('/', (req, res) => {
  res.send('TIIS Backend API is running');
});

const PORT = process.env.PORT || 5000;

// Connect to database completely asynchronously so backend doesn't crash on boot if MongoDB Atlas drops the connection timeout
const connectDB = require('./config/db');
connectDB();

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
