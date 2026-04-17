const Trip = require('../models/Trip');
const Day = require('../models/Day');
const Activity = require('../models/Activity');

/** Resolve member role for the requesting user; returns null if not a member */
const getMemberRole = (trip, userId) => {
  const member = trip.members.find(
    (m) => m.user._id?.toString() === userId.toString() || m.user?.toString() === userId.toString()
  );
  return member ? member.role : null;
};

/**
 * GET /api/trips
 * Returns all trips where the authenticated user is a member.
 */
const getTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({ 'members.user': req.user._id })
      .populate('members.user', 'username email profilePicture')
      .populate('createdBy', 'username email profilePicture')
      .sort({ updatedAt: -1 });

    res.json({ trips });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/trips
 * Creates a new trip and automatically adds the creator as owner.
 */
const createTrip = async (req, res, next) => {
  try {
    const { title, destination, startDate, endDate, description, budget, tags, thumbnailUrl, isPublic } =
      req.body;

    const trip = await Trip.create({
      title,
      destination,
      startDate,
      endDate,
      description,
      budget,
      tags,
      thumbnailUrl,
      isPublic,
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }],
    });

    const populated = await trip.populate([
      { path: 'members.user', select: 'username email profilePicture' },
      { path: 'createdBy', select: 'username email profilePicture' },
    ]);

    res.status(201).json({ trip: populated });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/trips/:id
 * Returns a trip if the user is a member OR the trip is public.
 * Populates members, createdBy, and nested days with their activities.
 */
const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('members.user', 'username email profilePicture')
      .populate('createdBy', 'username email profilePicture');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const role = req.user ? getMemberRole(trip, req.user._id) : null;
    if (!trip.isPublic && !role) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Fetch days sorted by dayNumber, then populate their activities
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
 * PUT /api/trips/:id
 * Updates trip fields. Only owner or editor may update.
 */
const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const role = getMemberRole(trip, req.user._id);
    if (!role || role === 'viewer') {
      return res.status(403).json({ message: 'Not authorized to update this trip' });
    }

    const allowedFields = [
      'title', 'destination', 'startDate', 'endDate',
      'description', 'budget', 'tags', 'thumbnailUrl',
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) trip[field] = req.body[field];
    });

    await trip.save();
    await trip.populate([
      { path: 'members.user', select: 'username email profilePicture' },
      { path: 'createdBy', select: 'username email profilePicture' },
    ]);

    res.json({ trip });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/trips/:id
 * Deletes the trip along with all associated Days and Activities.
 * Only the owner may delete.
 */
const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const role = getMemberRole(trip, req.user._id);
    if (role !== 'owner') {
      return res.status(403).json({ message: 'Only the owner can delete this trip' });
    }

    // Cascade delete days and activities
    await Activity.deleteMany({ tripId: trip._id });
    await Day.deleteMany({ tripId: trip._id });
    await trip.deleteOne();

    res.json({ message: 'Trip deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/trips/:id/members
 * Add or remove a member. Only the owner may manage members.
 * Body: { action: 'add' | 'remove', userId, role }
 */
const updateMembers = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const role = getMemberRole(trip, req.user._id);
    if (role !== 'owner') {
      return res.status(403).json({ message: 'Only the owner can manage members' });
    }

    const { action, userId, role: memberRole } = req.body;

    if (action === 'add') {
      const alreadyMember = trip.members.some(
        (m) => m.user.toString() === userId
      );
      if (alreadyMember) {
        // Update role if already a member
        trip.members = trip.members.map((m) =>
          m.user.toString() === userId ? { ...m.toObject(), role: memberRole || 'viewer' } : m
        );
      } else {
        trip.members.push({ user: userId, role: memberRole || 'viewer' });
      }
    } else if (action === 'remove') {
      // Prevent owner from removing themselves
      if (userId === req.user._id.toString()) {
        return res.status(400).json({ message: 'Owner cannot remove themselves from the trip' });
      }
      trip.members = trip.members.filter((m) => m.user.toString() !== userId);
    } else {
      return res.status(400).json({ message: "action must be 'add' or 'remove'" });
    }

    await trip.save();
    await trip.populate('members.user', 'username email profilePicture');

    res.json({ trip });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/trips/:id/visibility
 * Toggles isPublic. Only the owner may change visibility.
 */
const toggleVisibility = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const role = getMemberRole(trip, req.user._id);
    if (role !== 'owner') {
      return res.status(403).json({ message: 'Only the owner can change visibility' });
    }

    trip.isPublic = !trip.isPublic;
    await trip.save();

    res.json({ isPublic: trip.isPublic, trip });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTrips,
  createTrip,
  getTripById,
  updateTrip,
  deleteTrip,
  updateMembers,
  toggleVisibility,
};
