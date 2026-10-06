require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

async function start() {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    throw new Error('MONGO_URI and JWT_SECRET must be configured in backend/.env');
  }
  await connectDB();
  // ─── Start Server ─────────────────────────────────────────────────────
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`🚀 TravelSync server running on http://localhost:${PORT}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the existing process or run with a different PORT value.`);
    } else {
      console.error('Server error:', error);
    }
    process.exit(1);
  });

}

start().catch(error => {
  console.error(error.message);
  process.exit(1);
});
