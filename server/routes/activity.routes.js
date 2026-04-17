const express = require('express');
const {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  reorderActivities,
} = require('../controllers/activity.controller');
const { protect } = require('../middleware/auth.middleware');

// mergeParams: true allows access to :tripId and :dayId from parent routers
const router = express.Router({ mergeParams: true });

router.use(protect);

// NOTE: /reorder must be declared before /:activityId to avoid route conflicts
router.put('/reorder', reorderActivities);

router.get('/', getActivities);
router.post('/', createActivity);
router.put('/:activityId', updateActivity);
router.delete('/:activityId', deleteActivity);

module.exports = router;
