const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const Template = require('./models/Template');
const Review = require('./models/Review');
const User = require('./models/User');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travelsync';

const REVIEWS_POOL = [
  { rating: 5, comment: "Absolutely incredible itinerary! Saved me so much time planning.", helpfulCount: 12 },
  { rating: 4, comment: "Great layout and suggestions. I swapped out a few restaurants but overall very solid.", helpfulCount: 5 },
  { rating: 5, comment: "The daily pacing was perfect. We didn't feel rushed at all.", helpfulCount: 8 },
  { rating: 5, comment: "Must-fork for anyone visiting this place. The budget estimates were spot on.", helpfulCount: 15 },
  { rating: 4, comment: "Really helpful! Wish there were more budget options, but it was a great starting point.", helpfulCount: 2 },
  { rating: 5, comment: "Loved this trip plan! Every detail was covered beautifully.", helpfulCount: 20 },
  { rating: 4, comment: "Solid structure. The map integration helped a lot.", helpfulCount: 3 },
  { rating: 5, comment: "Literally the best travel template I've found on this site.", helpfulCount: 31 }
];

const seedReviews = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for seeding reviews');

    // Get all templates
    const templates = await Template.find();
    if (templates.length === 0) {
      console.log('No templates found to review. Exiting.');
      process.exit(0);
    }

    // Get or create some dummy users to act as reviewers
    let users = await User.find({ email: /@reviewer.com$/ });
    if (users.length < 5) {
      console.log('Creating dummy reviewers...');
      const dummyUsers = [
        { name: "Alex Wanderlust", email: "alex@reviewer.com", password: "password123", avatar: "https://ui-avatars.com/api/?name=Alex+Wanderlust&background=38bdf8&color=fff" },
        { name: "Sam Explorer", email: "sam@reviewer.com", password: "password123", avatar: "https://ui-avatars.com/api/?name=Sam+Explorer&background=10b981&color=fff" },
        { name: "Jordan Traveler", email: "jordan@reviewer.com", password: "password123", avatar: "https://ui-avatars.com/api/?name=Jordan+Traveler&background=8b5cf6&color=fff" },
        { name: "Taylor Globe", email: "taylor@reviewer.com", password: "password123", avatar: "https://ui-avatars.com/api/?name=Taylor+Globe&background=f43f5e&color=fff" },
        { name: "Casey Trips", email: "casey@reviewer.com", password: "password123", avatar: "https://ui-avatars.com/api/?name=Casey+Trips&background=f59e0b&color=fff" }
      ];
      for (const u of dummyUsers) {
        // Simple insert (skipping pre-save password hash for simplicity since these are just for reviewing)
        await User.updateOne({ email: u.email }, { $set: u }, { upsert: true });
      }
      users = await User.find({ email: /@reviewer.com$/ });
    }

    // Clear existing reviews
    await Review.deleteMany({});
    console.log('Cleared existing reviews.');

    let reviewCount = 0;

    for (const template of templates) {
      // Pick 2-4 random users to leave reviews
      const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
      const numReviews = Math.floor(Math.random() * 3) + 2; // 2 to 4 reviews
      const selectedUsers = shuffledUsers.slice(0, numReviews);

      let totalRating = 0;

      for (const user of selectedUsers) {
        const randomReview = REVIEWS_POOL[Math.floor(Math.random() * REVIEWS_POOL.length)];
        
        await Review.create({
          templateId: template._id,
          author: user._id,
          authorName: user.name,
          authorAvatar: user.avatar,
          rating: randomReview.rating,
          comment: randomReview.comment,
          helpfulCount: randomReview.helpfulCount
        });
        
        totalRating += randomReview.rating;
        reviewCount++;
      }

      // Update the template's overall rating
      const avgRating = totalRating / numReviews;
      await Template.findByIdAndUpdate(template._id, { rating: avgRating });
    }

    console.log(`Successfully seeded ${reviewCount} reviews across ${templates.length} templates!`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedReviews();
