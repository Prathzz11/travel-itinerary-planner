const mongoose = require('mongoose');
const Template = require('./models/Template');
require('dotenv').config();

const seedMoreTrips = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/travelsync');
    console.log('Connected to MongoDB');
    
    const newTemplates = [
      {
        title: '7 Days in Tokyo: Neon Lights & Ancient Traditions',
        destination: 'Tokyo, Japan',
        description: 'Immerse yourself in the bustling metropolis of Tokyo. From the serene Meiji Shrine to the vibrant streets of Akihabara and Shinjuku, experience the perfect blend of traditional culture and futuristic innovation.',
        duration: 7,
        tags: ['City', 'Culture', 'Food', 'Tech'],
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1000',
        difficulty: 'Moderate',
        estimatedBudget: 2200,
        currency: 'USD',
        authorName: 'Tokyo Traveler',
        authorAvatar: 'https://ui-avatars.com/api/?name=TT&background=FF0000&color=fff',
        isPublic: true,
        likes: 850,
        views: 4500,
        rating: 4.8,
        reviewCount: 312,
        days: [
          {
            dayNumber: 1,
            title: 'Arrival & Shinjuku Exploration',
            activities: [
              { name: 'Check-in to Hotel', category: 'Logistics', duration: 60, notes: 'Drop off bags in Shinjuku area.' },
              { name: 'Shinjuku Gyoen National Garden', category: 'Nature', duration: 120, notes: 'A peaceful oasis in the city center.' },
              { name: 'Tokyo Metropolitan Government Building', category: 'Sightseeing', duration: 90, notes: 'Free observation deck for sunset views.' },
              { name: 'Omoide Yokocho', category: 'Food & Dining', duration: 120, notes: 'Dinner at "Memory Lane" for authentic yakitori.' }
            ]
          },
          {
            dayNumber: 2,
            title: 'Harajuku & Shibuya',
            activities: [
              { name: 'Meiji Shrine', category: 'Sightseeing', duration: 120, notes: 'Walk through the forested approach to the shrine.' },
              { name: 'Takeshita Street', category: 'Shopping', duration: 120, notes: 'Try famous crepes and explore quirky fashion.' },
              { name: 'Shibuya Crossing', category: 'Sightseeing', duration: 60, notes: 'The busiest pedestrian crossing in the world.' },
              { name: 'Shibuya Sky', category: 'Entertainment', duration: 90, notes: 'Stunning 360-degree views of Tokyo at night.' }
            ]
          },
          {
            dayNumber: 3,
            title: 'Asakusa & Ueno',
            activities: [
              { name: 'Senso-ji Temple', category: 'Sightseeing', duration: 120, notes: 'Tokyo\'s oldest Buddhist temple.' },
              { name: 'Nakamise Shopping Street', category: 'Shopping', duration: 90, notes: 'Traditional snacks and souvenirs.' },
              { name: 'Ueno Park & Museums', category: 'Culture', duration: 180, notes: 'Visit the Tokyo National Museum.' },
              { name: 'Ameyoko Market', category: 'Shopping', duration: 90, notes: 'Bustling street market for bargains and street food.' }
            ]
          },
          {
            dayNumber: 4,
            title: 'Anime & Electronics in Akihabara',
            activities: [
              { name: 'Akihabara Electric Town', category: 'Shopping', duration: 180, notes: 'Explore multi-story electronics and anime stores.' },
              { name: 'Maid Cafe Experience', category: 'Entertainment', duration: 90, notes: 'A unique Tokyo pop-culture experience.' },
              { name: 'Kanda Shrine', category: 'Sightseeing', duration: 60, notes: 'Known for tech-related talismans.' }
            ]
          },
          {
            dayNumber: 5,
            title: 'Tsukiji & Odaiba',
            activities: [
              { name: 'Tsukiji Outer Market', category: 'Food & Dining', duration: 120, notes: 'Fresh seafood and street food for breakfast/lunch.' },
              { name: 'teamLab Planets', category: 'Entertainment', duration: 150, notes: 'Immersive digital art museum. Pre-book tickets!' },
              { name: 'Odaiba Seaside Park', category: 'Nature', duration: 90, notes: 'See the Rainbow Bridge and Statue of Liberty replica.' }
            ]
          },
          {
            dayNumber: 6,
            title: 'Day Trip to Hakone (Mt. Fuji views)',
            activities: [
              { name: 'Romancecar to Hakone', category: 'Transit', duration: 90, notes: 'Scenic train ride from Shinjuku.' },
              { name: 'Hakone Ropeway & Owakudani', category: 'Sightseeing', duration: 180, notes: 'Volcanic valley and potential Mt. Fuji views.' },
              { name: 'Lake Ashi Sightseeing Cruise', category: 'Entertainment', duration: 60, notes: 'Ride the pirate ship across the lake.' },
              { name: 'Onsen Experience', category: 'Relaxation', duration: 120, notes: 'Relax in a traditional hot spring.' }
            ]
          },
          {
            dayNumber: 7,
            title: 'Roppongi & Departure',
            activities: [
              { name: 'Roppongi Hills & Mori Art Museum', category: 'Culture', duration: 150, notes: 'Contemporary art and city views.' },
              { name: 'Last Minute Shopping', category: 'Shopping', duration: 120, notes: 'Pick up final souvenirs.' },
              { name: 'Narita/Haneda Airport Express', category: 'Transit', duration: 60, notes: 'Head to the airport for departure.' }
            ]
          }
        ]
      },
      {
        title: '6 Days in Bali: Temples, Rice Terraces & Beaches',
        destination: 'Bali, Indonesia',
        description: 'Discover the Island of the Gods. This itinerary covers the cultural heart of Ubud, stunning water temples, lush rice terraces, and the beautiful beaches of the southern coast.',
        duration: 6,
        tags: ['Tropical', 'Nature', 'Relaxation', 'Culture'],
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1000',
        difficulty: 'Easy',
        estimatedBudget: 800,
        currency: 'USD',
        authorName: 'Bali Nomad',
        authorAvatar: 'https://ui-avatars.com/api/?name=BN&background=008000&color=fff',
        isPublic: true,
        likes: 1200,
        views: 6800,
        rating: 4.7,
        reviewCount: 450,
        days: [
          {
            dayNumber: 1,
            title: 'Arrival in Ubud',
            activities: [
              { name: 'Airport Transfer to Ubud', category: 'Transit', duration: 90, notes: 'Settle into your jungle accommodation.' },
              { name: 'Sacred Monkey Forest Sanctuary', category: 'Nature', duration: 120, notes: 'Walk among hundreds of macaques. Keep belongings secure!' },
              { name: 'Ubud Traditional Art Market', category: 'Shopping', duration: 90, notes: 'Bargain for local crafts and souvenirs.' },
              { name: 'Traditional Balinese Dinner', category: 'Food & Dining', duration: 90, notes: 'Try Nasi Goreng or Babi Guling.' }
            ]
          },
          {
            dayNumber: 2,
            title: 'Ubud Cultural Highlights',
            activities: [
              { name: 'Tegalalang Rice Terrace', category: 'Nature', duration: 120, notes: 'Go early to avoid crowds. Take iconic swing photos.' },
              { name: 'Tirta Empul Temple', category: 'Culture', duration: 90, notes: 'Participate in a traditional water purification ritual.' },
              { name: 'Coffee Plantation Tour', category: 'Food & Dining', duration: 60, notes: 'Taste Luwak coffee and local teas.' },
              { name: 'Campuhan Ridge Walk', category: 'Nature', duration: 90, notes: 'Scenic sunset walk.' }
            ]
          },
          {
            dayNumber: 3,
            title: 'Waterfalls and Northern Bali',
            activities: [
              { name: 'Tegenungan Waterfall', category: 'Nature', duration: 120, notes: 'Swim and take photos at this powerful waterfall.' },
              { name: 'Ulun Danu Beratan Temple', category: 'Sightseeing', duration: 90, notes: 'Iconic temple on the lake.' },
              { name: 'Handara Gate', category: 'Sightseeing', duration: 45, notes: 'Famous photo spot.' }
            ]
          },
          {
            dayNumber: 4,
            title: 'Transfer to Seminyak/Canggu',
            activities: [
              { name: 'Tanah Lot Temple', category: 'Sightseeing', duration: 90, notes: 'Visit the sea temple on the way to the coast.' },
              { name: 'Check-in to Beach Resort', category: 'Logistics', duration: 60, notes: 'Settle into coastal accommodation.' },
              { name: 'Beach Club Afternoon', category: 'Relaxation', duration: 180, notes: 'Relax by the pool at Potato Head or Finns.' },
              { name: 'Sunset at Seminyak Beach', category: 'Nature', duration: 60, notes: 'Enjoy the sunset with a cocktail.' }
            ]
          },
          {
            dayNumber: 5,
            title: 'Southern Peninsula (Uluwatu)',
            activities: [
              { name: 'Padang Padang Beach', category: 'Nature', duration: 120, notes: 'Relax on the white sand beach.' },
              { name: 'Uluwatu Temple', category: 'Sightseeing', duration: 90, notes: 'Cliffside temple with stunning ocean views.' },
              { name: 'Kecak Fire Dance', category: 'Entertainment', duration: 60, notes: 'Traditional performance at sunset.' },
              { name: 'Jimbaran Bay Seafood Dinner', category: 'Food & Dining', duration: 120, notes: 'Dinner on the beach under the stars.' }
            ]
          },
          {
            dayNumber: 6,
            title: 'Relaxation and Departure',
            activities: [
              { name: 'Balinese Spa Treatment', category: 'Relaxation', duration: 120, notes: 'Get a traditional massage.' },
              { name: 'Last Beach Walk', category: 'Nature', duration: 60, notes: 'Final moments by the ocean.' },
              { name: 'Transfer to DPS Airport', category: 'Transit', duration: 60, notes: 'Head home.' }
            ]
          }
        ]
      },
      {
        title: '4 Days in New York City: The Classic Tour',
        destination: 'New York, USA',
        description: 'Experience the fast-paced energy of the Big Apple. This compact itinerary covers all the must-see landmarks, from Times Square and Central Park to the Statue of Liberty and the Brooklyn Bridge.',
        duration: 4,
        tags: ['City', 'Sightseeing', 'Fast-Paced', 'Food'],
        image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=1000',
        difficulty: 'Challenging',
        estimatedBudget: 1800,
        currency: 'USD',
        authorName: 'NYC Explorer',
        authorAvatar: 'https://ui-avatars.com/api/?name=NE&background=0000FF&color=fff',
        isPublic: true,
        likes: 2100,
        views: 12000,
        rating: 4.6,
        reviewCount: 890,
        days: [
          {
            dayNumber: 1,
            title: 'Midtown Manhattan & Times Square',
            activities: [
              { name: 'Top of the Rock', category: 'Sightseeing', duration: 90, notes: 'Great views of the Empire State Building and Central Park.' },
              { name: 'Fifth Avenue & St. Patrick\'s Cathedral', category: 'Sightseeing', duration: 120, notes: 'Walk down the famous shopping street.' },
              { name: 'Times Square', category: 'Sightseeing', duration: 60, notes: 'Experience the neon lights and energy.' },
              { name: 'Broadway Show', category: 'Entertainment', duration: 180, notes: 'Catch a world-class musical or play.' }
            ]
          },
          {
            dayNumber: 2,
            title: 'Downtown & Lady Liberty',
            activities: [
              { name: 'Statue of Liberty & Ellis Island', category: 'Sightseeing', duration: 240, notes: 'Take the ferry early to avoid lines.' },
              { name: '9/11 Memorial & Museum', category: 'Culture', duration: 120, notes: 'A moving and powerful tribute.' },
              { name: 'Wall Street & Charging Bull', category: 'Sightseeing', duration: 60, notes: 'Walk through the Financial District.' },
              { name: 'One World Observatory', category: 'Sightseeing', duration: 90, notes: 'Sunset views from the tallest building in the US.' }
            ]
          },
          {
            dayNumber: 3,
            title: 'Central Park & Museums',
            activities: [
              { name: 'Central Park Stroll', category: 'Nature', duration: 180, notes: 'Visit Bethesda Terrace, Bow Bridge, and Strawberry Fields.' },
              { name: 'The Metropolitan Museum of Art (The Met)', category: 'Culture', duration: 180, notes: 'Explore one of the world\'s largest art museums.' },
              { name: 'Walk the High Line', category: 'Nature', duration: 90, notes: 'Elevated park built on an old freight rail line.' },
              { name: 'Dinner at Chelsea Market', category: 'Food & Dining', duration: 90, notes: 'Diverse food hall with many options.' }
            ]
          },
          {
            dayNumber: 4,
            title: 'Brooklyn & Departure',
            activities: [
              { name: 'Walk the Brooklyn Bridge', category: 'Sightseeing', duration: 90, notes: 'Walk from Manhattan to Brooklyn for skyline views.' },
              { name: 'Explore DUMBO', category: 'Sightseeing', duration: 120, notes: 'Get the classic Manhattan Bridge photo from Washington St.' },
              { name: 'New York Pizza Lunch', category: 'Food & Dining', duration: 60, notes: 'Grab a slice at Juliana\'s or Grimaldi\'s.' },
              { name: 'Depart from JFK/LGA', category: 'Transit', duration: 60, notes: 'Head to the airport.' }
            ]
          }
        ]
      }
    ];

    await Template.insertMany(newTemplates);
    console.log(`Successfully seeded ${newTemplates.length} new itineraries!`);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedMoreTrips();
