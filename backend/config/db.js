const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (![undefined, 'off', 'required'].includes(process.env.MONGO_TRANSACTIONS)) throw new Error('MONGO_TRANSACTIONS must be off or required');
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    if (process.env.MONGO_TRANSACTIONS === 'required') {
      const topology = await conn.connection.db.admin().command({ hello: 1 });
      if (!topology.setName && topology.msg !== 'isdbgrid') throw new Error('MONGO_TRANSACTIONS=required needs a MongoDB replica set or sharded cluster');
    }
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
