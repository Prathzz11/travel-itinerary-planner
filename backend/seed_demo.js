require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Trip = require('./models/Trip');
const Itinerary = require('./models/Itinerary');
const Expense = require('./models/Expense');
const Booking = require('./models/Booking');

const MONGO_URI = process.env.MONGO_URI;

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // --- 1. Create demo user ---
    let user = await User.findOne({ email: 'demo@travelsync.com' });
    if (!user) {
      user = await User.create({
        name: 'Vihaan',
        email: 'demo@travelsync.com',
        password: 'demo123456',
        bio: 'Travel enthusiast exploring the world one city at a time.',
        preferences: { currency: 'INR', language: 'en' }
      });
      console.log('👤 Created demo user: demo@travelsync.com / demo123456');
    } else {
      console.log('👤 Demo user already exists');
    }

    // --- 2. Create Paris Trip ---
    let parisTrip = await Trip.findOne({ title: 'Paris Getaway 2026', owner: user._id });
    if (parisTrip) {
      await Itinerary.deleteMany({ trip: parisTrip._id });
      await Expense.deleteMany({ trip: parisTrip._id });
      await Booking.deleteMany({ trip: parisTrip._id });
      await Trip.deleteOne({ _id: parisTrip._id });
      console.log('🗑️  Cleared old Paris trip data');
    }

    parisTrip = await Trip.create({
      title: 'Paris Getaway 2026',
      destination: 'Paris, France',
      startDate: new Date('2026-06-15'),
      endDate: new Date('2026-06-18'),
      budget: 150000,
      spent: 0,
      currency: 'INR',
      status: 'planning',
      visibility: 'public',
      owner: user._id,
      members: [{
        user: user._id,
        name: user.name,
        email: user.email,
        role: 'admin'
      }],
      activitiesCount: 12
    });
    console.log('✈️  Created Paris trip');

    // --- 3. Create Itinerary with real locations ---
    await Itinerary.create({
      trip: parisTrip._id,
      days: [
        {
          date: '2026-06-15',
          activities: [
            { name: 'Arrive at Charles de Gaulle Airport', time: '08:00', duration: 120, category: 'Transportation', location: 'Charles de Gaulle Airport, Paris', cost: 0, order: 0 },
            { name: 'Check in at Le Marais Hotel', time: '11:00', duration: 60, category: 'Accommodation', location: 'Le Marais, Paris', cost: 12000, order: 1 },
            { name: 'Lunch at Café de Flore', time: '13:00', duration: 90, category: 'Food & Dining', location: 'Café de Flore, 172 Boulevard Saint-Germain, Paris', cost: 3500, order: 2 },
            { name: 'Visit the Eiffel Tower', time: '15:30', duration: 180, category: 'Sightseeing', location: 'Eiffel Tower, Champ de Mars, Paris', cost: 2200, order: 3 },
          ]
        },
        {
          date: '2026-06-16',
          activities: [
            { name: 'Explore the Louvre Museum', time: '09:00', duration: 240, category: 'Sightseeing', location: 'Louvre Museum, Rue de Rivoli, Paris', cost: 1500, order: 0 },
            { name: 'Lunch at Angelina Paris', time: '13:30', duration: 90, category: 'Food & Dining', location: 'Angelina, 226 Rue de Rivoli, Paris', cost: 4000, order: 1 },
            { name: 'Stroll through Tuileries Garden', time: '15:30', duration: 90, category: 'Sightseeing', location: 'Tuileries Garden, Paris', cost: 0, order: 2 },
            { name: 'Seine River Cruise', time: '18:00', duration: 120, category: 'Entertainment', location: 'Bateaux Mouches, Port de la Conférence, Paris', cost: 1800, order: 3 },
          ]
        },
        {
          date: '2026-06-17',
          activities: [
            { name: 'Visit Notre-Dame Cathedral', time: '09:30', duration: 120, category: 'Sightseeing', location: 'Notre-Dame Cathedral, Paris', cost: 0, order: 0 },
            { name: 'Explore Montmartre & Sacré-Cœur', time: '12:00', duration: 180, category: 'Sightseeing', location: 'Sacré-Cœur, Montmartre, Paris', cost: 0, order: 1 },
            { name: 'Shopping at Champs-Élysées', time: '16:00', duration: 120, category: 'Shopping', location: 'Champs-Élysées, Paris', cost: 8000, order: 2 },
            { name: 'Dinner at Le Jules Verne (Eiffel Tower)', time: '20:00', duration: 120, category: 'Food & Dining', location: 'Le Jules Verne, Eiffel Tower, Paris', cost: 15000, order: 3 },
          ]
        },
        {
          date: '2026-06-18',
          activities: [
            { name: 'Visit Arc de Triomphe', time: '09:00', duration: 90, category: 'Sightseeing', location: 'Arc de Triomphe, Place Charles de Gaulle, Paris', cost: 1100, order: 0 },
            { name: 'Brunch at Pain Pain', time: '11:00', duration: 60, category: 'Food & Dining', location: 'Pain Pain, 88 Rue des Martyrs, Paris', cost: 2500, order: 1 },
            { name: 'Depart from Charles de Gaulle Airport', time: '15:00', duration: 180, category: 'Transportation', location: 'Charles de Gaulle Airport, Paris', cost: 0, order: 2 },
          ]
        }
      ],
      notes: 'An unforgettable 4-day Parisian adventure covering iconic landmarks, exquisite dining, and scenic river cruises.'
    });
    console.log('📅 Created itinerary with 15 location-tagged activities');

    // --- 4. Create some expenses ---
    const expenseItems = [
      { description: 'Eiffel Tower tickets', amount: 2200, category: 'Activities', date: new Date('2026-06-15') },
      { description: 'Café de Flore lunch', amount: 3500, category: 'Food', date: new Date('2026-06-15') },
      { description: 'Louvre Museum entry', amount: 1500, category: 'Activities', date: new Date('2026-06-16') },
      { description: 'Seine River Cruise', amount: 1800, category: 'Activities', date: new Date('2026-06-16') },
      { description: 'Champs-Élysées shopping', amount: 8000, category: 'Shopping', date: new Date('2026-06-17') },
      { description: 'Le Jules Verne dinner', amount: 15000, category: 'Food', date: new Date('2026-06-17') },
    ];
    for (const exp of expenseItems) {
      await Expense.create({
        trip: parisTrip._id,
        ...exp,
        currency: 'INR',
        paidBy: { userId: user._id, name: user.name },
        splitAmong: [{ userId: user._id, name: user.name, share: exp.amount }]
      });
    }
    // Update trip spent
    const totalSpent = expenseItems.reduce((sum, e) => sum + e.amount, 0);
    await Trip.findByIdAndUpdate(parisTrip._id, { spent: totalSpent });
    console.log(`💰 Created ${expenseItems.length} expenses (₹${totalSpent} total)`);

    // --- 5. Create bookings ---
    await Booking.create({
      trip: parisTrip._id,
      type: 'flight',
      title: 'Delhi → Paris (Air France)',
      confirmationNumber: 'AF-2026-PARIS-7742',
      checkIn: new Date('2026-06-15T01:30:00'),
      amount: 45000,
      currency: 'INR',
      status: 'confirmed',
      notes: 'Air France AF192 | DEL → CDG | Departs 01:30 AM'
    });
    await Booking.create({
      trip: parisTrip._id,
      type: 'hotel',
      title: 'Hôtel Le Marais',
      confirmationNumber: 'HLM-884521',
      checkIn: new Date('2026-06-15'),
      checkOut: new Date('2026-06-18'),
      amount: 36000,
      currency: 'INR',
      status: 'confirmed',
      notes: '3 nights | Deluxe Room | Breakfast included'
    });
    await Booking.create({
      trip: parisTrip._id,
      type: 'flight',
      title: 'Paris → Delhi (Air France)',
      confirmationNumber: 'AF-2026-RETURN-7743',
      checkIn: new Date('2026-06-18T16:30:00'),
      amount: 42000,
      currency: 'INR',
      status: 'confirmed',
      notes: 'Air France AF191 | CDG → DEL | Departs 4:30 PM'
    });
    console.log('🎫 Created 3 bookings (2 flights + 1 hotel)');

    console.log('\n🎉 Seeding complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Login with: demo@travelsync.com / demo123456');
    console.log('Trip: "Paris Getaway 2026" with 15 mapped locations');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
