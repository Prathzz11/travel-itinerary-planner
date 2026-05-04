const mongoose = require('mongoose');
require('dotenv').config();
const Trip = require('./models/Trip');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/travelsync', { useNewUrlParser: true })
  .then(async () => {
    const trip = await Trip.findOne();
    console.log("Trip Members:", JSON.stringify(trip.members, null, 2));
    process.exit();
  });
