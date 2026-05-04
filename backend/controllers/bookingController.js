const Booking = require('../models/Booking');

// @desc    Get all bookings for a trip
// @route   GET /api/trips/:id/bookings
// @access  Protected
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ trip: req.params.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching bookings' });
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
    res.status(500).json({ message: 'Server error creating booking' });
  }
};

// @desc    Update a booking
// @route   PUT /api/trips/:id/bookings/:bookingId
// @access  Protected
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Server error updating booking' });
  }
};

// @desc    Delete a booking
// @route   DELETE /api/trips/:id/bookings/:bookingId
// @access  Protected
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting booking' });
  }
};

module.exports = { getBookings, createBooking, updateBooking, deleteBooking };
