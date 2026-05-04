const express = require('express');
const router = express.Router();
const { getPublicItineraries, getPublicItineraryById } = require('../controllers/itineraryController');

// Public routes — no auth needed
router.get('/', getPublicItineraries);
router.get('/:id', getPublicItineraryById);

module.exports = router;
