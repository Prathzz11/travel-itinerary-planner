const mongoose = require('mongoose');
const Trip = require('./models/Trip');
const Itinerary = require('./models/Itinerary');
require('dotenv').config();

const USER_ID = '69f31abfbd21d57a4577b711'; // Pratham Shah

const trips = [
  {
    title: 'Tokyo Adventure',
    destination: 'Tokyo, Japan',
    startDate: new Date('2026-06-10'),
    endDate: new Date('2026-06-17'),
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1000',
    budget: 180000,
    spent: 42000,
    currency: 'INR',
    status: 'planning',
    visibility: 'private',
    days: [
      { date: '2026-06-10', activities: [
        { name: 'Arrive at Narita Airport', time: '14:00', duration: 120, category: 'Transportation', notes: 'Take Narita Express to Shinjuku' },
        { name: 'Shinjuku Gyoen Garden', time: '17:00', duration: 90, category: 'Sightseeing', notes: 'Beautiful garden walk at sunset' }
      ]},
      { date: '2026-06-11', activities: [
        { name: 'Meiji Shrine', time: '09:00', duration: 90, category: 'Sightseeing', notes: 'Early morning visit to avoid crowds' },
        { name: 'Takeshita Street, Harajuku', time: '11:00', duration: 120, category: 'Shopping' },
        { name: 'Shibuya Crossing', time: '20:00', duration: 60, category: 'Sightseeing' }
      ]},
      { date: '2026-06-12', activities: [
        { name: 'Tsukiji Outer Market Breakfast', time: '08:00', duration: 90, category: 'Food & Dining' },
        { name: 'teamLab Planets', time: '11:00', duration: 150, category: 'Entertainment', notes: 'Book tickets in advance!' }
      ]}
    ]
  },
  {
    title: 'Goa Beach Getaway',
    destination: 'Goa, India',
    startDate: new Date('2026-05-15'),
    endDate: new Date('2026-05-20'),
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1000',
    budget: 35000,
    spent: 35000,
    currency: 'INR',
    status: 'completed',
    visibility: 'private',
    days: [
      { date: '2026-05-15', activities: [
        { name: 'Check-in to Beach Resort', time: '13:00', duration: 60, category: 'Accommodation' },
        { name: 'Calangute Beach Sunset', time: '17:00', duration: 120, category: 'Sightseeing' }
      ]},
      { date: '2026-05-16', activities: [
        { name: 'Water Sports at Baga Beach', time: '10:00', duration: 180, category: 'Entertainment' },
        { name: 'Seafood Dinner at Thalassa', time: '19:00', duration: 120, category: 'Food & Dining' }
      ]}
    ]
  },
  {
    title: 'Manali Backpacking Trip',
    destination: 'Manali, Himachal Pradesh',
    startDate: new Date('2026-07-05'),
    endDate: new Date('2026-07-12'),
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=1000',
    budget: 25000,
    spent: 0,
    currency: 'INR',
    status: 'planning',
    visibility: 'private',
    days: [
      { date: '2026-07-05', activities: [
        { name: 'Arrive Manali & Rest', time: '14:00', duration: 120, category: 'Accommodation' }
      ]},
      { date: '2026-07-06', activities: [
        { name: 'Solang Valley', time: '09:00', duration: 240, category: 'Sightseeing', notes: 'Paragliding available here' },
        { name: 'Old Manali Cafes', time: '17:00', duration: 120, category: 'Food & Dining' }
      ]},
      { date: '2026-07-07', activities: [
        { name: 'Rohtang Pass', time: '06:00', duration: 480, category: 'Sightseeing', notes: 'Permit required, book in advance' }
      ]}
    ]
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/travelsync');
    console.log('Connected to MongoDB');

    for (const tripData of trips) {
      const { days, ...tripFields } = tripData;

      // Check if trip already exists
      const existing = await Trip.findOne({ title: tripFields.title, owner: USER_ID });
      if (existing) {
        console.log(`Skipping "${tripFields.title}" — already exists`);
        continue;
      }

      const trip = await Trip.create({
        ...tripFields,
        owner: USER_ID,
        members: [{
          user: USER_ID,
          name: 'Pratham Shah',
          email: 'pratham@example.com',
          role: 'admin',
          joinedAt: new Date(),
          online: false
        }],
        activitiesCount: days.reduce((sum, d) => sum + d.activities.length, 0),
        activityFeed: [{ user: 'Pratham Shah', action: 'Created this trip' }]
      });

      await Itinerary.create({ trip: trip._id, days });

      console.log(`Created: "${trip.title}"`);
    }

    console.log('\nAll dashboard trips seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
