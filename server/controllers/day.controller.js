const Day = require('../models/Day');
const Activity = require('../models/Activity');
const Trip = require('../models/Trip');

/** Verify the requesting user has access to the trip (member or public) */
const verifyTripAccess = async (tripId, userId, requireWrite = false) => {
  const trip = await Trip.findById(tripId);
  if (!trip) return { error: 'Trip not found', status: 404 };

  const member = trip.members.find(
    (m) => m.user.toString() === userId.toString()
  );

  if (requireWrite) {
    if (!member || member.role === 'viewer') {
      return { error: 'Not authorized to modify this trip', status: 403 };
    }
  } else {
    if (!trip.isPublic && !member) {
      return { error: 'Access denied', status: 403 };
    }
  }

  return { trip, member };
};

/**
 * GET /api/trips/:tripId/days
 * Returns all days for a trip sorted by dayNumber, each with its activities.
 */
const getDays = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { error, status } = await verifyTripAccess(tripId, req.user._id);
    if (error) return res.status(status).json({ message: error });

    const days = await Day.find({ tripId }).sort({ dayNumber: 1 });

    const daysWithActivities = await Promise.all(
      days.map(async (day) => {
        const activities = await Activity.find({ dayId: day._id }).sort({ order: 1 });
        return { ...day.toObject(), activities };
      })
    );

    res.json({ days: daysWithActivities });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/trips/:tripId/days
 * Creates a new day for the trip.
 */
const createDay = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { error, status } = await verifyTripAccess(tripId, req.user._id, true);
    if (error) return res.status(status).json({ message: error });

    const { dayNumber, date, title, notes } = req.body;

    const day = await Day.create({ tripId, dayNumber, date, title, notes });
    res.status(201).json({ day });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/trips/:tripId/days/:dayId
 * Updates a day's details.
 */
const updateDay = async (req, res, next) => {
  try {
    const { tripId, dayId } = req.params;
    const { error, status } = await verifyTripAccess(tripId, req.user._id, true);
    if (error) return res.status(status).json({ message: error });

    const day = await Day.findOneAndUpdate(
      { _id: dayId, tripId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!day) return res.status(404).json({ message: 'Day not found' });
    res.json({ day });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/trips/:tripId/days/:dayId
 * Deletes a day and all of its activities.
 */
const deleteDay = async (req, res, next) => {
  try {
    const { tripId, dayId } = req.params;
    const { error, status } = await verifyTripAccess(tripId, req.user._id, true);
    if (error) return res.status(status).json({ message: error });

    const day = await Day.findOneAndDelete({ _id: dayId, tripId });
    if (!day) return res.status(404).json({ message: 'Day not found' });

    await Activity.deleteMany({ dayId });

    res.json({ message: 'Day and its activities deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDays, createDay, updateDay, deleteDay };
