import React, { createContext, useState } from 'react';

export const ExploreContext = createContext();

const MOCK_PUBLIC_TRIPS = [
  {
    id: 'p1',
    title: 'Ultimate Japan Route',
    destination: 'Tokyo & Kyoto, Japan',
    author: { id: 'u1', name: 'Alex Travels', avatar: 'https://i.pravatar.cc/150?u=u1', bio: 'Japan enthusiast and foodie.' },
    rating: 4.9,
    forks: 342,
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80',
    budget: 2500,
    currency: 'INR',
    durationDays: 14,
    difficulty: 'Moderate',
    tags: ['Culture', 'Food', 'Train Travel'],
    description: 'The absolute best way to see the golden route of Japan. Includes Tokyo, Kyoto, Osaka, and Nara.',
    createdAt: '2025-10-01T10:00:00Z',
    trendingScore: 95
  },
  {
    id: 'p2',
    title: 'Eurotrip 3 Weeks',
    destination: 'Western Europe',
    author: { id: 'u2', name: 'Wanderlust', avatar: 'https://i.pravatar.cc/150?u=u2', bio: 'Backpacker exploring Europe on a budget.' },
    rating: 4.7,
    forks: 128,
    image: 'https://images.unsplash.com/photo-1513622470522-26c311a68f63?w=600&q=80',
    budget: 1800,
    currency: 'EUR',
    durationDays: 21,
    difficulty: 'Hard',
    tags: ['Backpacking', 'Hostels', 'History'],
    description: 'Fast-paced backpacking route covering Paris, Amsterdam, Berlin, and Prague.',
    createdAt: '2026-01-15T12:00:00Z',
    trendingScore: 82
  },
  {
    id: 'p3',
    title: 'Bali Relaxation',
    destination: 'Bali, Indonesia',
    author: { id: 'u3', name: 'Sarah Maps', avatar: 'https://i.pravatar.cc/150?u=u3', bio: 'Yoga and beach lover.' },
    rating: 5.0,
    forks: 89,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80',
    budget: 800,
    currency: 'INR',
    durationDays: 7,
    difficulty: 'Easy',
    tags: ['Beach', 'Yoga', 'Relaxation'],
    description: 'A slow-paced week in Ubud and Canggu focusing on wellness and relaxation.',
    createdAt: '2026-03-20T09:00:00Z',
    trendingScore: 99 // highly trending recently
  },
  {
    id: 'p4',
    title: 'Patagonia Trekking',
    destination: 'Patagonia, Chile',
    author: { id: 'u1', name: 'Alex Travels', avatar: 'https://i.pravatar.cc/150?u=u1', bio: 'Japan enthusiast and foodie.' },
    rating: 4.8,
    forks: 45,
    image: 'https://images.unsplash.com/photo-1518182170546-076616fdcd8b?w=600&q=80',
    budget: 1500,
    currency: 'INR',
    durationDays: 10,
    difficulty: 'Hard',
    tags: ['Hiking', 'Nature', 'Camping'],
    description: 'Complete O-Circuit guide for Torres del Paine.',
    createdAt: '2025-11-10T10:00:00Z',
    trendingScore: 60
  },
  {
    id: 'p5',
    title: 'NYC Weekend Itinerary',
    destination: 'New York, USA',
    author: { id: 'u4', name: 'CitySlicker', avatar: 'https://i.pravatar.cc/150?u=u4', bio: 'Urban explorer.' },
    rating: 4.5,
    forks: 210,
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80',
    budget: 1200,
    currency: 'INR',
    durationDays: 3,
    difficulty: 'Moderate',
    tags: ['City', 'Food', 'Museums'],
    description: 'Action-packed 3 days in the Big Apple covering all the major sights.',
    createdAt: '2025-08-05T14:00:00Z',
    trendingScore: 40
  },
  {
    id: 'p6',
    title: 'Swiss Alps Roadtrip',
    destination: 'Switzerland',
    author: { id: 'u2', name: 'Wanderlust', avatar: 'https://i.pravatar.cc/150?u=u2', bio: 'Backpacker exploring Europe on a budget.' },
    rating: 4.9,
    forks: 56,
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=600&q=80',
    budget: 4000,
    currency: 'CHF',
    durationDays: 8,
    difficulty: 'Moderate',
    tags: ['Roadtrip', 'Mountains', 'Luxury'],
    description: 'Scenic drives through the Swiss Alps including Zermatt and Interlaken.',
    createdAt: '2026-02-28T10:00:00Z',
    trendingScore: 88
  }
];

const dests = ['Paris, France', 'Rome, Italy', 'Phuket, Thailand', 'Cape Town, South Africa', 'Banff, Canada', 'Sydney, Australia', 'Machu Picchu, Peru', 'Dubai, UAE', 'Seoul, South Korea', 'Barcelona, Spain', 'Amalfi Coast, Italy', 'Santorini, Greece', 'Havana, Cuba'];
const adjectives = ['Ultimate', 'Hidden', 'Magical', 'Unforgettable', 'Budget', 'Luxury', 'Epic', 'Relaxing', 'Secret', 'Vibrant'];
const types = ['Getaway', 'Escape', 'Adventure', 'Retreat', 'Tour', 'Journey', 'Expedition', 'Roadtrip', 'Vacation', 'Exploration'];

