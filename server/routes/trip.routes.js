const express = require('express');
const {
  getTrips,
  createTrip,
  getTripById,
  updateTrip,
  deleteTrip,
  updateMembers,
  toggleVisibility,
} = require('../controllers/trip.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// All trip routes require authentication
router.use(protect);

router.get('/', getTrips);
router.post('/', createTrip);

// getTripById allows optional auth so public trips can be fetched without a token,
// but we use protect here since the controller handles public/private logic.
// For truly unauthenticated access to public trips use the itinerary routes.
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.put('/:id/members', updateMembers);
router.put('/:id/visibility', toggleVisibility);

module.exports = router;
