require('dotenv').config();

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const tripRoutes = require('./routes/trip.routes');
const dayRoutes = require('./routes/day.routes');
const activityRoutes = require('./routes/activity.routes');
const itineraryRoutes = require('./routes/itinerary.routes');
const errorHandler = require('./middleware/errorHandler');
const { initSocket } = require('./socket');

const app = express();

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

// Nested routes — day and activity routers use mergeParams: true
app.use('/api/trips/:tripId/days', dayRoutes);
app.use('/api/trips/:tripId/days/:dayId/activities', activityRoutes);

app.use('/api/itineraries', itineraryRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Database & Server ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-planner';

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅  MongoDB connected');
  } catch (err) {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  }

  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`🚀  Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
};

startServer();

module.exports = app; // export for testing
