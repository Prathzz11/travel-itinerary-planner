const express = require('express');
const cors = require('cors');

// Route files
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const itineraryRoutes = require('./routes/itineraryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();


// ─── Security Middleware ─────────────────────────────────────────────
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// Set security HTTP headers
app.use(helmet());


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


// ─── Logging ─────────────────────────────────────────────────────────
const morgan = require('morgan');
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// ─── Middleware ──────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// Sanitize after parsing so JSON bodies are covered too.
app.use(mongoSanitize());
app.use('/api', limiter);

// ─── Routes ──────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/reviews', reviewRoutes);

// ─── Health check ─────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', transactions: process.env.MONGO_TRANSACTIONS === 'required' ? 'required' : 'off', message: 'TravelSync API is running 🚀' });
});

// ─── 404 Handler ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  const status = err.status || 500;
  res.status(status).json({ message: status < 500 ? err.message : 'Internal server error' });
});


module.exports = app;
