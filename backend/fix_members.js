const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Trip = require('./models/Trip');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/travelsync')
  .then(async () => {
    console.log('Connected to DB. Fixing missing member _ids...');
    const trips = await Trip.find({});
    let updated = 0;
    
    for (let trip of trips) {
      if (trip.members && trip.members.length > 0) {
        trip.markModified('members');
        await trip.save();
        updated++;
      }
    }
    
    console.log(`Saved static _ids for members in ${updated} trips.`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
