const express = require('express');
const { getDays, createDay, updateDay, deleteDay } = require('../controllers/day.controller');
const { protect } = require('../middleware/auth.middleware');

// mergeParams: true allows access to :tripId from the parent router
const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/', getDays);
router.post('/', createDay);
router.put('/:dayId', updateDay);
router.delete('/:dayId', deleteDay);

module.exports = router;
