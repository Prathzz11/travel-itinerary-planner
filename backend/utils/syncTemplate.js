const Template = require('../models/Template');
const Itinerary = require('../models/Itinerary');
const User = require('../models/User');

async function syncTemplate(trip) {
  if (trip.visibility !== 'public') {
    await Template.updateOne({ sourceTrip: trip._id }, { isPublic: false });
    return;
  }
  const itinerary = await Itinerary.findOne({ trip: trip._id });
  const owner = await User.findById(trip.owner);
  const days = (itinerary?.days || []).map((day, index) => ({
    dayNumber: index + 1, title: `Day ${index + 1}`,
    activities: day.activities.map(activity => ({ name: activity.name, category: activity.category, duration: activity.duration, notes: activity.notes, order: activity.order }))
  }));
  await Template.findOneAndUpdate({ sourceTrip: trip._id }, {
    title: trip.title, destination: trip.destination, image: trip.image,
    imageCredit: trip.imageCredit, sources: trip.sources, planningTips: trip.planningTips,
    duration: Math.max(1, Math.round((trip.endDate - trip.startDate) / 86400000) + 1),
    estimatedBudget: trip.budget, currency: trip.currency, author: trip.owner,
    authorName: owner?.name || 'Traveler', authorAvatar: owner?.avatar || '',
    isPublic: true, days
  }, { upsert: true, runValidators: true });
}
module.exports = { syncTemplate };
