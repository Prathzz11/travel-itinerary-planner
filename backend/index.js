require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route files
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const itineraryRoutes = require('./routes/itineraryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// ─── Connect to MongoDB ──────────────────────────────────────────────
connectDB();

// ─── Security Middleware ─────────────────────────────────────────────
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// Set security HTTP headers
app.use(helmet());

// Prevent NoSQL injection
app.use(mongoSanitize());

// Rate limiting — generous limit for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:5173');
    res.status(429).json({ message: 'Too many requests from this IP, please try again in 15 minutes.' });
  }
});
// Apply to all API routes
app.use('/api', limiter);

// ─── Middleware ──────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/reviews', reviewRoutes);

// ─── Health check ─────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TravelSync API is running 🚀' });
});

// ─── 404 Handler ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// ─── Start Server ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 TravelSync server running on http://localhost:${PORT}`);
});