// Generate 30 more items for infinite scroll testing
for(let i = 7; i <= 36; i++) {
  const dest = dests[i % dests.length];
  const adj = adjectives[i % adjectives.length];
  const type = types[i % types.length];
  
  MOCK_PUBLIC_TRIPS.push({
    id: `p${i}`,
    title: `${adj} ${dest.split(',')[0]} ${type}`,
    destination: dest,
    author: { id: `u${i%4 + 1}`, name: `User ${i%4 + 1}`, avatar: `https://i.pravatar.cc/150?u=u${i%4 + 1}` },
    rating: (Math.random() * (5 - 3.8) + 3.8).toFixed(1), // Random rating between 3.8 and 5.0
    forks: Math.floor(Math.random() * 500),
    image: `https://picsum.photos/seed/travel${i}/600/400`,
    budget: Math.floor(Math.random() * 4000) + 500,
    currency: 'INR',
    durationDays: Math.floor(Math.random() * 14) + 3,
    difficulty: ['Easy', 'Moderate', 'Hard'][Math.floor(Math.random() * 3)],
    tags: ['Adventure', 'Relaxation', 'Culture', 'Food', 'Nature', 'City', 'History', 'Photography'].sort(() => 0.5 - Math.random()).slice(0, 3),
    description: `An amazing journey through ${dest} focused on ${adj.toLowerCase()} experiences.`,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
    trendingScore: Math.floor(Math.random() * 100)
  });
}

const MOCK_REVIEWS = [
  { id: 'r1', tripId: 'p1', author: { id: 'u5', name: 'Traveler Bob', avatar: 'https://i.pravatar.cc/150?u=u5' }, rating: 5, comment: 'Absolutely incredible. The train tips saved us so much time!', date: '2025-11-05T14:30:00Z', helpfulCount: 42 },
  { id: 'r2', tripId: 'p1', author: { id: 'u6', name: 'Alice M', avatar: 'https://i.pravatar.cc/150?u=u6' }, rating: 4, comment: 'Great itinerary, but the Kyoto days were a bit rushed.', date: '2025-12-10T09:15:00Z', helpfulCount: 15 },
  { id: 'r3', tripId: 'p1', author: { id: 'u7', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=u7' }, rating: 5, comment: 'Followed this exactly and had the trip of a lifetime.', date: '2026-01-20T11:00:00Z', helpfulCount: 8 },
  { id: 'r4', tripId: 'p2', author: { id: 'u8', name: 'Backpack Pete', avatar: 'https://i.pravatar.cc/150?u=u8' }, rating: 5, comment: 'Perfect for hitting all the major European spots on a tight budget.', date: '2026-02-14T16:45:00Z', helpfulCount: 22 },
  { id: 'r5', tripId: 'p2', author: { id: 'u9', name: 'Sarah J', avatar: 'https://i.pravatar.cc/150?u=u9' }, rating: 3, comment: 'Good routing but hostels suggested were too loud for my taste.', date: '2026-03-01T10:20:00Z', helpfulCount: 4 }
];

export const ExploreProvider = ({ children }) => {
  const [publicTrips, setPublicTrips] = useState(MOCK_PUBLIC_TRIPS);
  const [reviews, setReviews] = useState(MOCK_REVIEWS);

  const getTripById = (id) => publicTrips.find(t => t.id === id);
  
  const getTripsByUser = (userId) => publicTrips.filter(t => t.author.id === userId);

  const forkTrip = (id) => {
    setPublicTrips(prev => prev.map(t => t.id === id ? { ...t, forks: t.forks + 1 } : t));
  };

  const publishTrip = (tripData) => {
    const newTrip = {
      ...tripData,
      rating: 0,
      forks: 0,
      trendingScore: 100, // new trips are highly trending
      createdAt: new Date().toISOString()
    };
    setPublicTrips(prev => [newTrip, ...prev]);
  };

  // Review Methods
  const getTripReviews = (tripId) => reviews.filter(r => r.tripId === tripId);

  const addReview = (reviewData) => {
    const newReview = {
      ...reviewData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      helpfulCount: 0
    };
    setReviews(prev => [newReview, ...prev]);
  };

  const editReview = (reviewId, updatedData) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, ...updatedData, date: new Date().toISOString() } : r));
  };

  const deleteReview = (reviewId) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  const toggleHelpful = (reviewId) => {
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        // Simple toggle simulation (in reality we'd track user IDs who voted)
        return { ...r, helpfulCount: r.helpfulCount + 1 };
      }
      return r;
    }));
  };

  return (
    <ExploreContext.Provider value={{ 
      publicTrips, 
      getTripById, 
      getTripsByUser, 
      forkTrip, 
      publishTrip,
      reviews,
      getTripReviews,
      addReview,
      editReview,
      deleteReview,
      toggleHelpful
    }}>
      {children}
    </ExploreContext.Provider>
  );
};
