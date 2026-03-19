const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars — use explicit path so dotenv@17 always finds .env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS — allow all origins in development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Serve uploaded files statically (CVs, images, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB-ready middleware — return 503 if MongoDB not connected yet
app.use((req, res, next) => {
  // Allow health check and non-DB routes through
  if (req.path === '/' || req.path === '/health') return next();
  // If mongoose is not connected, return a friendly error
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database connection is being established. Please try again in a moment.',
      dbState: mongoose.connection.readyState,
    });
  }
  next();
});

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/content', require('./routes/content'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/enquiries', require('./routes/enquiries'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/news', require('./routes/news'));
app.use('/api/team', require('./routes/team'));
app.use('/api/visitors', require('./routes/visitors'));

// Health check endpoint
app.get('/health', (req, res) => {
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: 'ok',
    db: states[mongoose.connection.readyState] || 'unknown',
    uptime: process.uptime().toFixed(2) + 's',
  });
});

app.get('/', (req, res) => {
  res.send('TIIS Backend API is running');
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start server
const connectDB = require('./config/db');

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}).catch(() => {
  // If initial connect fails, still start server (DB reconnect is handled inside connectDB)
  app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT} (DB reconnecting in background...)`);
  });
});
