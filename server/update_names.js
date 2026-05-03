const mongoose = require('mongoose');
const User = require('./models/User');
const Trip = require('./models/Trip');

mongoose.connect('mongodb://localhost:27017/travelsync').then(async () => {
  console.log('Connected to MongoDB');

  const mappings = [
    { email: 'alice@example.com', newName: 'Priya Sharma', newAvatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=f472b6&color=fff' },
    { email: 'bob@example.com', newName: 'Rahul Verma', newAvatar: 'https://ui-avatars.com/api/?name=Rahul+Verma&background=38bdf8&color=fff' },
    { email: 'charlie@example.com', newName: 'Ananya Desai', newAvatar: 'https://ui-avatars.com/api/?name=Ananya+Desai&background=c084fc&color=fff' }
  ];

  for (const m of mappings) {
    // Update User
    const user = await User.findOne({ email: m.email });
    if (user) {
      user.name = m.newName;
      user.avatar = m.newAvatar;
      await user.save();
      
      // Update in Trips
      const trips = await Trip.find({ 'members.user': user._id });
      for (const trip of trips) {
        const member = trip.members.find(mem => mem.user && mem.user.toString() === user._id.toString());
        if (member) {
          member.name = m.newName;
          member.avatar = m.newAvatar;
        }
        await trip.save();
      }
      console.log(`Updated ${m.email} to ${m.newName}`);
    }
  }

  console.log('Finished updating names!');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
