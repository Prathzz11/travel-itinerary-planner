const Itinerary = require('../models/Itinerary');
const Trip = require('../models/Trip');

// @desc    Get itinerary for a trip (creates empty one if none exists)
// @route   GET /api/trips/:id/itinerary
// @access  Protected
const getItinerary = async (req, res) => {
  try {
    let itinerary = await Itinerary.findOne({ trip: req.params.id });

    if (!itinerary) {
      // Auto-create empty itinerary
      const trip = await Trip.findById(req.params.id);
      if (!trip) return res.status(404).json({ message: 'Trip not found' });

      // Generate day slots from trip date range
      const days = [];
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push({
          date: d.toISOString().split('T')[0],
          activities: []
        });
      }

      itinerary = await Itinerary.create({ trip: req.params.id, days });
    }

    res.json(itinerary);
  } catch (error) {
    console.error('Get itinerary error:', error);
    res.status(500).json({ message: 'Server error fetching itinerary' });
  }
};

// @desc    Update itinerary (replace days/activities)
// @route   PUT /api/trips/:id/itinerary
// @access  Protected
const updateItinerary = async (req, res) => {
  try {
    const { days, notes } = req.body;

    // Sanitize activities to only include schema-allowed fields
    const sanitizedDays = (days || []).map(day => ({
      date: day.date,
      activities: (day.activities || []).map(act => ({
        ...(act._id ? { _id: act._id } : {}),
        name: act.name || act.title || '',
        time: act.time || '',
        duration: typeof act.duration === 'number' ? act.duration : parseDuration(act.duration),
        category: act.category || 'Other',
        location: act.location || '',
        notes: act.notes || '',
        cost: Number(act.cost) || 0,
        order: act.order || 0
      }))
    }));

    const itinerary = await Itinerary.findOneAndUpdate(
      { trip: req.params.id },
      { days: sanitizedDays, notes: notes || '' },
      { new: true, upsert: true }
    );

    // Update activity count on trip
    const totalActivities = sanitizedDays.reduce((sum, day) => sum + (day.activities?.length || 0), 0);
    await Trip.findByIdAndUpdate(req.params.id, { activitiesCount: totalActivities });

    res.json(itinerary);
  } catch (error) {
    console.error('Update itinerary error:', error);
    res.status(500).json({ message: 'Server error updating itinerary' });
  }
};

// Helper: parse "2h 30m" or "1h" or 90 into minutes
function parseDuration(val) {
  if (typeof val === 'number') return val;
  if (!val) return 60;
  const str = String(val);
  const hoursMatch = str.match(/(\d+)\s*h/);
  const minsMatch = str.match(/(\d+)\s*m/);
  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const mins = minsMatch ? parseInt(minsMatch[1]) : 0;
  return (hours * 60 + mins) || 60;
}


// @desc    Get all public itinerary templates
// @route   GET /api/itineraries
// @access  Public
const getPublicItineraries = async (req, res) => {
  try {
    const Template = require('../models/Template');
    const { search, destination, tags, sort = '-createdAt', page = 1, limit = 20 } = req.query;

    const filter = { isPublic: true };

    if (search) {
      filter.$text = { $search: search };
    }
    if (destination) {
      filter.destination = { $regex: destination, $options: 'i' };
    }
    if (tags) {
      filter.tags = { $in: tags.split(',') };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [templates, total] = await Promise.all([
      Template.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Template.countDocuments(filter)
    ]);

    res.json({ templates, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching itineraries' });
  }
};

// @desc    Get a single public itinerary template
// @route   GET /api/itineraries/:id
// @access  Public
const getPublicItineraryById = async (req, res) => {
  try {
    const Template = require('../models/Template');
    const template = await Template.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name avatar');

    if (!template) return res.status(404).json({ message: 'Itinerary not found' });
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching itinerary' });
  }
};

module.exports = { getItinerary, updateItinerary, getPublicItineraries, getPublicItineraryById };
