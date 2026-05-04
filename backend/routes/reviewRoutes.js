const express = require('express');
const router = express.Router();
const {
  getReviewsForTemplate,
  addReview,
  updateReview,
  deleteReview,
  toggleHelpful
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.route('/template/:templateId')
  .get(getReviewsForTemplate)
  .post(protect, addReview);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

router.route('/:id/helpful')
  .put(protect, toggleHelpful);

module.exports = router;
