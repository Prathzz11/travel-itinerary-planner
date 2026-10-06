const { withSpending } = require('../utils/tripSpending');
const { controllerError } = require('../utils/controllerError');
const Trip = require('../models/Trip');
const { syncTemplate } = require('../utils/syncTemplate');
const User = require('../models/User');
const { importDays } = require('../utils/importDays');
const { tripDays } = require('../utils/tripDays');

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

    res.json(await withSpending(trips));
  } catch (error) {
    console.error('Get trips error:', error);
    controllerError(res, error, 'Server error fetching trips');
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

    await syncTemplate(trip);
    res.status(201).json(trip);
  } catch (error) {
    console.error('Create trip error:', error);
    controllerError(res, error, 'Server error creating trip');
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

    res.json((await withSpending([trip]))[0]);
  } catch (error) {
    controllerError(res, error, 'Server error fetching trip');
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

    const Itinerary = require('../models/Itinerary');
    const itinerary = await Itinerary.findOne({ trip: trip._id });
    let days;
    if (req.body.startDate !== undefined || req.body.endDate !== undefined) {
      days = tripDays(req.body.startDate || trip.startDate, req.body.endDate || trip.endDate, itinerary?.days || []);
    }

    if (req.body.currency !== undefined && req.body.currency !== trip.currency) return res.status(400).json({message: 'Trip currency is fixed after creation. Create a new trip to use a different currency.'});

    const allowedFields = ['title', 'destination', 'startDate', 'endDate', 'image', 'budget', 'currency', 'visibility', 'status'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) trip[field] = req.body[field];
    });

    trip.activityFeed.unshift({
      user: req.user.name,
      action: 'updated trip details',
      timestamp: new Date()
    });

    const updated = await trip.save();
    if (itinerary && days) { itinerary.days = days; await itinerary.save(); }
    await syncTemplate(updated);
    res.json((await withSpending([updated]))[0]);
  } catch (error) {
    controllerError(res, error, 'Server error updating trip');
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

    // Operations in one transaction must run sequentially.
    await require('../models/Expense').deleteMany({ trip: trip._id });
    await require('../models/Booking').deleteMany({ trip: trip._id });
    await require('../models/Itinerary').deleteMany({ trip: trip._id });
    await require('../models/Template').updateMany({ sourceTrip: trip._id }, { isPublic: false });
    await trip.deleteOne();
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    controllerError(res, error, 'Server error deleting trip');
  }
};

// @desc    Add member to a trip
// @route   POST /api/trips/:id/members
// @access  Protected
const addMember = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const { name, role, avatar } = req.body;
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Member name and valid email are required' });
    if (role && !['admin', 'editor', 'viewer'].includes(role)) return res.status(400).json({ message: 'Invalid member role' });
    const registeredUser = await User.findOne({ email });

    const alreadyMember = trip.members.some(m => m.email === email);
    if (alreadyMember) {
      return res.status(400).json({ message: 'This person is already a member' });
    }

    trip.members.push({ user: registeredUser?._id, name, email, role: role || 'viewer', avatar: avatar || '', joinedAt: new Date() });
    trip.activityFeed.unshift({
      user: req.user.name,
      action: `invited ${name}`,
      timestamp: new Date()
    });

    const updated = await trip.save();
    res.json((await withSpending([updated]))[0]);
  } catch (error) {
    console.error('Error adding member:', error);
    controllerError(res, error, 'Server error adding member');
  }
};

