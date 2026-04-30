const Review = require('../models/Review');
const Template = require('../models/Template');

// @desc    Get reviews for a public itinerary template
// @route   GET /api/reviews/template/:templateId
// @access  Public
const getReviewsForTemplate = async (req, res) => {
  try {
    const reviews = await Review.find({ templateId: req.params.templateId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
};

// @desc    Add a review
// @route   POST /api/reviews/template/:templateId
// @access  Protected
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const templateId = req.params.templateId;

    // Check if user already reviewed
    const existingReview = await Review.findOne({ templateId, author: req.user._id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this itinerary' });
    }

    const review = await Review.create({
      templateId,
      author: req.user._id,
      authorName: req.user.name,
      authorAvatar: req.user.avatar,
      rating,
      comment
    });

    // Update template rating stats
    const reviews = await Review.find({ templateId });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    
    await Template.findByIdAndUpdate(templateId, {
      rating: avgRating.toFixed(1),
      reviewCount: reviews.length
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating review' });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Protected
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;

    const updatedReview = await review.save();

    // Update template rating stats
    const reviews = await Review.find({ templateId: review.templateId });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    
    await Template.findByIdAndUpdate(review.templateId, {
      rating: avgRating.toFixed(1)
    });

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating review' });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Protected
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized' });
    }

    const templateId = review.templateId;
    await review.deleteOne();

    // Update template rating stats
    const reviews = await Review.find({ templateId });
    const avgRating = reviews.length > 0 
      ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length 
      : 0;
    
    await Template.findByIdAndUpdate(templateId, {
      rating: avgRating.toFixed(1),
      reviewCount: reviews.length
    });

    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting review' });
  }
};

// @desc    Toggle helpful vote on a review
// @route   PUT /api/reviews/:id/helpful
// @access  Protected
const toggleHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const hasVoted = review.helpfulVotes.includes(req.user._id);

    if (hasVoted) {
      // Remove vote
      review.helpfulVotes = review.helpfulVotes.filter(
        id => id.toString() !== req.user._id.toString()
      );
      review.helpfulCount -= 1;
    } else {
      // Add vote
      review.helpfulVotes.push(req.user._id);
      review.helpfulCount += 1;
    }

    const updatedReview = await review.save();
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Server error toggling helpful vote' });
  }
};

module.exports = {
  getReviewsForTemplate,
  addReview,
  updateReview,
  deleteReview,
  toggleHelpful
};
