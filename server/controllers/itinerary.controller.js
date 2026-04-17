const Trip = require('../models/Trip');
const Day = require('../models/Day');
const Activity = require('../models/Activity');
const Review = require('../models/Review');
const { getIO } = require('../socket');

/**
 * GET /api/itineraries/public
 * Paginated list of public trips with optional filtering and sorting.
 */
const getPublicItineraries = async (req, res, next) => {
  try {
    const {
      search,
      destination,
      sortBy = 'date',
      minBudget,
      maxBudget,
      tags,
      page = 1,
      limit = 12,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { isPublic: true };

    // Full-text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Destination regex filter
    if (destination) {
      filter.destination = { $regex: destination, $options: 'i' };
    }

    // Budget range filter
    if (minBudget || maxBudget) {
      filter['budget.total'] = {};
      if (minBudget) filter['budget.total'].$gte = Number(minBudget);
      if (maxBudget) filter['budget.total'].$lte = Number(maxBudget);
    }

    // Tags filter (match any)
    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (tagList.length) filter.tags = { $in: tagList };
    }

    // Sorting options
    let sort = {};
    switch (sortBy) {
      case 'forks':
        sort = { forkCount: -1 };
        break;
      case 'rating':
        sort = { averageRating: -1 };
        break;
      case 'trending':
        // Trending: high fork recency — approximate by forkCount * freshness weight
        sort = { forkCount: -1, createdAt: -1 };
        break;
      case 'date':
      default:
        sort = { createdAt: -1 };
    }

    const [trips, total] = await Promise.all([
      Trip.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'username profilePicture'),
      Trip.countDocuments(filter),
    ]);

    res.json({
      trips,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/itineraries/public/:id
 * Returns a public trip with full details (days + activities + createdBy).
 */
const getPublicItineraryById = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, isPublic: true })
      .populate('createdBy', 'username profilePicture bio')
      .populate('members.user', 'username profilePicture');

    if (!trip) return res.status(404).json({ message: 'Public itinerary not found' });

    const days = await Day.find({ tripId: trip._id }).sort({ dayNumber: 1 });
    const daysWithActivities = await Promise.all(
      days.map(async (day) => {
        const activities = await Activity.find({ dayId: day._id }).sort({ order: 1 });
        return { ...day.toObject(), activities };
      })
    );

    res.json({ trip: { ...trip.toObject(), days: daysWithActivities } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/itineraries/:id/fork
 * Deep-copies a public trip (and all its days/activities) for the authenticated user.
 * Increments forkCount on the original and emits a socket event.
 */
const forkItinerary = async (req, res, next) => {
  try {
    const original = await Trip.findOne({ _id: req.params.id, isPublic: true });
    if (!original) return res.status(404).json({ message: 'Public itinerary not found' });

    // Prevent double-forking
    const alreadyForked = original.forks.some(
      (f) => f.user.toString() === req.user._id.toString()
    );
    if (alreadyForked) {
      return res.status(409).json({ message: 'You have already forked this itinerary' });
    }

    // Create the new forked trip
    const forkedTrip = await Trip.create({
      title: `Fork of ${original.title}`,
      destination: original.destination,
      startDate: original.startDate,
      endDate: original.endDate,
      description: original.description,
      budget: { ...original.budget.toObject(), spent: 0 },
      tags: [...original.tags],
      thumbnailUrl: original.thumbnailUrl,
      isPublic: false,
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }],
      forkCount: 0,
      forks: [],
    });

    // Deep-copy all days, then all activities in parallel
    const originalDays = await Day.find({ tripId: original._id }).sort({ dayNumber: 1 });

    await Promise.all(
      originalDays.map(async (day) => {
        const newDay = await Day.create({
          tripId: forkedTrip._id,
          dayNumber: day.dayNumber,
          date: day.date,
          title: day.title,
          notes: day.notes,
        });

        const activities = await Activity.find({ dayId: day._id });
        await Promise.all(
          activities.map((act) =>
            Activity.create({
              dayId: newDay._id,
              tripId: forkedTrip._id,
              title: act.title,
              location: act.location,
              description: act.description,
              startTime: act.startTime,
              endTime: act.endTime,
              type: act.type,
              cost: act.cost,
              currency: act.currency,
              coordinates: act.coordinates,
              photoUrl: act.photoUrl,
              order: act.order,
            })
          )
        );
      })
    );

    // Record the fork on the original trip and increment counter
    original.forks.push({ user: req.user._id });
    original.forkCount += 1;
    await original.save();

    // Notify all connected clients about the updated fork count
    try {
      const io = getIO();
      io.emit('fork_count_updated', { tripId: original._id, forkCount: original.forkCount });
    } catch (_) {
      // Socket may not be initialized in test environments; non-fatal
    }

    await forkedTrip.populate('createdBy', 'username profilePicture');
    res.status(201).json({ trip: forkedTrip });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/itineraries/:id/review
 * Upserts a review and recalculates the trip's averageRating + reviewCount.
 */
const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating) return res.status(400).json({ message: 'Rating is required' });

    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const review = await Review.findOneAndUpdate(
      { tripId: trip._id, userId: req.user._id },
      { rating, comment },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    // Recalculate average rating and review count via aggregation
    const [stats] = await Review.aggregate([
      { $match: { tripId: trip._id } },
      {
        $group: {
          _id: '$tripId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (stats) {
      await Trip.findByIdAndUpdate(trip._id, {
        averageRating: Math.round(stats.averageRating * 10) / 10,
        reviewCount: stats.reviewCount,
      });
    }

    await review.populate('userId', 'username profilePicture');
    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/itineraries/:id/reviews
 * Returns all reviews for a trip with user info populated.
 */
const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ tripId: req.params.id })
      .populate('userId', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/itineraries/my-templates
 * Returns the authenticated user's own public trips.
 */
const getMyTemplates = async (req, res, next) => {
  try {
    const trips = await Trip.find({ createdBy: req.user._id, isPublic: true })
      .sort({ updatedAt: -1 })
      .populate('createdBy', 'username profilePicture');

    res.json({ trips });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/itineraries/:id/template
 * Updates description, tags, and isPublic for a trip the user owns.
 */
const updateTemplate = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found or not owned by you' });

    const { description, tags, isPublic } = req.body;
    if (description !== undefined) trip.description = description;
    if (tags !== undefined) trip.tags = tags;
    if (isPublic !== undefined) trip.isPublic = isPublic;

    await trip.save();
    res.json({ trip });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/itineraries/related/:id
 * Returns up to 6 other public trips with the same destination.
 */
const getRelatedItineraries = async (req, res, next) => {
  try {
    const source = await Trip.findById(req.params.id);
    if (!source) return res.status(404).json({ message: 'Trip not found' });

    const related = await Trip.find({
      isPublic: true,
      destination: { $regex: source.destination, $options: 'i' },
      _id: { $ne: source._id },
    })
      .limit(6)
      .populate('createdBy', 'username profilePicture')
      .sort({ averageRating: -1 });

    res.json({ trips: related });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicItineraries,
  getPublicItineraryById,
  forkItinerary,
  addReview,
  getReviews,
  getMyTemplates,
  updateTemplate,
  getRelatedItineraries,
};
