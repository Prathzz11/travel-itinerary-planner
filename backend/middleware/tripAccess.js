const mongoose = require('mongoose');
const Trip = require('../models/Trip');

// Authentication alone does not grant access to another user's trip.
const tripAccess = (permission = 'read') => async (req, res, next) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(400).json({ message: 'Invalid trip ID' });
  }
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    const userId = req.user._id.toString();
    const owner = trip.owner.toString() === userId;
    const member = trip.members.find(m => m.user?.toString() === userId);
    const allowed = owner || (member && (
      permission === 'read' ||
      (permission === 'write' && ['admin', 'editor'].includes(member.role)) ||
      (permission === 'admin' && member.role === 'admin')
    ));
    if (!allowed) return res.status(403).json({ message: 'Access denied' });
    req.trip = trip;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { tripAccess };
