const mongoose = require('mongoose');
const Template = require('./models/Template');
require('dotenv').config();

const seedTemplates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/travelsync');
    console.log('Connected to MongoDB');
    
    const templates = [
      {
        title: '7 Days in Bali: Ultimate Island Getaway',
        destination: 'Bali, Indonesia',
        description: 'Experience the perfect blend of lush jungles, pristine beaches, and rich culture in this week-long Bali itinerary. Discover hidden waterfalls, ancient temples, and world-class surfing spots.',
        duration: 7,
        tags: ['Beach', 'Culture', 'Relaxation'],
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1000',
        difficulty: 'Easy',
        estimatedBudget: 800,
        currency: 'USD',
        authorName: 'TravelSync Curated',
        authorAvatar: 'https://ui-avatars.com/api/?name=TC&background=0D8ABC&color=fff',
        isPublic: true,
        likes: 124,
        views: 890,
        rating: 4.8,
        reviewCount: 45,
        days: [
          { dayNumber: 1, title: 'Arrival in Ubud', activities: [{ name: 'Saraswati Temple', category: 'Sightseeing', duration: 120 }] },
          { dayNumber: 2, title: 'Rice Terraces & Monkeys', activities: [{ name: 'Tegallalang Rice Terrace', category: 'Sightseeing', duration: 180 }] },
          { dayNumber: 3, title: 'Travel to Seminyak', activities: [{ name: 'Beach Club', category: 'Entertainment', duration: 300 }] }
        ]
      },
      {
        title: 'Japan Golden Route Express',
        destination: 'Tokyo to Kyoto',
        description: 'A fast-paced journey through Japan\'s most iconic cities. Perfect for first-time visitors wanting to see neon lights, ancient shrines, and eat amazing food.',
        duration: 10,
        tags: ['City', 'Culture', 'Food'],
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1000',
        difficulty: 'Moderate',
        estimatedBudget: 2500,
        currency: 'USD',
        authorName: 'TokyoExpert',
        authorAvatar: 'https://ui-avatars.com/api/?name=TE&background=FF5722&color=fff',
        isPublic: true,
        likes: 342,
        views: 2100,
        rating: 4.9,
        reviewCount: 112,
        days: [
          { dayNumber: 1, title: 'Shinjuku Nights', activities: [{ name: 'Omoide Yokocho', category: 'Food & Dining', duration: 120 }] }
        ]
      },
      {
        title: 'Backpacking the Swiss Alps',
        destination: 'Switzerland',
        description: 'Breathtaking hikes, charming villages, and stunning mountain passes. A challenging but highly rewarding adventure for nature lovers.',
        duration: 5,
        tags: ['Nature', 'Hiking', 'Adventure'],
        image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=1000',
        difficulty: 'Challenging',
        estimatedBudget: 1200,
        currency: 'USD',
        authorName: 'AlpineHiker',
        authorAvatar: 'https://ui-avatars.com/api/?name=AH&background=4CAF50&color=fff',
        isPublic: true,
        likes: 89,
        views: 450,
        rating: 4.6,
        reviewCount: 20,
        days: [
          { dayNumber: 1, title: 'Zermatt Basecamp', activities: [{ name: 'Matterhorn Viewpoint', category: 'Sightseeing', duration: 240 }] }
        ]
      }
    ];

    await Template.insertMany(templates);
    console.log('Seed successful! Added ' + templates.length + ' templates.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedTemplates();
