const mongoose = require('mongoose');
const Trip = require('./models/Trip');

mongoose.connect('mongodb://localhost:27017/travelsync')
  .then(async () => {
    const trips = await Trip.find({ title: 'Goa Beach Getaway' });
    console.log(trips.map(t => ({ title: t.title, spent: t.spent, budget: t.budget })));
    process.exit(0);
  });