// @desc    Remove member from a trip
// @route   DELETE /api/trips/:id/members/:memberId
// @access  Protected
const removeMember = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const targetId = req.params.memberId;
    const member = trip.members.find(m => m._id?.toString() === targetId || m.user?.toString() === targetId);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (member.user?.toString() === trip.owner.toString()) {
      return res.status(400).json({ message: 'The trip owner cannot be removed or demoted' });
    }

    // Never rewrite financial history as a side effect of removing a member.
    const Expense = require('../models/Expense');
    const aliases = [String(member._id), member.user && String(member.user)].filter(Boolean);
    const references = value => aliases.includes(String(value?.userId || '')) ||
      (!value?.userId && value?.name === member.name);
    const expenses = await Expense.find({trip:trip._id});
    const hasExpenses = expenses.some(e => references(e.paidBy) || e.splitAmong.some(references));
    const hasPayments = trip.settlements.some(p => aliases.includes(String(p.payerId)) || aliases.includes(String(p.payeeId)));
    if (hasExpenses || hasPayments) return res.status(409).json({message: `Cannot remove ${member.name} while expenses or payments reference them. Update those records explicitly first; their shares will not be reassigned automatically.`});

    const updated = await Trip.findOneAndUpdate(
      {_id:trip._id,__v:trip.__v},
      {$pull:{members:{_id:member._id}},$push:{activityFeed:{user:req.user.name,action:`removed ${member.name}`,timestamp:new Date()}},$inc:{__v:1}},
      {new:true,runValidators:true}
    );
    if (!updated) return res.status(409).json({message:'Trip changed during member removal. Refresh and try again.'});
    res.json((await withSpending([updated]))[0]);
  } catch (error) {
    console.error(error);
    controllerError(res, error, 'Server error removing member');
  }
};

// @desc    Update member role
// @route   PUT /api/trips/:id/members/:memberId
// @access  Protected
const updateMemberRole = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const targetId = req.params.memberId;
    const member = trip.members.find(m => m._id?.toString() === targetId || m.user?.toString() === targetId);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (member.user?.toString() === trip.owner.toString()) {
      return res.status(400).json({ message: 'The trip owner cannot be removed or demoted' });
    }

    if (!['admin', 'editor', 'viewer'].includes(req.body.role)) return res.status(400).json({ message: 'Invalid member role' });
    member.role = req.body.role;
    trip.activityFeed.unshift({
      user: req.user.name,
      action: `changed ${member.name}'s role to ${req.body.role}`,
      timestamp: new Date()
    });

    const updated = await trip.save();
    res.json((await withSpending([updated]))[0]);
  } catch (error) {
    controllerError(res, error, 'Server error updating member role');
  }
};

// @desc    Import a new trip and itinerary
// @route   POST /api/trips/import
// @access  Protected
const importTrip = async (req, res) => {
  try {
    const { title, destination, startDate, endDate, budget, currency, days, publishToExplore, image, imageCredit, sources, planningTips } = req.body;
    const Itinerary = require('../models/Itinerary'); // Import here to avoid circular dep issues if any

    const normalizedDays = tripDays(startDate, endDate, importDays(days ?? [], startDate, endDate));
    // Validate the itinerary before creating a trip, avoiding partial imports on bad input.
    await new Itinerary({ trip: new (require('mongoose').Types.ObjectId)(), days: normalizedDays }).validate();

    // 1. Create the Trip
    const trip = await Trip.create({
      title,
      destination,
      image, imageCredit, sources, planningTips,
      startDate,
      endDate,
      budget: budget || 0,
      activitiesCount: normalizedDays.reduce((count, day) => count + (day.activities?.length || 0), 0),
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
      try {
        await Itinerary.create({ trip: trip._id, days: normalizedDays });
      } catch (error) {
        await Trip.deleteOne({ _id: trip._id });
        throw error;
      }
      
      // 3. Automatically publish as a public Template for the Explore page (if requested)
      if (publishToExplore === true) {
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
            days: normalizedDays.map((day, index) => ({ dayNumber: index + 1, title: day.title || `Day ${index + 1}`, activities: day.activities }))
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
    controllerError(res, error, 'Server error importing trip');
  }
};

module.exports = { getTrips, createTrip, getTripById, updateTrip, deleteTrip, addMember, removeMember, updateMemberRole, importTrip };
