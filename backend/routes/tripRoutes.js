const { tripTransaction } = require('../middleware/tripTransaction');
const express = require('express');
const router = express.Router();
const {
  getTrips, createTrip, getTripById, updateTrip, deleteTrip,
  addMember, removeMember, updateMemberRole, importTrip
} = require('../controllers/tripController');
const { getSettlements, createSettlement, updateSettlement, deleteSettlement } = require('../controllers/settlementController');
const { getItinerary, updateItinerary } = require('../controllers/itineraryController');
const { getExpenses, createExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const { getBookings, createBooking, updateBooking, deleteBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { tripAccess } = require('../middleware/tripAccess');

// All trip routes are protected
router.use(protect);

// Trips
router.get('/', getTrips);
router.post('/', createTrip);
router.post('/import', importTrip);
router.get('/:id', tripAccess('read'), getTripById);
router.put('/:id', tripAccess('admin'), tripTransaction('admin', updateTrip));
router.delete('/:id', tripAccess('admin'), tripTransaction('admin', deleteTrip));

// Members
router.post('/:id/members', tripAccess('admin'), tripTransaction('admin', addMember));
router.put('/:id/members/:memberId', tripAccess('admin'), tripTransaction('admin', updateMemberRole));
router.delete('/:id/members/:memberId', tripAccess('admin'), tripTransaction('admin', removeMember));

// Itinerary
router.get('/:id/itinerary', tripAccess('read'), getItinerary);
router.put('/:id/itinerary', tripAccess('write'), tripTransaction('write', updateItinerary));

// Expenses
router.get('/:id/expenses', tripAccess('read'), getExpenses);
router.post('/:id/expenses', tripAccess('write'), tripTransaction('write', createExpense));
router.put('/:id/expenses/:expenseId', tripAccess('write'), tripTransaction('write', updateExpense));
router.delete('/:id/expenses/:expenseId', tripAccess('write'), tripTransaction('write', deleteExpense));

// Bookings
router.get('/:id/bookings', tripAccess('read'), getBookings);
router.post('/:id/bookings', tripAccess('write'), tripTransaction('write', createBooking));
router.put('/:id/bookings/:bookingId', tripAccess('write'), tripTransaction('write', updateBooking));
router.delete('/:id/bookings/:bookingId', tripAccess('write'), tripTransaction('write', deleteBooking));

// Settlements
router.get('/:id/settlements', tripAccess('read'), getSettlements);
router.post('/:id/settlements', tripAccess('write'), tripTransaction('write', createSettlement));
router.put('/:id/settlements/:settlementId', tripAccess('write'), tripTransaction('write', updateSettlement));
router.delete('/:id/settlements/:settlementId', tripAccess('write'), tripTransaction('write', deleteSettlement));

module.exports = router;
