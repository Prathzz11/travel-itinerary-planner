const mongoose = require('mongoose');
const User = require('./models/User');
const Trip = require('./models/Trip');

mongoose.connect('mongodb://localhost:27017/travelsync').then(async () => {
  console.log('Connected to MongoDB');
  
  // 1. Create or find some dummy users
  const dummyUsersData = [
    { name: 'Alice Smith', email: 'alice@example.com', password: 'password123', avatar: 'https://ui-avatars.com/api/?name=Alice+Smith&background=f472b6&color=fff' },
    { name: 'Bob Jones', email: 'bob@example.com', password: 'password123', avatar: 'https://ui-avatars.com/api/?name=Bob+Jones&background=38bdf8&color=fff' },
    { name: 'Charlie Davis', email: 'charlie@example.com', password: 'password123', avatar: 'https://ui-avatars.com/api/?name=Charlie+Davis&background=c084fc&color=fff' }
  ];

  const dummyUsers = [];
  for (const data of dummyUsersData) {
    let user = await User.findOne({ email: data.email });
    if (!user) {
      user = new User(data);
      await user.save();
      console.log(`Created dummy user: ${user.name}`);
    }
    dummyUsers.push(user);
  }

  // 2. Add them to all existing trips
  const trips = await Trip.find();
  for (const trip of trips) {
    let changed = false;
    
    // Add dummy users
    for (let i = 0; i < dummyUsers.length; i++) {
      const du = dummyUsers[i];
      // don't add if they are the owner
      if (trip.owner && du._id.toString() === trip.owner.toString()) continue;
      
      // check if already a member
      if (!trip.members.find(m => m.user && m.user.toString() === du._id.toString())) {
        trip.members.push({
          user: du._id,
          name: du.name,
          email: du.email,
          avatar: du.avatar,
          role: i === 0 ? 'editor' : 'viewer' // first dummy is editor, rest viewer
        });
        changed = true;
      }
    }

    if (changed) {
      await trip.save();
      console.log(`Added members to trip: ${trip.title}`);
    }
  }

  console.log('Finished adding members to trips!');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
