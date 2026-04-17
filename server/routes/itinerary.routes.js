const express = require('express');
const {
  getPublicItineraries,
  getPublicItineraryById,
  forkItinerary,
  addReview,
  getReviews,
  getMyTemplates,
  updateTemplate,
  getRelatedItineraries,
} = require('../controllers/itinerary.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Static/specific routes must come before parameterised routes to avoid conflicts
router.get('/public', getPublicItineraries);
router.get('/my-templates', protect, getMyTemplates);
router.get('/related/:id', getRelatedItineraries);
router.get('/public/:id', getPublicItineraryById);

router.post('/:id/fork', protect, forkItinerary);
router.post('/:id/review', protect, addReview);
router.get('/:id/reviews', getReviews);
router.put('/:id/template', protect, updateTemplate);

module.exports = router;
