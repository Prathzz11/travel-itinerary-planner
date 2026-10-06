const { controllerError } = require('../utils/controllerError');
const Booking = require('../models/Booking');

// @desc    Get all bookings for a trip
// @route   GET /api/trips/:id/bookings
// @access  Protected
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ trip: req.params.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    controllerError(res, error, 'Server error fetching bookings');
  }
};

// @desc    Create a booking
// @route   POST /api/trips/:id/bookings
// @access  Protected
const createBooking = async (req, res) => {
  try {
    const { type, title, confirmationNumber, provider, status, checkIn, checkOut, amount, currency, notes, attachmentUrl } = req.body;

    const booking = await Booking.create({
      trip: req.params.id,
      type,
      title,
      confirmationNumber: confirmationNumber || '',
      provider: provider || '',
      status: status || 'pending',
      checkIn,
      checkOut,
      amount: amount || 0,
      currency: currency || 'INR',
      notes: notes || '',
      attachmentUrl: attachmentUrl || ''
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    controllerError(res, error, 'Server error creating booking');
  }
};

// @desc    Update a booking
// @route   PUT /api/trips/:id/bookings/:bookingId
// @access  Protected
const updateBooking = async (req, res) => {
  try {
    const fields = ['type', 'title', 'confirmationNumber', 'provider', 'status', 'checkIn', 'checkOut', 'amount', 'currency', 'notes', 'attachmentUrl'];
    const updates = Object.fromEntries(fields.filter(field => req.body[field] !== undefined).map(field => [field, req.body[field]]));
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.bookingId, trip: req.params.id },
      updates,
      { new: true, runValidators: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    controllerError(res, error, 'Server error updating booking');
  }
};

// @desc    Delete a booking
// @route   DELETE /api/trips/:id/bookings/:bookingId
// @access  Protected
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({ _id: req.params.bookingId, trip: req.params.id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    controllerError(res, error, 'Server error deleting booking');
  }
};

module.exports = { getBookings, createBooking, updateBooking, deleteBooking };
