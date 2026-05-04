const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/travelsync')
  .then(async () => {
    console.log('Connected to DB');
    const user = await User.findOne({ email: 'pratham.shah0406@gmail.com' });
    if (!user) {
      console.log('User not found!');
    } else {
      console.log('Found user, resetting password to TravelSync123');
      user.password = 'TravelSync123';
      await user.save();
      console.log('Password successfully updated!');
    }
    process.exit(0);
  });
