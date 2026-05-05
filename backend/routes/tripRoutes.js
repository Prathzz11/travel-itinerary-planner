const express = require('express');
const router = express.Router();
const {
  getTrips, createTrip, getTripById, updateTrip, deleteTrip,
  addMember, removeMember, updateMemberRole, importTrip
} = require('../controllers/tripController');
const { getSettlements, createSettlement, deleteSettlement } = require('../controllers/settlementController');
const { getItinerary, updateItinerary } = require('../controllers/itineraryController');
const { getExpenses, createExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const { getBookings, createBooking, updateBooking, deleteBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

// All trip routes are protected
router.use(protect);

// Trips
router.get('/', getTrips);
router.post('/', createTrip);
router.post('/import', importTrip);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

// Members
router.post('/:id/members', addMember);
router.put('/:id/members/:memberId', updateMemberRole);
router.delete('/:id/members/:memberId', removeMember);

// Itinerary
router.get('/:id/itinerary', getItinerary);
router.put('/:id/itinerary', updateItinerary);

// Expenses
router.get('/:id/expenses', getExpenses);
router.post('/:id/expenses', createExpense);
router.put('/:id/expenses/:expenseId', updateExpense);
router.delete('/:id/expenses/:expenseId', deleteExpense);

// Bookings
router.get('/:id/bookings', getBookings);
router.post('/:id/bookings', createBooking);
router.put('/:id/bookings/:bookingId', updateBooking);
router.delete('/:id/bookings/:bookingId', deleteBooking);

// Settlements
router.get('/:id/settlements', getSettlements);
router.post('/:id/settlements', createSettlement);
router.delete('/:id/settlements/:settlementId', deleteSettlement);

module.exports = router;
