const Trip = require('../models/Trip');

// @desc    Get all trips for logged-in user
// @route   GET /api/trips
// @access  Protected
const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    }).sort({ updatedAt: -1 });

    res.json(trips);
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ message: 'Server error fetching trips' });
  }
};

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Protected
const createTrip = async (req, res) => {
  try {
    const { title, destination, startDate, endDate, image, budget, currency, visibility, status } = req.body;

    const trip = await Trip.create({
      title,
      destination,
      startDate,
      endDate,
      image: image || '',
      budget: budget || 0,
      currency: currency || 'INR',
      visibility: visibility || 'private',
      status: status || 'planning',
      owner: req.user._id,
      members: [{
        user: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        role: 'admin',
        joinedAt: new Date(),
        online: false
      }],
      activityFeed: [{
        user: req.user.name,
        action: 'created the trip',
        timestamp: new Date()
      }]
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ message: 'Server error creating trip' });
  }
};

// @desc    Get single trip by ID
// @route   GET /api/trips/:id
// @access  Protected
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    // Check access
    const isMember = trip.members.some(m => m.user?.toString() === req.user._id.toString());
    if (!isMember && trip.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching trip' });
  }
};

// @desc    Update a trip
// @route   PUT /api/trips/:id
// @access  Protected
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const isAdminOrOwner = trip.owner.toString() === req.user._id.toString() ||
      trip.members.some(m => m.user?.toString() === req.user._id.toString() && m.role === 'admin');

    if (!isAdminOrOwner) {
      return res.status(403).json({ message: 'Only admins can update the trip' });
    }

    const allowedFields = ['title', 'destination', 'startDate', 'endDate', 'image', 'budget', 'spent', 'currency', 'visibility', 'status'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) trip[field] = req.body[field];
    });

    trip.activityFeed.unshift({
      user: req.user.name,
      action: 'updated trip details',
      timestamp: new Date()
    });

    const updated = await trip.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating trip' });
  }
};

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Protected (owner only)
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (trip.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the trip owner can delete it' });
    }

    await trip.deleteOne();
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting trip' });
  }
};

// @desc    Add member to a trip
// @route   POST /api/trips/:id/members
// @access  Protected
const addMember = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const { name, email, role, avatar } = req.body;

    const alreadyMember = trip.members.some(m => m.email === email);
    if (alreadyMember) {
      return res.status(400).json({ message: 'This person is already a member' });
    }

    trip.members.push({ name, email, role: role || 'viewer', avatar: avatar || '', joinedAt: new Date() });
    trip.activityFeed.unshift({
      user: req.user.name,
      action: `invited ${name}`,
      timestamp: new Date()
    });

    const updated = await trip.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding member' });
  }
};

// @desc    Remove member from a trip
// @route   DELETE /api/trips/:id/members/:memberId
// @access  Protected
const removeMember = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const member = trip.members.find(m => (m._id || m.user)?.toString() === req.params.memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    trip.members = trip.members.filter(m => (m._id || m.user)?.toString() !== req.params.memberId);
    trip.activityFeed.unshift({
      user: req.user.name,
      action: `removed ${member.name}`,
      timestamp: new Date()
    });

    const updated = await trip.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error removing member' });
  }
};

// @desc    Update member role
// @route   PUT /api/trips/:id/members/:memberId
// @access  Protected
const updateMemberRole = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const member = trip.members.find(m => (m._id || m.user)?.toString() === req.params.memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    member.role = req.body.role;
    trip.activityFeed.unshift({
      user: req.user.name,
      action: `changed ${member.name}'s role to ${req.body.role}`,
      timestamp: new Date()
    });

    const updated = await trip.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating member role' });
  }
};

// @desc    Import a new trip and itinerary
// @route   POST /api/trips/import
// @access  Protected
const importTrip = async (req, res) => {
  try {
    const { title, destination, startDate, endDate, budget, currency, days, publishToExplore } = req.body;
    const Itinerary = require('../models/Itinerary'); // Import here to avoid circular dep issues if any

    // 1. Create the Trip
    const trip = await Trip.create({
      title,
      destination,
      startDate,
      endDate,
      budget: budget || 0,
      currency: currency || 'INR',
      visibility: 'private',
      status: 'planning',
      owner: req.user._id,
      members: [{
        user: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        role: 'admin',
        joinedAt: new Date(),
        online: false
      }],
      activityFeed: [{
        user: req.user.name,
        action: 'imported a trip',
        timestamp: new Date()
      }]
    });

    // 2. Create the associated Itinerary with the parsed days/activities
    if (days && Array.isArray(days)) {
      await Itinerary.create({
        trip: trip._id,
        days: days
      });
      
      // 3. Automatically publish as a public Template for the Explore page (if requested)
      if (publishToExplore !== false) {
        const Template = require('../models/Template');
        try {
          await Template.create({
            title: title || 'Imported Itinerary',
            destination: destination || 'Unknown',
            description: 'This itinerary was imported and automatically published to the community.',
            duration: days.length || 1,
            estimatedBudget: budget || 0,
            currency: currency || 'INR',
            author: req.user._id,
            authorName: req.user.name,
            authorAvatar: req.user.avatar,
            isPublic: true,
            days: days
          });
        } catch (templateError) {
          console.error('Failed to auto-publish template during import:', templateError);
          // We don't fail the entire import if template creation fails
        }
      }
    }

    res.status(201).json(trip);
  } catch (error) {
    console.error('Import trip error:', error);
    res.status(500).json({ message: 'Server error importing trip' });
  }
};

module.exports = { getTrips, createTrip, getTripById, updateTrip, deleteTrip, addMember, removeMember, updateMemberRole, importTrip };
