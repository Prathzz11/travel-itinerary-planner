const mongoose = require('mongoose');
const Template = require('./models/Template');
require('dotenv').config();

const seedParisTemplate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/travelsync');
    console.log('Connected to MongoDB');
    
    const parisTemplate = {
        title: '5 Days in Paris: Art, History & Hidden Gems',
        destination: 'Paris, France',
        description: 'A perfect 5-day balance of iconic Parisian landmarks like the Louvre and Eiffel Tower, mixed with local culture in Montmartre and the Marais district.',
        duration: 5,
        tags: ['City', 'Culture', 'Romantic', 'Art'],
        image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=1000',
        difficulty: 'Moderate',
        estimatedBudget: 1500,
        currency: 'EUR',
        authorName: 'Paris Local Expert',
        authorAvatar: 'https://ui-avatars.com/api/?name=PE&background=FFB6C1&color=fff',
        isPublic: true,
        likes: 512,
        views: 3200,
        rating: 4.9,
        reviewCount: 204,
        days: [
          { 
            dayNumber: 1, 
            title: 'Art and Iconic Landmarks', 
            activities: [
              { name: 'Louvre Museum', category: 'Sightseeing', duration: 180, notes: 'Pre-book tickets. Focus on Mona Lisa, Venus de Milo.' },
              { name: 'Tuileries Garden', category: 'Nature', duration: 60, notes: 'Stroll toward Place de la Concorde.' },
              { name: 'Notre-Dame Cathedral (Exterior)', category: 'Sightseeing', duration: 60, notes: 'Walk through Île de la Cité.' },
              { name: 'Seine River Cruise', category: 'Entertainment', duration: 90, notes: 'Sunset cruise to see monuments illuminated.' }
            ] 
          },
          { 
            dayNumber: 2, 
            title: 'Impressionism and Royal Grandeur', 
            activities: [
              { name: 'Musée d\'Orsay', category: 'Sightseeing', duration: 120, notes: 'Former train station housing Monet and Van Gogh.' },
              { name: 'Palace of Versailles', category: 'Sightseeing', duration: 240, notes: 'Short train ride. Hall of Mirrors & Gardens.' },
              { name: 'Dinner in Latin Quarter', category: 'Food & Dining', duration: 120, notes: 'Explore winding streets and diverse dining.' }
            ] 
          },
          { 
            dayNumber: 3, 
            title: 'Montmartre and Local Culture', 
            activities: [
              { name: 'Sacré-Cœur Basilica', category: 'Sightseeing', duration: 90, notes: 'Panoramic views from the hilltop.' },
              { name: 'Explore Marais District', category: 'Sightseeing', duration: 180, notes: 'Historic architecture, boutiques, Jewish quarter.' },
              { name: 'Marché des Enfants Rouges', category: 'Food & Dining', duration: 90, notes: 'Oldest covered market in Paris for dinner.' }
            ] 
          },
          { 
            dayNumber: 4, 
            title: 'Fashion, Shopping, and Views', 
            activities: [
              { name: 'Opéra Garnier', category: 'Sightseeing', duration: 90, notes: 'Tour the stunning interior.' },
              { name: 'Galeries Lafayette', category: 'Shopping', duration: 120, notes: 'Window shopping and rooftop terrace views.' },
              { name: 'Eiffel Tower at Night', category: 'Sightseeing', duration: 120, notes: 'View from Champ de Mars or go to summit.' }
            ] 
          },
          { 
            dayNumber: 5, 
            title: 'Hidden Gems and Farewell', 
            activities: [
              { name: 'Canal Saint-Martin', category: 'Sightseeing', duration: 120, notes: 'Picturesque bridges and relaxed local vibe.' },
              { name: 'Catacombs of Paris', category: 'Sightseeing', duration: 120, notes: 'Unique historical experience underground.' },
              { name: 'Sidewalk Cafe Farewell', category: 'Food & Dining', duration: 90, notes: 'People-watching with a glass of wine.' }
            ] 
          }
        ]
      };

    await Template.create(parisTemplate);
    console.log('Successfully seeded Paris itinerary!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedParisTemplate();
