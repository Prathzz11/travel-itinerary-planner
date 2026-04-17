const Activity = require('../models/Activity');
const Day = require('../models/Day');
const Trip = require('../models/Trip');

/** Verify user can access (and optionally write to) a trip */
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
 * GET /api/trips/:tripId/days/:dayId/activities
 * Returns all activities for a day, sorted by order.
 */
const getActivities = async (req, res, next) => {
  try {
    const { tripId, dayId } = req.params;
    const { error, status } = await verifyTripAccess(tripId, req.user._id);
    if (error) return res.status(status).json({ message: error });

    const activities = await Activity.find({ dayId, tripId }).sort({ order: 1 });
    res.json({ activities });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/trips/:tripId/days/:dayId/activities
 * Creates a new activity for the given day.
 */
const createActivity = async (req, res, next) => {
  try {
    const { tripId, dayId } = req.params;
    const { error, status } = await verifyTripAccess(tripId, req.user._id, true);
    if (error) return res.status(status).json({ message: error });

    // Verify the day belongs to the trip
    const day = await Day.findOne({ _id: dayId, tripId });
    if (!day) return res.status(404).json({ message: 'Day not found' });

    const {
      title, location, description, startTime, endTime,
      type, cost, currency, coordinates, photoUrl, order,
    } = req.body;

    const activity = await Activity.create({
      dayId,
      tripId,
      title,
      location,
      description,
      startTime,
      endTime,
      type,
      cost,
      currency,
      coordinates,
      photoUrl,
      order,
    });

    res.status(201).json({ activity });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/trips/:tripId/days/:dayId/activities/:activityId
 * Updates an activity.
 */
const updateActivity = async (req, res, next) => {
  try {
    const { tripId, dayId, activityId } = req.params;
    const { error, status } = await verifyTripAccess(tripId, req.user._id, true);
    if (error) return res.status(status).json({ message: error });

    // Whitelist allowed fields to prevent NoSQL injection via req.body
    const {
      title, location, description, startTime, endTime,
      type, cost, currency, coordinates, photoUrl, order,
    } = req.body;
    const allowedUpdates = {};
    if (title !== undefined) allowedUpdates.title = title;
    if (location !== undefined) allowedUpdates.location = location;
    if (description !== undefined) allowedUpdates.description = description;
    if (startTime !== undefined) allowedUpdates.startTime = startTime;
    if (endTime !== undefined) allowedUpdates.endTime = endTime;
    if (type !== undefined) allowedUpdates.type = type;
    if (cost !== undefined) allowedUpdates.cost = cost;
    if (currency !== undefined) allowedUpdates.currency = currency;
    if (coordinates !== undefined) allowedUpdates.coordinates = coordinates;
    if (photoUrl !== undefined) allowedUpdates.photoUrl = photoUrl;
    if (order !== undefined) allowedUpdates.order = order;

    const activity = await Activity.findOneAndUpdate(
      { _id: activityId, dayId, tripId },
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    res.json({ activity });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/trips/:tripId/days/:dayId/activities/:activityId
 * Deletes an activity.
 */
const deleteActivity = async (req, res, next) => {
  try {
    const { tripId, dayId, activityId } = req.params;
    const { error, status } = await verifyTripAccess(tripId, req.user._id, true);
    if (error) return res.status(status).json({ message: error });

    const activity = await Activity.findOneAndDelete({ _id: activityId, dayId, tripId });
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    res.json({ message: 'Activity deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/trips/:tripId/days/:dayId/activities/reorder
 * Bulk-updates the `order` field for a list of activities.
 * Body: [{ id, order }]
 */
const reorderActivities = async (req, res, next) => {
  try {
    const { tripId, dayId } = req.params;
    const { error, status } = await verifyTripAccess(tripId, req.user._id, true);
    if (error) return res.status(status).json({ message: error });

    const updates = req.body; // expected array of { id, order }
    if (!Array.isArray(updates)) {
      return res.status(400).json({ message: 'Body must be an array of { id, order }' });
    }

    await Promise.all(
      updates.map(({ id, order }) =>
        Activity.findOneAndUpdate({ _id: id, dayId, tripId }, { order })
      )
    );

    const activities = await Activity.find({ dayId, tripId }).sort({ order: 1 });
    res.json({ activities });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  reorderActivities,
};
